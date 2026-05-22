import type { Registry } from "./api";

export function getRegistrySpeciesName(registry: Registry): string {
  if (typeof registry.species === "object" && registry.species !== null) {
    return registry.species.scientificName;
  }
  return "Espécie desconhecida";
}

export function getRegistryCommonName(registry: Registry): string | null {
  if (typeof registry.species === "object" && registry.species !== null) {
    return registry.species.commonName ?? null;
  }
  return null;
}

export function getRegistryCollectionNumber(registry: Registry): string {
  return registry.registryIdentifier;
}

export function normalizeRegistryCollectionNumber(
  value: unknown,
): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function getRegistryCollectorDisplay(registry: Registry): string | null {
  if (registry.contributorName?.trim()) return registry.contributorName.trim();
  if (typeof registry.collector === "object" && registry.collector !== null) {
    return registry.collector.name;
  }
  return null;
}

export function normalizeCoCollectorsInput(value: unknown): string[] {
  const rawNames = Array.isArray(value)
    ? value
    : typeof value === "string"
      ? value.split(/[,;\n]/)
      : [];

  return rawNames
    .filter((name): name is string => typeof name === "string")
    .map((name) => name.trim())
    .filter(Boolean);
}

export function getRegistryCoCollectorsDisplay(
  registry: Registry,
): string | null {
  const names = normalizeCoCollectorsInput(registry.coCollectors);
  return names.length > 0 ? names.join(", ") : null;
}

export function getRegistryCardImage(
  registry: Registry,
): { src: string; alt: string } | null {
  const image = registry.images?.find((item) => item.thumbnailUrl || item.url);
  if (!image) return null;

  return {
    src: image.thumbnailUrl || image.url,
    alt: `Imagem do espécime ${getRegistrySpeciesName(registry)}`,
  };
}
