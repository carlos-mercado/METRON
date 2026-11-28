import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './Auth';
import { bases, estimateMissing, localDate, lookupBarcode, nutrients, portions, totals, units, unitsFor, validFood } from './nutrition';
import type { Basis, Food, Nutrient, Unit } from './nutrition';
import zxingWasm from 'zxing-wasm/reader/zxing_reader.wasm?url';
import './styles/Nutrition.css';
import './styles/StartWorkout.css';

type Detector = { detect(source: HTMLVideoElement): Promise<{ rawValue: string }[]> };
// Grocery packaging only uses these symbologies; skipping the rest makes each frame much cheaper to decode.
const formats = ['ean_13', 'ean_8', 'upc_a', 'upc_e'];
let detector: Promise<Detector> | undefined;
function loadDetector() {
  detector ??= (async () => {
    const Native = (window as { BarcodeDetector?: { new(options: { formats: string[] }): Detector; getSupportedFormats(): Promise<string[]> } }).BarcodeDetector;
    if (Native && (await Native.getSupportedFormats().catch((): string[] => [])).includes('ean_13')) return new Native({ formats });
    const { BarcodeDetector, prepareZXingModule } = await import('barcode-detector/ponyfill');
    // Serve the decoder from this app rather than the package's default CDN.
    await prepareZXingModule({ overrides: { locateFile: (path: string, prefix: string) => path.endsWith('.wasm') ? zxingWasm : prefix + path }, fireImmediately: true });
    return new BarcodeDetector({ formats: formats as never });
  })();
  detector.catch(() => { detector = undefined; });
  return detector;
}

// `auto` names the nutrient that was estimated rather than typed, so it can be recomputed or replaced.
type Draft = Record<Nutrient | 'name' | 'quantity' | 'servingSize', string> & { basis: Basis; unit: Unit; servingUnit: 'g' | 'ml'; auto?: Nutrient };
const empty: Draft = { name: '', calories: '', protein: '', carbs: '', fat: '', quantity: '1', unit: 'servings', basis: 'serving', servingSize: '', servingUnit: 'g' };
const portion = (draft: Draft) => ({ basis: draft.basis, servingSize: Number(draft.servingSize) > 0 ? Number(draft.servingSize) : undefined, servingUnit: draft.servingUnit });
// Keep the chosen unit for the amount eaten while it still converts; otherwise fall back to the basis's unit.
function withPortion(draft: Draft): Draft {
  return unitsFor(portion(draft)).includes(draft.unit) ? draft : { ...draft, unit: bases[draft.basis].unit, quantity: String(bases[draft.basis].per) };
}
function autofill(draft: Draft): Draft {
  const estimate = estimateMissing(draft);
  return estimate ? { ...draft, [estimate.key]: estimate.value, auto: estimate.key } : draft;
}

