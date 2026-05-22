import { describe, expect, it } from "vitest";
import type { Registry } from "./api";
import {
  getRegistryCardImage,
  getRegistryCoCollectorsDisplay,
  getRegistryCollectorDisplay,
  getRegistryCollectionNumber,
  getRegistryCommonName,
  getRegistrySpeciesName,
  normalizeRegistryCollectionNumber,
} from "./registry-presentation";

const baseRegistry: Registry = {
  id: "registry-1",
  uuid: "registry-uuid-1",
  registryIdentifier: "COL-2026-001",
  species: {
    id: "species-1",
    scientificName: "Mimosa pudica",
    commonName: "Dormideira",
    isActive: true,
    createdAt: "2026-05-22T00:00:00.000Z",
    updatedAt: "2026-05-22T00:00:00.000Z",
  },
  collector: {
    id: "user-1",
    name: "Ana Ribeiro",
    email: "ana@example.com",
  },
  measurements: [],
  determinations: [],
  images: [],
  audioNotes: [],
  audioTranscripts: [],
  photoMetadata: [],
  coCollectors: [],
  isDraft: false,
  duplicateUuids: [],
  photoPaths: [],
  audioNotePaths: [],
  isActive: true,
  createdAt: "2026-05-22T00:00:00.000Z",
  updatedAt: "2026-05-22T00:00:00.000Z",
};

describe("registry presentation helpers", () => {
  it("prefers uploaded thumbnails for registry card images", () => {
    const registry: Registry = {
      ...baseRegistry,
      images: [
        {
          key: "images/original.jpg",
          url: "https://cdn.example.com/original.jpg",
          thumbnailKey: "images/thumb.jpg",
          thumbnailUrl: "https://cdn.example.com/thumb.jpg",
        },
      ],
    };

    expect(getRegistryCardImage(registry)).toEqual({
      src: "https://cdn.example.com/thumb.jpg",
      alt: "Imagem do espécime Mimosa pudica",
    });
  });

  it("falls back to original image URLs when thumbnails are missing", () => {
    const registry: Registry = {
      ...baseRegistry,
      images: [
        {
          key: "images/original.jpg",
          url: "https://cdn.example.com/original.jpg",
          thumbnailKey: "",
          thumbnailUrl: "",
        },
      ],
    };

    expect(getRegistryCardImage(registry)?.src).toBe(
      "https://cdn.example.com/original.jpg",
    );
  });

  it("uses contributor names before populated collector names", () => {
    const registry: Registry = {
      ...baseRegistry,
      contributorName: "Maria Souza",
    };

    expect(getRegistryCollectorDisplay(registry)).toBe("Maria Souza");
  });

  it("normalizes co-collector names for display", () => {
    const registry: Registry = {
      ...baseRegistry,
      coCollectors: ["  Ana Ribeiro  ", "", "Bruno Costa"],
    };

    expect(getRegistryCoCollectorsDisplay(registry)).toBe(
      "Ana Ribeiro, Bruno Costa",
    );
  });

  it("omits co-collector display when there are no names", () => {
    expect(getRegistryCoCollectorsDisplay(baseRegistry)).toBeNull();
  });

  it("returns stable collection and species labels for cards", () => {
    expect(getRegistryCollectionNumber(baseRegistry)).toBe("COL-2026-001");
    expect(getRegistrySpeciesName(baseRegistry)).toBe("Mimosa pudica");
    expect(getRegistryCommonName(baseRegistry)).toBe("Dormideira");
  });

  it("normalizes editable collection numbers before saving", () => {
    expect(normalizeRegistryCollectionNumber("  COL-2026-001  ")).toBe(
      "COL-2026-001",
    );
    expect(normalizeRegistryCollectionNumber("   ")).toBeNull();
    expect(normalizeRegistryCollectionNumber(undefined)).toBeNull();
  });
});
