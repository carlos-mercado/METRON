import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './Auth';
import { localDate, lookupBarcode, nutrients, totals, validFood } from './nutrition';
import type { Food } from './nutrition';
import './styles/Nutrition.css';
import './styles/StartWorkout.css';

const empty = { name: '', calories: '', protein: '', carbs: '', fat: '', quantity: '1', basis: 'serving' as Food['basis'] };

export default function Nutrition() {
  const { userId } = useAuth();
  return userId ? <NutritionLog key={userId} userId={userId} /> : <p>Please sign in to track nutrition.</p>;
}
function NutritionLog({ userId }: { userId: string }) {
  const navigate = useNavigate();
  const [date, setDate] = useState(localDate);
  const [foods, setFoods] = useState<Food[]>([]);
  const [draft, setDraft] = useState(empty);
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

  async function findFood(code = barcode) {
    lookup.current?.abort();
    const controller = new AbortController(); lookup.current = controller;
    const timeout = window.setTimeout(() => controller.abort(), 15000);
    setBusy(true); setError(''); setSaveError(''); setNotice('');
    try {
      const food = await lookupBarcode(code.trim(), controller.signal);
      if (lookup.current !== controller) return;
      setDraft({ ...empty, ...food, basis: '100g', quantity: '100' }); setEditing(null);
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
    let controls: { stop(): void } | undefined;
    const stop = () => { controls?.stop(); stream?.getTracks().forEach(track => track.stop()); };
    async function start() {
      try {
        if (!window.isSecureContext) throw new Error('Camera access requires HTTPS or localhost. Open the app using HTTPS.');
        if (!navigator.mediaDevices?.getUserMedia) throw new Error('Camera access is unavailable in this browser. Type the barcode below.');
        const { BrowserMultiFormatReader } = await import('@zxing/browser');
        if (cancelled) return;
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' } }, audio: false });
        if (cancelled || !video.current) { stop(); return; }
        const reader = new BrowserMultiFormatReader();
        controls = await reader.decodeFromStream(stream, video.current, (result, _error, scanner) => {
          if (cancelled || !result) return;
          const code = result.getText();
          if (!/^\d{8,14}$/.test(code)) return;
          cancelled = true;
          scanner.stop(); stop(); setScanning(false); setBarcode(code); void findFood(code);
        });
        if (cancelled) stop();
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
    const food: Food = { id: editing ?? '', name: draft.name.trim(), basis: draft.basis,
      quantity: Number(draft.quantity), calories: Number(draft.calories), protein: Number(draft.protein), carbs: Number(draft.carbs), fat: Number(draft.fat) };
    if (!validFood(food)) { setSaveError('Nutrition values must be zero or greater, and the amount eaten must be a positive number.'); return; }
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
      <label>Nutrition values per<select value={draft.basis} onChange={event => setDraft({ ...draft, basis: event.target.value as Food['basis'], quantity: event.target.value === 'serving' ? '1' : '100' })}><option value="serving">Serving</option><option value="100g">100 g</option><option value="100ml">100 ml</option></select></label>
      <div className="nutritionFields">{nutrients.map(key => <label key={key}>{key === 'calories' ? 'Calories (kcal)' : `${key} (g)`}<input type="number" min="0" step="any" required value={draft[key]} onChange={event => setDraft({ ...draft, [key]: event.target.value })} /></label>)}</div>
      <label>{draft.basis === 'serving' ? 'Servings eaten' : draft.basis === '100g' ? 'Grams eaten' : 'Milliliters consumed'}<input type="number" min="0.001" step="any" required value={draft.quantity} onChange={event => setDraft({ ...draft, quantity: event.target.value })} /></label>
      {saveError && <p role="alert">{saveError}</p>}
      {notice && <p role="status">{notice}</p>}
      <div className="nutritionActions"><button disabled={busy || scanning}>{editing ? 'Save changes' : 'Add food'}</button>{editing && <button type="button" onClick={() => { setEditing(null); setDraft(empty); }}>Cancel</button>}</div>
    </form>
    <section className="nutritionPanel"><h2>Food log</h2>{foods.length === 0 && <p>No foods logged for this day.</p>}
      <ul>{foods.map(food => { const amounts = totals([food]); return <li key={food.id}>
        <div><strong>{food.name}</strong><p>{format(food.quantity)} {food.basis === 'serving' ? 'servings' : food.basis === '100g' ? 'g' : 'ml'} · {format(amounts.calories)} kcal</p><p>P {format(amounts.protein)} g · C {format(amounts.carbs)} g · F {format(amounts.fat)} g</p></div>
        <div className="nutritionActions"><button disabled={busy || scanning} onClick={() => { setEditing(food.id); setDraft({ name: food.name, basis: food.basis, quantity: String(food.quantity), calories: String(food.calories), protein: String(food.protein), carbs: String(food.carbs), fat: String(food.fat) }); }}>Edit</button><button onClick={() => { if (persist(foods.filter(item => item.id !== food.id)) && editing === food.id) { setEditing(null); setDraft(empty); } }}>Delete</button></div>
      </li>; })}</ul>
    </section>
  </main>
    <div className="nutritionBack"><button className="backButton" onClick={() => navigate('/')}>back</button></div>
  </>;
}