export default function Nutrition() {
  const { userId } = useAuth();
  return userId ? <NutritionLog key={userId} userId={userId} /> : <p>Please sign in to track nutrition.</p>;
}
function NutritionLog({ userId }: { userId: string }) {
  const navigate = useNavigate();
  const [date, setDate] = useState(localDate);
  const [foods, setFoods] = useState<Food[]>([]);
  const [draft, setDraft] = useState<Draft>(empty);
  const [editing, setEditing] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [saveError, setSaveError] = useState('');
  const [notice, setNotice] = useState('');
  const [loaded, setLoaded] = useState(false);
  const [barcode, setBarcode] = useState('');
  const [busy, setBusy] = useState(false);
  const [scanning, setScanning] = useState(false);
  const video = useRef<HTMLVideoElement>(null);
  const lookup = useRef<AbortController | null>(null);
  const storageKey = `metron-nutrition-v1:${userId}:${date}`;

  useEffect(() => {
    lookup.current?.abort();
    lookup.current = null;
    setBusy(false); setScanning(false); setDraft(empty); setEditing(null); setError(''); setSaveError(''); setNotice(''); setLoaded(false);
    try {
      const saved: unknown = JSON.parse(localStorage.getItem(storageKey) ?? '[]');
      if (!Array.isArray(saved) || !saved.every(validFood)) throw new Error('Invalid saved data');
      setFoods(saved); setLoaded(true);
    } catch { setFoods([]); setError('Unable to read saved entries. Saving is disabled to protect your data.'); }
  }, [storageKey]);
  useEffect(() => () => { lookup.current?.abort(); }, []);
  // Fetch the scanner ahead of time so pressing Scan barcode starts decoding immediately.
  useEffect(() => { loadDetector().catch(() => {}); }, []);

  async function findFood(code = barcode) {
    lookup.current?.abort();
    const controller = new AbortController(); lookup.current = controller;
    const timeout = window.setTimeout(() => controller.abort(), 15000);
    setBusy(true); setError(''); setSaveError(''); setNotice('');
    try {
      const food = await lookupBarcode(code.trim(), controller.signal);
      if (lookup.current !== controller) return;
      const found: Draft = { ...empty, ...food, basis: '100g', unit: 'g', quantity: '100' };
      // With a serving size on file, default to one serving rather than 100 g.
      setDraft(autofill(unitsFor(portion(found)).includes('servings') ? { ...found, unit: 'servings', quantity: '1' } : found)); setEditing(null);
      setNotice('Food found. Review the nutrition and amount eaten, then press Add food.');
    } catch (err) {
      if (lookup.current === controller) setError(controller.signal.aborted ? 'Lookup timed out. Try again or enter manually.' : (err as Error).message);
    } finally {
      window.clearTimeout(timeout);
      if (lookup.current === controller) { lookup.current = null; setBusy(false); }
    }
  }

  useEffect(() => {
    if (!scanning) return;
    let cancelled = false;
    let stream: MediaStream | undefined;
    let timer: number | undefined;
    const stop = () => { window.clearTimeout(timer); stream?.getTracks().forEach(track => track.stop()); };
    async function start() {
      try {
        if (!window.isSecureContext) throw new Error('Camera access requires HTTPS or localhost. Open the app using HTTPS.');
        if (!navigator.mediaDevices?.getUserMedia) throw new Error('Camera access is unavailable in this browser. Type the barcode below.');
        const detectorReady = loadDetector();
        // Low default resolutions blur small barcodes, so ask for HD from the rear camera.
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' }, width: { ideal: 1920 }, height: { ideal: 1080 } }, audio: false,
        });
        if (cancelled || !video.current) { stop(); return; }
        const [track] = stream.getVideoTracks();
        if ((track.getCapabilities?.() as { focusMode?: string[] } | undefined)?.focusMode?.includes('continuous'))
          track.applyConstraints({ advanced: [{ focusMode: 'continuous' } as MediaTrackConstraintSet] }).catch(() => {});
        video.current.srcObject = stream;
        await video.current.play();
        const detector = await detectorReady;
        if (cancelled) { stop(); return; }
        const scan = async () => {
          if (cancelled || !video.current) return;
          try {
            if (video.current.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
              const code = (await detector.detect(video.current)).map(found => found.rawValue).find(value => /^\d{8,14}$/.test(value));
              if (code && !cancelled) { cancelled = true; stop(); setScanning(false); setBarcode(code); void findFood(code); return; }
            }
          } catch { /* A frame can fail to decode while the camera adjusts; try the next one. */ }
          if (!cancelled) timer = window.setTimeout(scan, 100);
        };
        void scan();
      } catch (err) {
        stop();
        if (!cancelled) {
          setScanning(false);
          const name = (err as Error).name;
          setError(name === 'NotAllowedError' ? 'Camera permission was denied. Allow camera access in browser settings, then try again.'
            : name === 'NotFoundError' ? 'No camera was found. Type the barcode below.'
            : name === 'NotReadableError' ? 'Camera is busy or unavailable. Close other camera apps and try again.'
            : (err as Error).message);
        }
      }
    }
    void start();
    return () => { cancelled = true; stop(); };
    // The scan starts only when explicitly requested; lookup reads the detected code.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scanning]);

  function persist(next: Food[]) {
    try { localStorage.setItem(storageKey, JSON.stringify(next)); setFoods(next); setError(''); return true; }
    catch { setError('Unable to save. Browser storage may be full or disabled.'); return false; }
  }
  function setNutrient(key: Nutrient, value: string) {
    // Typing over the estimate keeps the typed value; changing another field recomputes the estimate.
    const next: Draft = { ...draft, [key]: value, auto: undefined };
    if (draft.auto === key) { setDraft(next); return; }
    if (draft.auto) next[draft.auto] = '';
    const filled = autofill(next);
    setDraft(filled.auto === key ? next : filled);
  }
  function save(event: FormEvent) {
    event.preventDefault();
    setSaveError(''); setNotice('');
    if (!loaded) { setSaveError('Saved entries could not be loaded. Adding food is disabled to protect your data.'); return; }
    // A barcode alone should load a product for review instead of silently failing validation.
    if (!editing && barcode.trim() && !draft.name.trim() && nutrients.every(key => !draft[key].trim())) {
      void findFood();
      return;
    }
    const missing = [!draft.name.trim() ? 'food name' : '', ...nutrients.filter(key => !draft[key].trim())].filter(Boolean);
    if (missing.length) { setSaveError(`Enter ${missing.join(', ')} before adding food. For a barcode, press Look up to fill in the nutrition first.`); return; }
    const servingSize = draft.servingSize.trim() ? Number(draft.servingSize) : undefined;
    const food: Food = { id: editing ?? '', name: draft.name.trim(), basis: draft.basis,
      quantity: Number(draft.quantity), unit: draft.unit, ...(servingSize === undefined ? {} : { servingSize, servingUnit: draft.servingUnit }), calories: Number(draft.calories), protein: Number(draft.protein), carbs: Number(draft.carbs), fat: Number(draft.fat) };
    if (!validFood(food)) { setSaveError('Nutrition values must be zero or greater, and the amount eaten and serving size must be positive numbers.'); return; }
    // randomUUID is unavailable on some browsers and HTTP development hosts.
    food.id = editing ?? (typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : Array.from(crypto.getRandomValues(new Uint32Array(4)), part => part.toString(16).padStart(8, '0')).join(''));
    if (persist(editing ? foods.map(item => item.id === editing ? food : item) : [...foods, food])) {
      setNotice(`${food.name} ${editing ? 'updated' : 'added'} to the food log.`);
      setDraft(empty); setEditing(null); setBarcode('');
    } else { setSaveError('Unable to save. Browser storage may be full or disabled.'); }
  }
  const sum = totals(foods);
  const format = (number: number) => number.toLocaleString(undefined, { maximumFractionDigits: 1 });
  return <><main className="nutrition">
    <label className="nutritionDate">Day <input type="date" value={date} onChange={event => { if (event.target.value) setDate(event.target.value); }} /></label>
    <div className="nutritionTotals" aria-live="polite">{nutrients.map(key => <div key={key}><strong>{format(sum[key])}{key === 'calories' ? ' kcal' : ' g'}</strong><span>{key}</span></div>)}</div>
    <p className="nutritionNote">Saved in this browser. Entries do not sync across devices.</p>
    {error && <p role="alert">{error}</p>}
    <section className="nutritionPanel" aria-label="Barcode lookup">
      <div className="nutritionActions"><button disabled={busy} onClick={() => { setError(''); setScanning(!scanning); }}>{scanning ? 'Stop camera' : 'Scan barcode'}</button></div>
      {scanning && <video ref={video} muted playsInline aria-label="Barcode camera" />}
      <form className="nutritionBarcode" onSubmit={event => { event.preventDefault(); void findFood(); }}>
        <label>Barcode<input inputMode="numeric" value={barcode} onChange={event => setBarcode(event.target.value)} placeholder="Barcode number" /></label>
        <button disabled={busy || scanning}>{busy ? 'Looking up…' : 'Look up'}</button>
      </form>
      <small>Product data from <a href="https://world.openfoodfacts.org" target="_blank" rel="noreferrer">Open Food Facts</a> (<a href="https://opendatacommons.org/licenses/odbl/1-0/">ODbL</a>). Review values before saving. Lookup values are per 100 g; for liquids labeled per 100 ml, change the basis below. Fill in any missing values from the label.</small>
    </section>
    <form className="nutritionPanel nutritionForm" onSubmit={save} noValidate>
      <h2>{editing ? 'Edit food' : 'Add food'}</h2>
      <label>Food name<input required value={draft.name} onChange={event => setDraft({ ...draft, name: event.target.value })} /></label>
      <label>Nutrition values per<select value={draft.basis} onChange={event => setDraft(withPortion({ ...draft, basis: event.target.value as Basis }))}>{Object.entries(bases).map(([value, { label }]) => <option key={value} value={value}>{label}</option>)}</select></label>
      <div className="nutritionAmount">
        <label>Serving size (optional)<input type="number" min="0" step="any" value={draft.servingSize} onChange={event => setDraft(withPortion({ ...draft, servingSize: event.target.value }))} placeholder="e.g. 28" /></label>
        <label>Unit<select value={draft.servingUnit} onChange={event => setDraft(withPortion({ ...draft, servingUnit: event.target.value as Draft['servingUnit'] }))}><option value="g">g</option><option value="ml">ml</option></select></label>
      </div>
      <small>The gram or milliliter weight printed on the label, e.g. 28 for "Serving size 1 oz (28 g)". It lets you log this food in servings or by weight.</small>
      <div className="nutritionFields">{nutrients.map(key => <label key={key}>{key === 'calories' ? 'Calories (kcal)' : `${key} (g)`}{draft.auto === key && <em> · estimated</em>}<input type="number" min="0" step="any" required value={draft[key]} onChange={event => setNutrient(key, event.target.value)} /></label>)}</div>
      {draft.auto && <small>{draft.auto === 'calories' ? 'Calories' : `${draft.auto[0].toUpperCase()}${draft.auto.slice(1)}`} estimated from the other values (protein and carbs 4 kcal/g, fat 9 kcal/g). Labels round, so check it against the package.</small>}
      <div className="nutritionAmount">
        <label>Amount eaten<input type="number" min="0.001" step="any" required value={draft.quantity} onChange={event => setDraft({ ...draft, quantity: event.target.value })} /></label>
        <label>Unit<select value={draft.unit} onChange={event => setDraft({ ...draft, unit: event.target.value as Unit })}>{unitsFor(portion(draft)).map(unit => <option key={unit} value={unit}>{units[unit].label}</option>)}</select></label>
      </div>
      {draft.unit !== bases[draft.basis].unit && Number(draft.quantity) > 0 && <small>Counts as {format(portions({ ...portion(draft), quantity: Number(draft.quantity), unit: draft.unit }) * bases[draft.basis].per)} {units[bases[draft.basis].unit].label}.</small>}
      {saveError && <p role="alert">{saveError}</p>}
      {notice && <p role="status">{notice}</p>}
      <div className="nutritionActions"><button disabled={busy || scanning}>{editing ? 'Save changes' : 'Add food'}</button>{editing && <button type="button" onClick={() => { setEditing(null); setDraft(empty); }}>Cancel</button>}</div>
    </form>
    <section className="nutritionPanel"><h2>Food log</h2>{foods.length === 0 && <p>No foods logged for this day.</p>}
      <ul>{foods.map(food => { const amounts = totals([food]); return <li key={food.id}>
        <div><strong>{food.name}</strong><p>{format(food.quantity)} {units[food.unit ?? bases[food.basis].unit].label} · {format(amounts.calories)} kcal</p><p>P {format(amounts.protein)} g · C {format(amounts.carbs)} g · F {format(amounts.fat)} g</p></div>
        <div className="nutritionActions"><button disabled={busy || scanning} onClick={() => { setEditing(food.id); setDraft({ name: food.name, basis: food.basis, quantity: String(food.quantity), unit: food.unit ?? bases[food.basis].unit, servingSize: food.servingSize ? String(food.servingSize) : '', servingUnit: food.servingUnit ?? 'g', calories: String(food.calories), protein: String(food.protein), carbs: String(food.carbs), fat: String(food.fat) }); }}>Edit</button><button onClick={() => { if (persist(foods.filter(item => item.id !== food.id)) && editing === food.id) { setEditing(null); setDraft(empty); } }}>Delete</button></div>
      </li>; })}</ul>
    </section>
  </main>
    <div className="nutritionBack"><button className="backButton" onClick={() => navigate('/')}>back</button></div>
  </>;
}
