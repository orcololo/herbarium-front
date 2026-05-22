"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  api,
  type CreateRegistryPayload,
  type Registry,
  type Species,
  type UpdateRegistryPayload,
  type Morphology,
  type StemMorphology,
  type LeafMorphology,
  type FlowerMorphology,
  type FruitMorphology,
  type SeedMorphology,
} from "@/lib/api";
import {
  getRegistryCollectionNumber,
  getRegistryCommonName,
  getRegistrySpeciesName,
  normalizeCoCollectorsInput,
  normalizeRegistryCollectionNumber,
} from "@/lib/registry-presentation";
import Link from "next/link";
import clsx from "clsx";
import { Upload, X, Image as ImageIcon } from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  synced: "bg-[#E8F5E9] text-[#2D5F3F]",
  pending: "bg-[#FFF8E1] text-[#F57C00]",
  conflict: "bg-[#FFEBEE] text-[#C62828]",
  error: "bg-[#FFEBEE] text-[#C62828]",
};

const GRADIENT_PALETTES = [
  "from-[#E8F5E9] to-[#A5D6A7]",
  "from-[#F3E5F5] to-[#CE93D8]",
  "from-[#E3F2FD] to-[#90CAF9]",
  "from-[#FFF8E1] to-[#FFE082]",
  "from-[#EFEBE9] to-[#BCAAA4]",
  "from-[#E0F2F1] to-[#80CBC4]",
];

function getGradient(id: string) {
  const index = id.charCodeAt(0) % GRADIENT_PALETTES.length;
  return GRADIENT_PALETTES[index];
}

type RegistryEditForm = UpdateRegistryPayload &
  Partial<
    Pick<
      CreateRegistryPayload,
      | "scientificName"
      | "commonName"
      | "family"
      | "genus"
      | "speciesEpithet"
      | "category"
    >
  >;

function getSpeciesDetails(species: Registry["species"]): Species | undefined {
  return typeof species === "object" ? species : undefined;
}

function FieldOrInput({
  label,
  value,
  onChange,
  type = "text",
  editing,
}: {
  label: string;
  value: string | number | undefined | null;
  onChange?: (val: string | number | undefined) => void;
  type?: string;
  editing: boolean;
}) {
  if (!editing) {
    if (value == null || value === "") return null;
    let displayValue = String(value);
    if (type === "date" && typeof value === "string") {
      const d = new Date(value);
      if (!isNaN(d.getTime())) {
        displayValue = d.toLocaleDateString("pt-BR", {
          day: "numeric",
          month: "long",
          year: "numeric",
        });
      }
    }
    return (
      <div className="mb-4 last:mb-0">
        <p className="text-[10px] font-bold text-[#9E9E9E] uppercase tracking-wider mb-1">
          {label}
        </p>
        <p className="text-sm text-[#1C1B1F] font-medium">{displayValue}</p>
      </div>
    );
  }

  return (
    <div className="mb-4 last:mb-0">
      <label className="block text-[10px] font-bold text-[#9E9E9E] uppercase tracking-wider mb-1">
        {label}
      </label>
      <input
        type={type}
        step={type === "number" ? "any" : undefined}
        value={
          type === "date" && value ? String(value).split("T")[0] : (value ?? "")
        }
        onChange={(e) => {
          const val = e.target.value;
          if (val === "") {
            onChange?.(undefined);
          } else if (type === "number") {
            onChange?.(parseFloat(val));
          } else {
            onChange?.(val);
          }
        }}
        className="w-full px-4 py-2.5 rounded-xl bg-[#F5F5F5] text-sm text-[#1C1B1F] border-2 border-transparent focus:border-[#3D7A52] outline-none transition-colors"
      />
    </div>
  );
}

function CoCollectorsField({
  editing,
  value,
  onChange,
}: {
  editing: boolean;
  value?: string[] | string;
  onChange: (value: string) => void;
}) {
  const names = normalizeCoCollectorsInput(value);

  if (!editing) {
    if (names.length === 0) return null;
    return (
      <div className="mb-4 last:mb-0">
        <p className="text-[10px] font-bold text-[#9E9E9E] uppercase tracking-wider mb-1">
          Co-coletores
        </p>
        <p className="text-sm text-[#1C1B1F] font-medium">{names.join(", ")}</p>
      </div>
    );
  }

  return (
    <div className="mb-4 last:mb-0">
      <label className="block text-[10px] font-bold text-[#9E9E9E] uppercase tracking-wider mb-1">
        Co-coletores
      </label>
      <textarea
        rows={2}
        value={typeof value === "string" ? value : names.join(", ")}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Separe nomes por vírgulas ou novas linhas"
        className="w-full px-4 py-2.5 rounded-xl bg-[#F5F5F5] text-sm text-[#1C1B1F] border-2 border-transparent focus:border-[#3D7A52] outline-none transition-colors resize-none"
      />
    </div>
  );
}

function MorphSubSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-5 last:mb-0">
      <p className="text-[10px] font-bold text-[#BDBDBD] uppercase tracking-wider mb-3">
        {title}
      </p>
      <div className="pl-3 border-l-2 border-[#E8F5E9] space-y-1">
        {children}
      </div>
    </div>
  );
}

