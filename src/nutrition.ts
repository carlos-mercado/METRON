export const nutrients = ['calories', 'protein', 'carbs', 'fat'] as const;
export type Nutrient = typeof nutrients[number];
export type Food = Record<Nutrient, number> & {
  id: string; name: string; quantity: number; basis: Basis;
};
// Nutrition values are entered per `per` units; the amount eaten is entered in `unit`.
export const bases = {
  serving: { label: 'Serving', per: 1, unit: 'servings', eaten: 'Servings eaten' },
  '100g': { label: '100 g', per: 100, unit: 'g', eaten: 'Grams eaten' },
  '100ml': { label: '100 ml', per: 100, unit: 'ml', eaten: 'Milliliters consumed' },
  g: { label: '1 g', per: 1, unit: 'g', eaten: 'Grams eaten' },
  ml: { label: '1 ml', per: 1, unit: 'ml', eaten: 'Milliliters consumed' },
  oz: { label: '1 oz', per: 1, unit: 'oz', eaten: 'Ounces eaten' },
} as const;
export type Basis = keyof typeof bases;
export function localDate(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
export function totals(foods: Food[]) {
  return foods.reduce((sum, food) => {
    const multiplier = food.quantity / bases[food.basis].per;
    for (const key of nutrients) sum[key] += food[key] * multiplier;
    return sum;
  }, { calories: 0, protein: 0, carbs: 0, fat: 0 });
}
export function validFood(value: unknown): value is Food {
  if (!value || typeof value !== 'object') return false;
  const food = value as Food;
  return typeof food.id === 'string' && typeof food.name === 'string' && !!food.name.trim()
    && Object.hasOwn(bases, food.basis)
    && Number.isFinite(food.quantity) && food.quantity > 0
    && nutrients.every(key => Number.isFinite(food[key]) && food[key] >= 0);
}
export async function lookupBarcode(code: string, signal: AbortSignal) {
  if (!/^\d{8,14}$/.test(code)) throw new Error('Enter an 8–14 digit barcode.');
  let response: Response;
  try {
    response = await fetch(`https://world.openfoodfacts.org/api/v2/product/${code}.json?fields=product_name,nutriments&app_name=METRON&app_version=1`, { signal });
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
  };
}
