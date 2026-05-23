import type { PlantCategory } from "./api";

export const CURRENT_PLANT_CATEGORIES = [
  "samambaia",
  "erva",
  "semi_arbusto",
  "arbusto",
  "arvore",
  "erva_trepadeira",
  "erva_epifita",
  "hemiepifita",
  "prostrada",
  "rastejante",
  "planta_rupicola",
  "ciofila",
  "epilitica",
] as const satisfies readonly PlantCategory[];

export const LEGACY_PLANT_CATEGORIES = [
  "trees",
  "shrubs",
  "herbs",
  "ferns",
  "grasses",
  "vines",
  "cacti",
  "aquatic",
] as const satisfies readonly PlantCategory[];

export const PLANT_CATEGORY_LABELS: Record<PlantCategory, string> = {
  samambaia: "Samambaia",
  erva: "Erva",
  semi_arbusto: "Semi arbusto",
  arbusto: "Arbusto",
  arvore: "Árvore",
  erva_trepadeira: "Erva trepadeira",
  erva_epifita: "Erva epífita",
  hemiepifita: "Hemiepífita",
  prostrada: "Prostrada",
  rastejante: "Rastejante",
  planta_rupicola: "Planta rupícola",
  ciofila: "Ciófila",
  epilitica: "Epilítica",
  trees: "Árvore",
  shrubs: "Arbusto",
  herbs: "Erva",
  ferns: "Samambaia",
  grasses: "Gramíneas",
  vines: "Erva trepadeira",
  cacti: "Cactos",
  aquatic: "Aquáticas",
};

export const PLANT_CATEGORY_OPTIONS = CURRENT_PLANT_CATEGORIES.map((value) => ({
  value,
  label: PLANT_CATEGORY_LABELS[value],
}));

export function isCurrentPlantCategory(
  value: PlantCategory | string | null | undefined,
) {
  return CURRENT_PLANT_CATEGORIES.includes(value as never);
}

export function plantCategoryLabel(
  value: PlantCategory | string | null | undefined,
) {
  if (!value) return "Sem categoria";
  return PLANT_CATEGORY_LABELS[value as PlantCategory] ?? value;
}