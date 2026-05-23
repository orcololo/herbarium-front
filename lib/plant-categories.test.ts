import { describe, expect, it } from "vitest";
import {
  CURRENT_PLANT_CATEGORIES,
  LEGACY_PLANT_CATEGORIES,
  PLANT_CATEGORY_OPTIONS,
  plantCategoryLabel,
} from "./plant-categories";

describe("plant category contract", () => {
  const currentCategories = [
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
  ];

  const legacyCategories = [
    "trees",
    "shrubs",
    "herbs",
    "ferns",
    "grasses",
    "vines",
    "cacti",
    "aquatic",
  ];

  it("exposes the official botanical categories for dropdowns", () => {
    expect(CURRENT_PLANT_CATEGORIES).toEqual(currentCategories);
    expect(PLANT_CATEGORY_OPTIONS.map((option) => option.value)).toEqual(
      currentCategories,
    );
  });

  it("keeps legacy API values labelable without offering them for new records", () => {
    expect(LEGACY_PLANT_CATEGORIES).toEqual(legacyCategories);
    expect(plantCategoryLabel("semi_arbusto")).toBe("Semi arbusto");
    expect(plantCategoryLabel("trees")).toBe("Árvore");
    expect(PLANT_CATEGORY_OPTIONS.map((option) => option.value)).not.toContain(
      "trees",
    );
  });
});