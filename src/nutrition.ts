export const nutrients = ['calories', 'protein', 'carbs', 'fat'] as const;
export type Nutrient = typeof nutrients[number];
export type Food = Record<Nutrient, number> & {
  id: string; name: string; basis: Basis;
  // Amount eaten, in `unit`; entries saved before units existed omit it and use the basis's own unit.
  quantity: number; unit?: Unit;
  // Optional label serving size ("1 oz (28 g)" → 28 g), which bridges servings and weight or volume.
  servingSize?: number; servingUnit?: 'g' | 'ml';
};
type Dimension = 'serving' | 'mass' | 'volume';
// `size` is in the dimension's base unit: servings, grams, or milliliters.
export const units = {
  servings: { label: 'servings', dim: 'serving', size: 1 },
  g: { label: 'g', dim: 'mass', size: 1 },
  oz: { label: 'oz', dim: 'mass', size: 28.349523125 },
  lb: { label: 'lb', dim: 'mass', size: 453.59237 },
  ml: { label: 'ml', dim: 'volume', size: 1 },
  floz: { label: 'fl oz', dim: 'volume', size: 29.5735295625 },
  cup: { label: 'cup', dim: 'volume', size: 236.5882365 },
  tbsp: { label: 'tbsp', dim: 'volume', size: 14.78676478125 },
  tsp: { label: 'tsp', dim: 'volume', size: 4.92892159375 },
} as const satisfies Record<string, { label: string; dim: Dimension; size: number }>;
export type Unit = keyof typeof units;
// Nutrition values are entered per `per` of `unit`; `unit` is also the default unit for the amount eaten.
export const bases = {
  serving: { label: 'Serving', per: 1, unit: 'servings' },
  '100g': { label: '100 g', per: 100, unit: 'g' },
  '100ml': { label: '100 ml', per: 100, unit: 'ml' },
  g: { label: '1 g', per: 1, unit: 'g' },
  ml: { label: '1 ml', per: 1, unit: 'ml' },
  oz: { label: '1 oz', per: 1, unit: 'oz' },
  floz: { label: '1 fl oz', per: 1, unit: 'floz' },
} as const satisfies Record<string, { label: string; per: number; unit: Unit }>;
export type Basis = keyof typeof bases;
type Portion = Pick<Food, 'basis' | 'servingSize' | 'servingUnit'>;
// Units the amount eaten can be entered in: the basis's own kind of unit, plus whichever kind the
// serving size links it to (servings ↔ grams for "per serving, 28 g"; grams ↔ servings for "per 100 g, 28 g").
export function unitsFor({ basis, servingSize, servingUnit }: Portion): Unit[] {
  const own = units[bases[basis].unit].dim;
  const dims = new Set<Dimension>([own]);
  if (servingSize && servingUnit) {
    const serving = units[servingUnit].dim;
    if (own === 'serving') dims.add(serving);
    else if (own === serving) dims.add('serving');
  }
  return (Object.keys(units) as Unit[]).filter(unit => dims.has(units[unit].dim));
}
// How many multiples of the basis were eaten, or NaN when the unit can't be converted.
export function portions(food: Portion & Pick<Food, 'quantity' | 'unit'>) {
  const own = bases[food.basis].unit;
  const unit = food.unit ?? own;
  if (!unitsFor(food).includes(unit)) return NaN;
  const basisAmount = bases[food.basis].per * units[own].size;
  const amount = food.quantity * units[unit].size;
  if (units[unit].dim === units[own].dim) return amount / basisAmount;
  // Cross between servings and grams/milliliters through the serving size.
  const servingSize = food.servingSize!;
  return units[unit].dim === 'serving' ? amount * servingSize / basisAmount : amount / servingSize / basisAmount;
}
export function localDate(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
export function totals(foods: Food[]) {
  return foods.reduce((sum, food) => {
    const multiplier = portions(food);
    for (const key of nutrients) sum[key] += food[key] * multiplier;
    return sum;
  }, { calories: 0, protein: 0, carbs: 0, fat: 0 });
}
const kcalPerGram = { protein: 4, carbs: 4, fat: 9 } as const;
// With exactly one value blank, estimate it from the other three using 4/4/9 kcal per gram.
// Returns null when the inputs are incomplete or imply a negative amount (e.g. fiber or alcohol on the label).
export function estimateMissing(values: Record<Nutrient, string>): { key: Nutrient; value: string } | null {
  const missing = nutrients.filter(key => !values[key].trim());
  if (missing.length !== 1) return null;
  const [key] = missing;
  const known = (name: Nutrient) => Number(values[name]);
  if (nutrients.some(name => name !== key && !(Number.isFinite(known(name)) && known(name) >= 0))) return null;
  const macros = (['protein', 'carbs', 'fat'] as const).filter(name => name !== key);
  const macroCalories = macros.reduce((sum, name) => sum + known(name) * kcalPerGram[name], 0);
  const value = key === 'calories' ? macroCalories : (known('calories') - macroCalories) / kcalPerGram[key];
  if (value < 0) return null;
  const scale = key === 'calories' ? 1 : 10;
  return { key, value: String(Math.round(value * scale) / scale) };
}
export function validFood(value: unknown): value is Food {
  if (!value || typeof value !== 'object') return false;
  const food = value as Food;
  return typeof food.id === 'string' && typeof food.name === 'string' && !!food.name.trim()
    && Object.hasOwn(bases, food.basis)
    && Number.isFinite(food.quantity) && food.quantity > 0
    && (food.servingSize === undefined || (Number.isFinite(food.servingSize) && food.servingSize > 0 && ['g', 'ml'].includes(food.servingUnit!)))
    && (food.unit === undefined || Object.hasOwn(units, food.unit)) && Number.isFinite(portions(food))
    && nutrients.every(key => Number.isFinite(food[key]) && food[key] >= 0);
}
export async function lookupBarcode(code: string, signal: AbortSignal) {
  if (!/^\d{8,14}$/.test(code)) throw new Error('Enter an 8–14 digit barcode.');
  let response: Response;
  try {
    response = await fetch(`https://world.openfoodfacts.org/api/v2/product/${code}.json?fields=product_name,nutriments,serving_quantity,serving_quantity_unit&app_name=METRON&app_version=1`, { signal });
  } catch (error) {
    if (signal.aborted) throw error;
    throw new Error('Could not connect to the food database. Check your connection and try again.');
  }
  if (response.status === 404) throw new Error('Food not found. Enter its nutrition manually.');
  if (response.status === 429) throw new Error('Too many barcode lookups. Wait a minute and try again.');
  if (!response.ok) throw new Error(`Food database returned HTTP ${response.status ?? 'error'}. Try again later or enter manually.`);
  let data;
  try { data = await response.json(); }
  catch { throw new Error('Food database returned an invalid response. Try again later.'); }
  if (data.status !== 1 || !data.product) throw new Error('Food not found. Enter its nutrition manually.');
  const product = data.product;
  const values = product.nutriments ?? {};
  const read = (key: string) => typeof values[key] === 'number' && Number.isFinite(values[key]) && values[key] >= 0 ? String(values[key]) : '';
  return {
    name: typeof product.product_name === 'string' ? product.product_name : '',
    calories: read('energy-kcal_100g'), protein: read('proteins_100g'),
    carbs: read('carbohydrates_100g'), fat: read('fat_100g'),
    // Open Food Facts sometimes sends the serving quantity as a string.
    servingSize: Number(product.serving_quantity) > 0 && Number.isFinite(Number(product.serving_quantity)) ? String(Number(product.serving_quantity)) : '',
    servingUnit: (product.serving_quantity_unit === 'ml' ? 'ml' : 'g') as 'g' | 'ml',
  };
}