export default function RegistryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [item, setItem] = useState<Registry | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState<RegistryEditForm>({});
  const [coCollectorsInput, setCoCollectorsInput] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    api.registry
      .get(id)
      .then((data) => setItem(data))
      .catch(() => setError("Falha ao carregar espécime."))
      .finally(() => setLoading(false));
  }, [id]);

  function startEditing() {
    if (!item) return;
    const species = getSpeciesDetails(item.species);
    setCoCollectorsInput(
      normalizeCoCollectorsInput(item.coCollectors).join(", "),
    );
    setFormData({
      scientificName: species?.scientificName ?? getRegistrySpeciesName(item),
      commonName:
        species?.commonName ?? getRegistryCommonName(item) ?? undefined,
      family: species?.family,
      genus: species?.genus,
      speciesEpithet: species?.species,
      category: species?.category,
      registryIdentifier: item.registryIdentifier,
      dateCollected: item.dateCollected,
      habitat: item.habitat,
      latitude: item.latitude,
      longitude: item.longitude,
      altitude: item.altitude,
      locality: item.locality,
      municipality: item.municipality,
      state: item.state,
      country: item.country,
      substrate: item.substrate,
      phenologicalState: item.phenologicalState,
      phenologyFournier: item.phenologyFournier,
      collectionMethod: item.collectionMethod,
      collectorNumber: item.collectorNumber,
      coCollectors: item.coCollectors ? [...item.coCollectors] : [],
      numberOfIndividuals: item.numberOfIndividuals,
      weatherCondition: item.weatherCondition,
      weatherNotes: item.weatherNotes,
      moonPhase: item.moonPhase,
      windSpeed: item.windSpeed,
      associatedTaxa: item.associatedTaxa,
      vegetationType: item.vegetationType,
      topography: item.topography,
      determinationQualifier: item.determinationQualifier,
      morphology: item.morphology
        ? {
            root: item.morphology.root,
            stem: item.morphology.stem
              ? { ...item.morphology.stem }
              : undefined,
            leaf: item.morphology.leaf
              ? { ...item.morphology.leaf }
              : undefined,
            flower: item.morphology.flower
              ? { ...item.morphology.flower }
              : undefined,
            fruit: item.morphology.fruit
              ? { ...item.morphology.fruit }
              : undefined,
            seed: item.morphology.seed
              ? { ...item.morphology.seed }
              : undefined,
          }
        : {},
      notes: item.notes,
      temperature: item.temperature,
      humidity: item.humidity,
      scientificAuthor: item.scientificAuthor,
      taxonStatus: item.taxonStatus,
      contributorName: item.contributorName,
      isDraft: item.isDraft,
      caule: item.caule,
      folhaDescricao: item.folhaDescricao,
      florDescricao: item.florDescricao,
      frutoDescricao: item.frutoDescricao,
      sementeDescricao: item.sementeDescricao,
      duplicateOf: item.duplicateOf,
      iNaturalistId: item.iNaturalistId,
      measurements: item.measurements ? [...item.measurements] : [],
      determinations: item.determinations ? [...item.determinations] : [],
    });
    setEditing(true);
    setError(null);
  }

  function cancelEditing() {
    setEditing(false);
    setFormData({});
    setCoCollectorsInput("");
    setError(null);
  }

  function handleFieldChange(key: keyof RegistryEditForm, value: unknown) {
    setFormData((prev) => ({ ...prev, [key]: value }));
  }

  function setStemField(key: keyof StemMorphology, value: string | undefined) {
    setFormData((prev) => ({
      ...prev,
      morphology: {
        ...(prev.morphology ?? {}),
        stem: { ...(prev.morphology?.stem ?? {}), [key]: value },
      },
    }));
  }

  function setLeafField(key: keyof LeafMorphology, value: string | undefined) {
    setFormData((prev) => ({
      ...prev,
      morphology: {
        ...(prev.morphology ?? {}),
        leaf: { ...(prev.morphology?.leaf ?? {}), [key]: value },
      },
    }));
  }

  function setFlowerField(
    key: keyof FlowerMorphology,
    value: string | undefined,
  ) {
    setFormData((prev) => ({
      ...prev,
      morphology: {
        ...(prev.morphology ?? {}),
        flower: { ...(prev.morphology?.flower ?? {}), [key]: value },
      },
    }));
  }

  function setFruitField(
    key: keyof FruitMorphology,
    value: string | undefined,
  ) {
    setFormData((prev) => ({
      ...prev,
      morphology: {
        ...(prev.morphology ?? {}),
        fruit: { ...(prev.morphology?.fruit ?? {}), [key]: value },
      },
    }));
  }

  function setSeedField(key: keyof SeedMorphology, value: string | undefined) {
    setFormData((prev) => ({
      ...prev,
      morphology: {
        ...(prev.morphology ?? {}),
        seed: { ...(prev.morphology?.seed ?? {}), [key]: value },
      },
    }));
  }

  const morphSrc = editing ? formData.morphology : item?.morphology;

  async function handleSave() {
    if (!item) return;
    const registryIdentifier = normalizeRegistryCollectionNumber(
      formData.registryIdentifier,
    );
    if (!registryIdentifier) {
      setError("Número de coleta é obrigatório.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const updated = await api.registry.update(id, {
        ...formData,
        registryIdentifier,
        coCollectors: normalizeCoCollectorsInput(coCollectorsInput),
      });
      setItem(updated);
      setEditing(false);
    } catch {
      setError("Falha ao salvar alterações.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Arquivar este espécime? Ele será marcado como inativo."))
      return;
    await api.registry.delete(id);
    router.replace("/registry");
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !item) return;
    setUploading(true);
    setError(null);
    try {
      const updated = await api.registry.attachImage(id, file);
      setItem(updated);
    } catch {
      setError("Falha ao enviar imagem.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleImageDelete(imageKey: string) {
    if (!item) return;
    setError(null);
    try {
      const updated = await api.registry.removeImage(id, imageKey);
      setItem(updated);
    } catch {
      setError("Falha ao remover imagem.");
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
        <div className="h-48 rounded-3xl shimmer" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-3xl shadow-[0_2px_8px_rgba(0,0,0,0.08)] p-6 space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-4 shimmer rounded-full"
                style={{ width: `${60 + i * 5}%` }}
              />
            ))}
          </div>
          <div className="bg-white rounded-3xl shadow-[0_2px_8px_rgba(0,0,0,0.08)] p-6 space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-4 shimmer rounded-full"
                style={{ width: `${50 + i * 10}%` }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error && !editing && !item) {
    return (
      <div className="max-w-4xl mx-auto text-center py-20">
        <div className="w-16 h-16 rounded-full bg-[#FFEBEE] text-[#C62828] flex items-center justify-center mx-auto mb-4">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
        </div>
        <p className="text-lg font-medium text-[#1C1B1F]">
          {error ?? "Espécime não encontrado"}
        </p>
        <Link
          href="/registry"
          className="inline-flex items-center gap-2 px-4 py-2 mt-6 rounded-full bg-white border border-[#EEEEEE] text-sm font-medium text-[#49454F] hover:bg-[#F5F5F5] transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
            <path
              d="M12 15L7 10L12 5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Voltar para Registros
        </Link>
      </div>
    );
  }

  if (!item) return null;

  const speciesName = getRegistrySpeciesName(item);
  const commonName = getRegistryCommonName(item) ?? undefined;
  const speciesDetails = getSpeciesDetails(item.species);

  const hasMorphology = !!(
    morphSrc?.root ||
    morphSrc?.stem ||
    morphSrc?.leaf ||
    morphSrc?.flower ||
    morphSrc?.fruit ||
    morphSrc?.seed
  );

  return (
    <div className="max-w-4xl mx-auto animate-fade-in pb-12">
      <div className="relative mb-16">
        <div
          className={clsx(
            "h-48 rounded-3xl bg-linear-to-br flex items-center justify-center relative overflow-hidden shadow-sm",
            getGradient(item.id),
          )}
        >
          <svg
            width="96"
            height="96"
            viewBox="0 0 48 48"
            fill="none"
            className="opacity-30 mix-blend-overlay"
          >
            <path
              d="M24 6C24 6 10 14 10 28C10 35.732 16.268 42 24 42C31.732 42 38 35.732 38 28C38 14 24 6 24 6Z"
              fill="currentColor"
            />
            <path
              d="M24 6C24 6 24 22 16 28"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>

          <Link
            href="/registry"
            className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/80 backdrop-blur-sm text-sm font-medium text-[#1C1B1F] hover:bg-white transition-colors shadow-sm"
          >
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
              <path
                d="M12 15L7 10L12 5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Voltar
          </Link>

          <div className="absolute top-4 right-4 flex items-center gap-2">
            <span className="text-xs font-mono font-medium px-3 py-1.5 rounded-full bg-white/80 backdrop-blur-sm text-[#1C1B1F] shadow-sm">
              {getRegistryCollectionNumber(item)}
            </span>
            <span
              className={clsx(
                "text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full shadow-sm backdrop-blur-sm",
                STATUS_COLORS[item.syncMetadata?.syncStatus ?? "pending"],
              )}
            >
              {item.syncMetadata?.syncStatus ?? "pending"}
            </span>
          </div>
        </div>

        <div className="absolute -bottom-10 left-8 right-8 bg-white rounded-[20px] shadow-[0_4px_16px_rgba(0,0,0,0.12)] p-6 border border-[#EEEEEE] flex justify-between items-start">
          <div>
            <h1 className="text-[22px] font-bold text-[#1C1B1F] italic tracking-tight">
              {speciesName}
            </h1>
            {commonName && (
              <p className="text-sm text-[#6D4C41] mt-1">{commonName}</p>
            )}
          </div>
          {!editing && (
            <button
              onClick={startEditing}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#E8F5E9] text-[#3D7A52] text-xs font-medium hover:bg-[#C8E6C9] transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path
                  d="M15.2322 5.23223L18.7678 8.76777M16.7322 3.73223C17.7085 2.75592 19.2915 2.75592 20.2678 3.73223C21.2441 4.70854 21.2441 6.29146 20.2678 7.26777L6.5 21.0355H3V17.5355L16.7322 3.73223Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Editar
            </button>
          )}
        </div>
      </div>

      {editing && (
        <div className="sticky top-4 z-10 mb-6 bg-white/80 backdrop-blur-md p-4 rounded-[20px] shadow-[0_4px_16px_rgba(0,0,0,0.08)] border border-[#EEEEEE] flex items-center justify-between">
          <span className="text-sm font-bold text-[#1C1B1F]">
            Editando Espécime
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={cancelEditing}
              className="px-5 py-2 rounded-full bg-white border border-[#EEEEEE] text-[#49454F] text-xs font-medium hover:bg-[#F5F5F5] transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-5 py-2 rounded-full bg-[#3D7A52] text-white text-xs font-medium shadow-[0_2px_8px_rgba(61,122,82,0.3)] hover:bg-[#2D5F3F] transition-colors disabled:opacity-60 flex items-center gap-2"
            >
              {saving && (
                <svg
                  className="animate-spin h-3 w-3 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              )}
              {saving ? "Salvando..." : "Salvar Alterações"}
            </button>
          </div>
        </div>
      )}

      {editing && (
        <div className="mb-6 flex items-center gap-3 px-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isDraft ?? item.isDraft ?? true}
              onChange={(e) => handleFieldChange("isDraft", e.target.checked)}
              className="w-4 h-4 rounded border-[#DDDDDD] text-[#3D7A52] focus:ring-[#3D7A52]"
            />
            <span className="text-sm text-[#49454F]">Rascunho</span>
          </label>
        </div>
      )}

      {error && editing && (
        <div className="mb-6 p-4 bg-[#FFEBEE] text-[#C62828] rounded-2xl text-sm font-medium">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-[20px] shadow-[0_2px_8px_rgba(0,0,0,0.08)] p-6 border border-transparent hover:border-[#EEEEEE] transition-colors">
          <div className="flex items-center gap-2 mb-5">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              className="text-[#3D7A52]"
            >
              <path
                d="M12 22C12 22 20 18 20 12V5L12 2L4 5V12C4 18 12 22 12 22Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <h2 className="text-[11px] font-bold text-[#3D7A52] uppercase tracking-widest">
              Identificação
            </h2>
          </div>
          <div className="space-y-1">
            <FieldOrInput
              editing={editing}
              label="Nome Científico"
              value={editing ? formData.scientificName : speciesName}
              onChange={(v) => handleFieldChange("scientificName", v)}
            />
            <FieldOrInput
              editing={editing}
              label="Nome Popular"
              value={editing ? formData.commonName : commonName}
              onChange={(v) => handleFieldChange("commonName", v)}
            />
            <FieldOrInput
              editing={editing}
              label="Família"
              value={editing ? formData.family : speciesDetails?.family}
              onChange={(v) => handleFieldChange("family", v)}
            />
            <FieldOrInput
              editing={editing}
              label="Gênero"
              value={editing ? formData.genus : speciesDetails?.genus}
              onChange={(v) => handleFieldChange("genus", v)}
            />
            <FieldOrInput
              editing={editing}
              label="Epíteto Específico"
              value={
                editing ? formData.speciesEpithet : speciesDetails?.species
              }
              onChange={(v) => handleFieldChange("speciesEpithet", v)}
            />
            <FieldOrInput
              editing={editing}
              label="Categoria"
              value={editing ? formData.category : speciesDetails?.category}
              onChange={(v) => handleFieldChange("category", v)}
            />
          </div>
        </div>

        <div className="bg-white rounded-[20px] shadow-[0_2px_8px_rgba(0,0,0,0.08)] p-6 border border-transparent hover:border-[#EEEEEE] transition-colors">
          <div className="flex items-center gap-2 mb-5">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              className="text-[#3D7A52]"
            >
              <path
                d="M12 21C12 21 5 14.5 5 9C5 5.13401 8.13401 2 12 2C15.866 2 19 5.13401 19 9C19 14.5 12 21 12 21Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle
                cx="12"
                cy="9"
                r="3"
                stroke="currentColor"
                strokeWidth="2"
              />
            </svg>
            <h2 className="text-[11px] font-bold text-[#3D7A52] uppercase tracking-widest">
              Informações da Coleta
            </h2>
          </div>
          <div className="space-y-1">
            <FieldOrInput
              editing={editing}
              label="Número de Coleta"
              value={
                editing ? formData.registryIdentifier : item.registryIdentifier
              }
              onChange={(v) => handleFieldChange("registryIdentifier", v)}
            />
            <FieldOrInput
              editing={editing}
              type="date"
              label="Data da Coleta"
              value={editing ? formData.dateCollected : item.dateCollected}
              onChange={(v) => handleFieldChange("dateCollected", v)}
            />
            <FieldOrInput
              editing={editing}
              label="Habitat"
              value={editing ? formData.habitat : item.habitat}
              onChange={(v) => handleFieldChange("habitat", v)}
            />
            <FieldOrInput
              editing={editing}
              type="number"
              label="Latitude"
              value={editing ? formData.latitude : item.latitude}
              onChange={(v) => handleFieldChange("latitude", v)}
            />
            <FieldOrInput
              editing={editing}
              type="number"
              label="Longitude"
              value={editing ? formData.longitude : item.longitude}
              onChange={(v) => handleFieldChange("longitude", v)}
            />
            <FieldOrInput
              editing={editing}
              type="number"
              label="Altitude (m)"
              value={editing ? formData.altitude : item.altitude}
              onChange={(v) => handleFieldChange("altitude", v)}
            />
            <FieldOrInput
              editing={editing}
              label="Localidade"
              value={editing ? formData.locality : item.locality}
              onChange={(v) => handleFieldChange("locality", v)}
            />
            <FieldOrInput
              editing={editing}
              label="Município"
              value={editing ? formData.municipality : item.municipality}
              onChange={(v) => handleFieldChange("municipality", v)}
            />
            <FieldOrInput
              editing={editing}
              label="Estado"
              value={editing ? formData.state : item.state}
              onChange={(v) => handleFieldChange("state", v)}
            />
            <FieldOrInput
              editing={editing}
              label="País"
              value={editing ? formData.country : item.country}
              onChange={(v) => handleFieldChange("country", v)}
            />
            <FieldOrInput
              editing={editing}
              label="Substrato"
              value={editing ? formData.substrate : item.substrate}
              onChange={(v) => handleFieldChange("substrate", v)}
            />
            <FieldOrInput
              editing={editing}
              label="Número do Coletor"
              value={editing ? formData.collectorNumber : item.collectorNumber}
              onChange={(v) => handleFieldChange("collectorNumber", v)}
            />
            <CoCollectorsField
              editing={editing}
              value={editing ? coCollectorsInput : item.coCollectors}
              onChange={setCoCollectorsInput}
            />
            <FieldOrInput
              editing={editing}
              type="number"
              label="Nº de Indivíduos"
              value={
                editing
                  ? formData.numberOfIndividuals
                  : item.numberOfIndividuals
              }
              onChange={(v) => handleFieldChange("numberOfIndividuals", v)}
            />
            <FieldOrInput
              editing={editing}
              type="number"
              label="Temperatura (°C)"
              value={editing ? formData.temperature : item.temperature}
              onChange={(v) => handleFieldChange("temperature", v)}
            />
            <FieldOrInput
              editing={editing}
              type="number"
              label="Umidade (%)"
              value={editing ? formData.humidity : item.humidity}
              onChange={(v) => handleFieldChange("humidity", v)}
            />
            <FieldOrInput
              editing={editing}
              label="Contribuidor"
              value={editing ? formData.contributorName : item.contributorName}
              onChange={(v) => handleFieldChange("contributorName", v)}
            />
          </div>
        </div>

        <div className="bg-white rounded-[20px] shadow-[0_2px_8px_rgba(0,0,0,0.08)] p-6 border border-transparent hover:border-[#EEEEEE] transition-colors">
          <div className="flex items-center gap-2 mb-5">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              className="text-[#3D7A52]"
            >
              <path
                d="M15 12C15 13.6569 13.6569 15 12 15C10.3431 15 9 13.6569 9 12C9 10.3431 10.3431 9 12 9C13.6569 9 15 10.3431 15 12Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M2.45801 12C3.73228 7.94288 7.52257 5 12.0002 5C16.4778 5 20.2681 7.94291 21.5424 12C20.2681 16.0571 16.4778 19 12.0002 19C7.52256 19 3.73226 16.0571 2.45801 12Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <h2 className="text-[11px] font-bold text-[#3D7A52] uppercase tracking-widest">
              Dados de Observação
            </h2>
          </div>
          <div className="space-y-1">
            <FieldOrInput
              editing={editing}
              label="Estado Fenológico"
              value={
                editing ? formData.phenologicalState : item.phenologicalState
              }
              onChange={(v) => handleFieldChange("phenologicalState", v)}
            />
            <FieldOrInput
              editing={editing}
              label="Fenologia (Fournier)"
              value={
                editing ? formData.phenologyFournier : item.phenologyFournier
              }
              onChange={(v) => handleFieldChange("phenologyFournier", v)}
            />
            <FieldOrInput
              editing={editing}
              label="Método de Coleta"
              value={
                editing ? formData.collectionMethod : item.collectionMethod
              }
              onChange={(v) => handleFieldChange("collectionMethod", v)}
            />
            <FieldOrInput
              editing={editing}
              label="Condição Climática"
              value={
                editing ? formData.weatherCondition : item.weatherCondition
              }
              onChange={(v) => handleFieldChange("weatherCondition", v)}
            />
            <FieldOrInput
              editing={editing}
              label="Notas do Clima"
              value={editing ? formData.weatherNotes : item.weatherNotes}
              onChange={(v) => handleFieldChange("weatherNotes", v)}
            />
            <FieldOrInput
              editing={editing}
              label="Fase da Lua"
              value={editing ? formData.moonPhase : item.moonPhase}
              onChange={(v) => handleFieldChange("moonPhase", v)}
            />
            <FieldOrInput
              editing={editing}
              type="number"
              label="Velocidade do Vento (km/h)"
              value={editing ? formData.windSpeed : item.windSpeed}
              onChange={(v) => handleFieldChange("windSpeed", v)}
            />
            <FieldOrInput
              editing={editing}
              label="Táxons Associados"
              value={editing ? formData.associatedTaxa : item.associatedTaxa}
              onChange={(v) => handleFieldChange("associatedTaxa", v)}
            />
            <FieldOrInput
              editing={editing}
              label="Tipo de Vegetação"
              value={editing ? formData.vegetationType : item.vegetationType}
              onChange={(v) => handleFieldChange("vegetationType", v)}
            />
            <FieldOrInput
              editing={editing}
              label="Topografia"
              value={editing ? formData.topography : item.topography}
              onChange={(v) => handleFieldChange("topography", v)}
            />
            <FieldOrInput
              editing={editing}
              label="Qualif. Determinação"
              value={
                editing
                  ? formData.determinationQualifier
                  : item.determinationQualifier
              }
              onChange={(v) => handleFieldChange("determinationQualifier", v)}
            />
            <FieldOrInput
              editing={editing}
              label="Autor Científico"
              value={
                editing ? formData.scientificAuthor : item.scientificAuthor
              }
              onChange={(v) => handleFieldChange("scientificAuthor", v)}
            />
            <FieldOrInput
              editing={editing}
              label="Status Taxonômico"
              value={editing ? formData.taxonStatus : item.taxonStatus}
              onChange={(v) => handleFieldChange("taxonStatus", v)}
            />
            <FieldOrInput
              editing={editing}
              label="Duplicata de"
              value={editing ? formData.duplicateOf : item.duplicateOf}
              onChange={(v) => handleFieldChange("duplicateOf", v)}
            />
            <FieldOrInput
              editing={editing}
              label="iNaturalist ID"
              value={editing ? formData.iNaturalistId : item.iNaturalistId}
              onChange={(v) => handleFieldChange("iNaturalistId", v)}
            />
          </div>
        </div>

        {(editing || hasMorphology) && (
          <div className="bg-white rounded-[20px] shadow-[0_2px_8px_rgba(0,0,0,0.08)] p-6 border border-transparent hover:border-[#EEEEEE] transition-colors">
            <div className="flex items-center gap-2 mb-5">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                className="text-[#3D7A52]"
              >
                <path
                  d="M12 22C12 22 4 16 4 10C4 5.58172 7.58172 2 12 2C16.4183 2 20 5.58172 20 10C20 16 12 22 12 22Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M12 22V10"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <h2 className="text-[11px] font-bold text-[#3D7A52] uppercase tracking-widest">
                Morfologia
              </h2>
            </div>

            <FieldOrInput
              editing={editing}
              label="Raiz"
              value={
                editing ? formData.morphology?.root : item.morphology?.root
              }
              onChange={(v) =>
                setFormData((prev) => ({
                  ...prev,
                  morphology: {
                    ...(prev.morphology ?? {}),
                    root: v as string | undefined,
                  },
                }))
              }
            />

            <MorphSubSection title="Caule">
              <FieldOrInput
                editing={editing}
                label="Tipo"
                value={morphSrc?.stem?.type}
                onChange={(v) => setStemField("type", v as string | undefined)}
              />
              <FieldOrInput
                editing={editing}
                label="Cor"
                value={morphSrc?.stem?.color}
                onChange={(v) => setStemField("color", v as string | undefined)}
              />
              <FieldOrInput
                editing={editing}
                label="Tamanho"
                value={morphSrc?.stem?.size}
                onChange={(v) => setStemField("size", v as string | undefined)}
              />
              <FieldOrInput
                editing={editing}
                label="Circunferência"
                value={morphSrc?.stem?.circumference}
                onChange={(v) =>
                  setStemField("circumference", v as string | undefined)
                }
              />
              <FieldOrInput
                editing={editing}
                label="Seiva"
                value={morphSrc?.stem?.sap}
                onChange={(v) => setStemField("sap", v as string | undefined)}
              />
            </MorphSubSection>

            <MorphSubSection title="Folha">
              <FieldOrInput
                editing={editing}
                label="Bainha"
                value={morphSrc?.leaf?.bainha}
                onChange={(v) =>
                  setLeafField("bainha", v as string | undefined)
                }
              />
              <FieldOrInput
                editing={editing}
                label="Peciolo"
                value={morphSrc?.leaf?.peciolo}
                onChange={(v) =>
                  setLeafField("peciolo", v as string | undefined)
                }
              />
              <FieldOrInput
                editing={editing}
                label="Lâmina"
                value={morphSrc?.leaf?.lamina}
                onChange={(v) =>
                  setLeafField("lamina", v as string | undefined)
                }
              />
            </MorphSubSection>

            <MorphSubSection title="Flor">
              <FieldOrInput
                editing={editing}
                label="Inflorescência"
                value={morphSrc?.flower?.inflorescence}
                onChange={(v) =>
                  setFlowerField("inflorescence", v as string | undefined)
                }
              />
              <FieldOrInput
                editing={editing}
                label="Cor"
                value={morphSrc?.flower?.color}
                onChange={(v) =>
                  setFlowerField("color", v as string | undefined)
                }
              />
              <FieldOrInput
                editing={editing}
                label="Tamanho"
                value={morphSrc?.flower?.size}
                onChange={(v) =>
                  setFlowerField("size", v as string | undefined)
                }
              />
            </MorphSubSection>

            <MorphSubSection title="Fruto">
              <FieldOrInput
                editing={editing}
                label="Cor"
                value={morphSrc?.fruit?.color}
                onChange={(v) =>
                  setFruitField("color", v as string | undefined)
                }
              />
              <FieldOrInput
                editing={editing}
                label="Formato"
                value={morphSrc?.fruit?.format}
                onChange={(v) =>
                  setFruitField("format", v as string | undefined)
                }
              />
              <FieldOrInput
                editing={editing}
                label="Tamanho"
                value={morphSrc?.fruit?.size}
                onChange={(v) => setFruitField("size", v as string | undefined)}
              />
            </MorphSubSection>

            <MorphSubSection title="Semente">
              <FieldOrInput
                editing={editing}
                label="Formato"
                value={morphSrc?.seed?.format}
                onChange={(v) =>
                  setSeedField("format", v as string | undefined)
                }
              />
              <FieldOrInput
                editing={editing}
                label="Tamanho"
                value={morphSrc?.seed?.size}
                onChange={(v) => setSeedField("size", v as string | undefined)}
              />
              <FieldOrInput
                editing={editing}
                label="Cor"
                value={morphSrc?.seed?.color}
                onChange={(v) => setSeedField("color", v as string | undefined)}
              />
            </MorphSubSection>

            <FieldOrInput
              editing={editing}
              label="Descrição do Caule"
              value={editing ? formData.caule : item.caule}
              onChange={(v) => handleFieldChange("caule", v)}
            />
            <FieldOrInput
              editing={editing}
              label="Descrição da Folha"
              value={editing ? formData.folhaDescricao : item.folhaDescricao}
              onChange={(v) => handleFieldChange("folhaDescricao", v)}
            />
            <FieldOrInput
              editing={editing}
              label="Descrição da Flor"
              value={editing ? formData.florDescricao : item.florDescricao}
              onChange={(v) => handleFieldChange("florDescricao", v)}
            />
            <FieldOrInput
              editing={editing}
              label="Descrição do Fruto"
              value={editing ? formData.frutoDescricao : item.frutoDescricao}
              onChange={(v) => handleFieldChange("frutoDescricao", v)}
            />
            <FieldOrInput
              editing={editing}
              label="Descrição da Semente"
              value={
                editing ? formData.sementeDescricao : item.sementeDescricao
              }
              onChange={(v) => handleFieldChange("sementeDescricao", v)}
            />
          </div>
        )}

        <div className="bg-white rounded-[20px] shadow-[0_2px_8px_rgba(0,0,0,0.08)] p-6 border border-transparent hover:border-[#EEEEEE] transition-colors">
          <div className="flex items-center gap-2 mb-5">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              className="text-[#3D7A52]"
            >
              <path
                d="M11 4H4C2.89543 4 2 4.89543 2 6V20C2 21.1046 2.89543 22 4 22H18C19.1046 22 20 21.1046 20 20V13"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M18.5 2.50001C19.3284 1.67158 20.6716 1.67158 21.5 2.50001C22.3284 3.32844 22.3284 4.67158 21.5 5.50001L12 15L8 16L9 12L18.5 2.50001Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <h2 className="text-[11px] font-bold text-[#3D7A52] uppercase tracking-widest">
              Observações
            </h2>
          </div>
          {editing ? (
            <textarea
              value={formData.notes ?? ""}
              onChange={(e) => handleFieldChange("notes", e.target.value)}
              rows={5}
              className="w-full px-4 py-3 rounded-xl bg-[#F5F5F5] text-sm text-[#1C1B1F] outline-none border-2 border-transparent focus:border-[#3D7A52] transition-colors resize-none"
              placeholder="Adicione suas notas de campo aqui..."
            />
          ) : (
            <p className="text-sm text-[#49454F] leading-relaxed whitespace-pre-wrap">
              {item.notes || (
                <span className="text-[#AAAAAA] italic">
                  Nenhuma observação registrada para este espécime.
                </span>
              )}
            </p>
          )}
        </div>

        <div className="bg-white rounded-[20px] shadow-[0_2px_8px_rgba(0,0,0,0.08)] p-6 border border-transparent hover:border-[#EEEEEE] transition-colors">
          <div className="flex items-center gap-2 mb-5">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              className="text-[#3D7A52]"
            >
              <path
                d="M2 12H6L9 3L15 21L18 12H22"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <h2 className="text-[11px] font-bold text-[#3D7A52] uppercase tracking-widest">
              Medições
            </h2>
          </div>
          {(editing
            ? (formData.measurements ?? item.measurements ?? [])
            : (item.measurements ?? [])
          ).length === 0 &&
            !editing && (
              <p className="text-sm text-[#AAAAAA] italic">
                Nenhuma medição registrada.
              </p>
            )}
          {(editing
            ? (formData.measurements ?? item.measurements ?? [])
            : (item.measurements ?? [])
          ).map((m, i) => (
            <div key={i} className="flex items-center gap-2 mb-2">
              {editing ? (
                <>
                  <input
                    value={m.label}
                    onChange={(e) => {
                      const ms = [
                        ...(formData.measurements ?? item.measurements ?? []),
                      ];
                      ms[i] = { ...ms[i], label: e.target.value };
                      handleFieldChange("measurements", ms);
                    }}
                    placeholder="Nome"
                    className="flex-1 px-3 py-2 rounded-[10px] bg-[#F5F5F5] text-sm border-2 border-transparent focus:border-[#3D7A52] outline-none"
                  />
                  <input
                    type="number"
                    step="any"
                    value={m.value}
                    onChange={(e) => {
                      const ms = [
                        ...(formData.measurements ?? item.measurements ?? []),
                      ];
                      ms[i] = {
                        ...ms[i],
                        value: parseFloat(e.target.value) || 0,
                      };
                      handleFieldChange("measurements", ms);
                    }}
                    placeholder="Valor"
                    className="w-24 px-3 py-2 rounded-[10px] bg-[#F5F5F5] text-sm border-2 border-transparent focus:border-[#3D7A52] outline-none"
                  />
                  <input
                    value={m.unit ?? ""}
                    onChange={(e) => {
                      const ms = [
                        ...(formData.measurements ?? item.measurements ?? []),
                      ];
                      ms[i] = { ...ms[i], unit: e.target.value };
                      handleFieldChange("measurements", ms);
                    }}
                    placeholder="Un."
                    className="w-16 px-3 py-2 rounded-[10px] bg-[#F5F5F5] text-sm border-2 border-transparent focus:border-[#3D7A52] outline-none"
                  />
                  <button
                    onClick={() => {
                      const ms = [
                        ...(formData.measurements ?? item.measurements ?? []),
                      ];
                      ms.splice(i, 1);
                      handleFieldChange("measurements", ms);
                    }}
                    className="text-[#E53935] hover:bg-[#FFEBEE] rounded-full p-1"
                  >
                    <X size={14} />
                  </button>
                </>
              ) : (
                <p className="text-sm text-[#1C1B1F]">
                  <span className="font-medium">{m.label}:</span> {m.value}
                  {m.unit ? ` ${m.unit}` : ""}
                </p>
              )}
            </div>
          ))}
          {editing && (
            <button
              onClick={() => {
                const ms = [
                  ...(formData.measurements ?? item.measurements ?? []),
                  { label: "", value: 0, unit: "" },
                ];
                handleFieldChange("measurements", ms);
              }}
              className="mt-2 text-xs font-medium text-[#3D7A52] hover:bg-[#E8F5E9] px-3 py-1.5 rounded-full transition-colors"
            >
              + Adicionar Medição
            </button>
          )}
        </div>

        <div className="bg-white rounded-[20px] shadow-[0_2px_8px_rgba(0,0,0,0.08)] p-6 border border-transparent hover:border-[#EEEEEE] transition-colors md:col-span-2">
          <div className="flex items-center gap-2 mb-5">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              className="text-[#3D7A52]"
            >
              <path
                d="M9 5H7C5.89543 5 5 5.89543 5 7V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V7C19 5.89543 18.1046 5 17 5H15"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M9 5C9 3.89543 9.89543 3 11 3H13C14.1046 3 15 3.89543 15 5C15 6.10457 14.1046 7 13 7H11C9.89543 7 9 6.10457 9 5Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <h2 className="text-[11px] font-bold text-[#3D7A52] uppercase tracking-widest">
              Determinações
            </h2>
          </div>
          {(editing
            ? (formData.determinations ?? item.determinations ?? [])
            : (item.determinations ?? [])
          ).length === 0 &&
            !editing && (
              <p className="text-sm text-[#AAAAAA] italic">
                Nenhuma determinação registrada.
              </p>
            )}
          {(editing
            ? (formData.determinations ?? item.determinations ?? [])
            : (item.determinations ?? [])
          ).map((d, i) => (
            <div
              key={i}
              className="mb-3 p-3 rounded-xl bg-[#FAFAFA] border border-[#EEEEEE]"
            >
              {editing ? (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      value={d.scientificName}
                      onChange={(e) => {
                        const ds = [
                          ...(formData.determinations ??
                            item.determinations ??
                            []),
                        ];
                        ds[i] = { ...ds[i], scientificName: e.target.value };
                        handleFieldChange("determinations", ds);
                      }}
                      placeholder="Nome Científico"
                      className="flex-1 px-3 py-2 rounded-[10px] bg-white text-sm border-2 border-transparent focus:border-[#3D7A52] outline-none"
                    />
                    <input
                      value={d.family ?? ""}
                      onChange={(e) => {
                        const ds = [
                          ...(formData.determinations ??
                            item.determinations ??
                            []),
                        ];
                        ds[i] = { ...ds[i], family: e.target.value };
                        handleFieldChange("determinations", ds);
                      }}
                      placeholder="Família"
                      className="w-32 px-3 py-2 rounded-[10px] bg-white text-sm border-2 border-transparent focus:border-[#3D7A52] outline-none"
                    />
                  </div>
                  <div className="flex gap-2">
                    <input
                      value={d.determinedBy}
                      onChange={(e) => {
                        const ds = [
                          ...(formData.determinations ??
                            item.determinations ??
                            []),
                        ];
                        ds[i] = { ...ds[i], determinedBy: e.target.value };
                        handleFieldChange("determinations", ds);
                      }}
                      placeholder="Determinado por"
                      className="flex-1 px-3 py-2 rounded-[10px] bg-white text-sm border-2 border-transparent focus:border-[#3D7A52] outline-none"
                    />
                    <input
                      type="date"
                      value={d.determinedAt ? d.determinedAt.split("T")[0] : ""}
                      onChange={(e) => {
                        const ds = [
                          ...(formData.determinations ??
                            item.determinations ??
                            []),
                        ];
                        ds[i] = { ...ds[i], determinedAt: e.target.value };
                        handleFieldChange("determinations", ds);
                      }}
                      className="w-40 px-3 py-2 rounded-[10px] bg-white text-sm border-2 border-transparent focus:border-[#3D7A52] outline-none"
                    />
                    <button
                      onClick={() => {
                        const ds = [
                          ...(formData.determinations ??
                            item.determinations ??
                            []),
                        ];
                        ds.splice(i, 1);
                        handleFieldChange("determinations", ds);
                      }}
                      className="text-[#E53935] hover:bg-[#FFEBEE] rounded-full p-1"
                    >
                      <X size={14} />
                    </button>
                  </div>
                  <input
                    value={d.notes ?? ""}
                    onChange={(e) => {
                      const ds = [
                        ...(formData.determinations ??
                          item.determinations ??
                          []),
                      ];
                      ds[i] = { ...ds[i], notes: e.target.value };
                      handleFieldChange("determinations", ds);
                    }}
                    placeholder="Notas"
                    className="w-full px-3 py-2 rounded-[10px] bg-white text-sm border-2 border-transparent focus:border-[#3D7A52] outline-none"
                  />
                </div>
              ) : (
                <div>
                  <p className="text-sm font-medium text-[#1C1B1F] italic">
                    {d.scientificName}
                  </p>
                  {d.family && (
                    <p className="text-xs text-[#6D4C41]">{d.family}</p>
                  )}
                  <p className="text-xs text-[#9E9E9E] mt-1">
                    por {d.determinedBy}
                    {d.determinedAt
                      ? ` em ${new Date(d.determinedAt).toLocaleDateString("pt-BR")}`
                      : ""}
                  </p>
                  {d.notes && (
                    <p className="text-xs text-[#49454F] mt-1">{d.notes}</p>
                  )}
                </div>
              )}
            </div>
          ))}
          {editing && (
            <button
              onClick={() => {
                const ds = [
                  ...(formData.determinations ?? item.determinations ?? []),
                  {
                    scientificName: "",
                    determinedBy: "",
                    determinedAt: new Date().toISOString(),
                    family: "",
                    notes: "",
                    basis: "",
                  },
                ];
                handleFieldChange("determinations", ds);
              }}
              className="mt-2 text-xs font-medium text-[#3D7A52] hover:bg-[#E8F5E9] px-3 py-1.5 rounded-full transition-colors"
            >
              + Adicionar Determinação
            </button>
          )}
        </div>

        <div className="bg-white rounded-[20px] shadow-[0_2px_8px_rgba(0,0,0,0.08)] p-6 border border-transparent hover:border-[#EEEEEE] transition-colors md:col-span-2">
          <div className="flex items-center gap-2 mb-5">
            <ImageIcon size={16} className="text-[#3D7A52]" />
            <h2 className="text-[11px] font-bold text-[#3D7A52] uppercase tracking-widest">
              Imagens
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {(item.images ?? []).map((img) => (
              <div
                key={img.key}
                className="relative group rounded-lg overflow-hidden aspect-square bg-[#F5F5F5]"
              >
                <img
                  src={img.thumbnailUrl || img.url}
                  alt="Espécime"
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => handleImageDelete(img.key)}
                  className="absolute top-2 right-2 w-6 h-6 rounded-full bg-white/90 text-[#E53935] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                  aria-label="Remover imagem"
                >
                  <X size={14} />
                </button>
              </div>
            ))}

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="border-2 border-dashed border-[#DDDDDD] rounded-2xl flex flex-col items-center justify-center aspect-square hover:border-[#3D7A52] transition cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {uploading ? (
                <svg
                  className="animate-spin h-6 w-6 text-[#3D7A52]"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              ) : (
                <>
                  <Upload size={20} className="text-[#9E9E9E] mb-1" />
                  <span className="text-[10px] font-medium text-[#9E9E9E]">
                    Enviar
                  </span>
                </>
              )}
            </button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleImageUpload}
            className="hidden"
          />
        </div>
      </div>

      <div className="mt-10 flex justify-center">
        <button
          onClick={handleDelete}
          className="flex items-center gap-2 text-xs font-medium text-[#E53935] hover:bg-[#FFEBEE] px-4 py-2.5 rounded-full transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path
              d="M3 6H21M19 6V20C19 21.1046 18.1046 22 17 22H7C5.89543 22 5 21.1046 5 20V6M8 6V4C8 2.89543 8.89543 2 10 2H14C15.1046 2 16 2.89543 16 4V6M10 11V17M14 11V17"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Arquivar Espécime
        </button>
      </div>
    </div>
  );
}
