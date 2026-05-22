"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api, type CreateSessionPayload } from "@/lib/api";
import clsx from "clsx";

export default function NewSessionPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    tripName: "",
    startDate: "",
    endDate: "",
    location: "",
    shareCode: "",
    notes: "",
  });
  const [teamMembers, setTeamMembers] = useState<string[]>([]);
  const [newMember, setNewMember] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  function addMember() {
    const name = newMember.trim();
    if (!name || teamMembers.includes(name)) return;
    setTeamMembers((prev) => [...prev, name]);
    setNewMember("");
  }

  function removeMember(idx: number) {
    setTeamMembers((prev) => prev.filter((_, i) => i !== idx));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!form.tripName.trim())
      errs.tripName = "Nome da expedição é obrigatório";
    if (!form.startDate) errs.startDate = "Data de início é obrigatória";
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setSubmitting(true);
    try {
      const payload: CreateSessionPayload = {
        uuid: crypto.randomUUID(),
        tripName: form.tripName.trim(),
        startDate: form.startDate,
        ...(form.endDate && { endDate: form.endDate }),
        ...(form.location.trim() && { location: form.location.trim() }),
        ...(teamMembers.length > 0 && { teamMembers }),
        ...(form.shareCode.trim() && { shareCode: form.shareCode.trim() }),
        ...(form.notes.trim() && { notes: form.notes.trim() }),
      };
      const created = await api.sessions.create(payload);
      router.push(`/sessions/${created.id}`);
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Falha ao criar sessão.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <div className="mb-8">
        <Link
          href="/sessions"
          className="inline-flex items-center gap-2 text-sm font-medium text-[#6D4C41] hover:text-[#1C1B1F] transition-colors mb-4"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path
              d="M19 12H5M5 12L12 19M5 12L12 5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Voltar
        </Link>
        <h1 className="text-2xl font-semibold text-[#1C1B1F] tracking-tight">
          Nova Sessão
        </h1>
        <p className="text-sm text-[#6D4C41] mt-0.5">
          Criar uma nova sessão de coleta em campo
        </p>
      </div>

      {submitError && (
        <div className="flex items-center gap-3 bg-[#FFEBEE] text-[#C62828] px-4 py-3 rounded-xl mb-6 text-sm border border-[#FFCDD2]">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d="M8 5V8M8 11H8.01M2 8C2 4.686 4.686 2 8 2s6 2.686 6 6-2.686 6-6 6-6-2.686-6-6Z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
          {submitError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-[20px] shadow-[0_2px_8px_rgba(0,0,0,0.08)] p-6">
          <div className="flex items-center gap-2 mb-6">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              className="text-[#3D7A52]"
            >
              <rect
                x="3"
                y="4"
                width="18"
                height="18"
                rx="2"
                stroke="currentColor"
                strokeWidth="2"
              />
              <path
                d="M16 2V6M8 2V6M3 10H21"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            <h2 className="text-[11px] font-bold text-[#3D7A52] uppercase tracking-widest">
              Detalhes da Expedição
            </h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-bold text-[#9E9E9E] uppercase tracking-wider mb-1.5 block">
                Nome da Expedição *
              </label>
              <input
                type="text"
                value={form.tripName}
                onChange={(e) => {
                  setForm((f) => ({ ...f, tripName: e.target.value }));
                  setErrors((e) => ({ ...e, tripName: "" }));
                }}
                placeholder="Expedição Rio Amazonas 2026"
                className={clsx(
                  "w-full px-4 py-2.5 rounded-xl bg-[#F5F5F5] text-sm text-[#1C1B1F] border-2 border-transparent focus:border-[#3D7A52] outline-none transition-colors",
                  errors.tripName && "border-[#E53935] bg-[#FFF5F5]",
                )}
              />
              {errors.tripName && (
                <p className="text-[#E53935] text-xs mt-1">{errors.tripName}</p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold text-[#9E9E9E] uppercase tracking-wider mb-1.5 block">
                  Data Início *
                </label>
                <input
                  type="date"
                  value={form.startDate}
                  onChange={(e) => {
                    setForm((f) => ({ ...f, startDate: e.target.value }));
                    setErrors((e) => ({ ...e, startDate: "" }));
                  }}
                  className={clsx(
                    "w-full px-4 py-2.5 rounded-xl bg-[#F5F5F5] text-sm text-[#1C1B1F] border-2 border-transparent focus:border-[#3D7A52] outline-none transition-colors",
                    errors.startDate && "border-[#E53935] bg-[#FFF5F5]",
                  )}
                />
                {errors.startDate && (
                  <p className="text-[#E53935] text-xs mt-1">
                    {errors.startDate}
                  </p>
                )}
              </div>
              <div>
                <label className="text-[10px] font-bold text-[#9E9E9E] uppercase tracking-wider mb-1.5 block">
                  Data Fim
                </label>
                <input
                  type="date"
                  value={form.endDate}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, endDate: e.target.value }))
                  }
                  className="w-full px-4 py-2.5 rounded-xl bg-[#F5F5F5] text-sm text-[#1C1B1F] border-2 border-transparent focus:border-[#3D7A52] outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-[#9E9E9E] uppercase tracking-wider mb-1.5 block">
                Localidade
              </label>
              <input
                type="text"
                value={form.location}
                onChange={(e) =>
                  setForm((f) => ({ ...f, location: e.target.value }))
                }
                placeholder="Município, Estado, País"
                className="w-full px-4 py-2.5 rounded-xl bg-[#F5F5F5] text-sm text-[#1C1B1F] border-2 border-transparent focus:border-[#3D7A52] outline-none transition-colors"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-[#9E9E9E] uppercase tracking-wider mb-1.5 block">
                Código de Compartilhamento
              </label>
              <input
                type="text"
                value={form.shareCode}
                onChange={(e) =>
                  setForm((f) => ({ ...f, shareCode: e.target.value }))
                }
                placeholder="Código opcional para colaboradores"
                className="w-full px-4 py-2.5 rounded-xl bg-[#F5F5F5] text-sm text-[#1C1B1F] border-2 border-transparent focus:border-[#3D7A52] outline-none transition-colors"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[20px] shadow-[0_2px_8px_rgba(0,0,0,0.08)] p-6">
          <div className="flex items-center gap-2 mb-6">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              className="text-[#3D7A52]"
            >
              <path
                d="M17 21V19C17 16.7909 15.2091 15 13 15H5C2.79086 15 1 16.7909 1 19V21"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle
                cx="9"
                cy="7"
                r="4"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M23 21V19C23 17.1432 21.733 15.5824 20 15.13M16 3.13C17.733 3.5824 19 5.14318 19 7C19 8.85682 17.733 10.4176 16 10.87"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <h2 className="text-[11px] font-bold text-[#3D7A52] uppercase tracking-widest">
              Membros da Equipe
            </h2>
          </div>

          <div className="space-y-4">
            {teamMembers.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {teamMembers.map((member, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-1.5 bg-[#E8F5E9] text-[#2D5F3F] px-3 py-1.5 rounded-full text-sm font-medium"
                  >
                    {member}
                    <button
                      type="button"
                      onClick={() => removeMember(idx)}
                      className="hover:text-[#1C1B1F] transition-colors"
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <path
                          d="M18 6L6 18M6 6L18 18"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div>
              <label className="text-[10px] font-bold text-[#9E9E9E] uppercase tracking-wider mb-1.5 block">
                Adicionar Membro
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMember}
                  onChange={(e) => setNewMember(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addMember();
                    }
                  }}
                  placeholder="Nome"
                  className="flex-1 px-4 py-2.5 rounded-xl bg-[#F5F5F5] text-sm text-[#1C1B1F] border-2 border-transparent focus:border-[#3D7A52] outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={addMember}
                  className="px-4 py-2.5 rounded-xl bg-[#3D7A52] text-white text-sm font-medium hover:bg-[#2D5F3F] transition-colors"
                >
                  Adicionar
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[20px] shadow-[0_2px_8px_rgba(0,0,0,0.08)] p-6">
          <div className="flex items-center gap-2 mb-6">
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

          <div>
            <label className="text-[10px] font-bold text-[#9E9E9E] uppercase tracking-wider mb-1.5 block">
              Informações Adicionais
            </label>
            <textarea
              rows={4}
              value={form.notes}
              onChange={(e) =>
                setForm((f) => ({ ...f, notes: e.target.value }))
              }
              placeholder="Objetivos da expedição, logística, condições climáticas..."
              className="w-full px-4 py-2.5 rounded-xl bg-[#F5F5F5] text-sm text-[#1C1B1F] border-2 border-transparent focus:border-[#3D7A52] outline-none transition-colors resize-y"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4">
          <Link
            href="/sessions"
            className="px-6 py-3 rounded-full bg-white border border-[#EEEEEE] text-[#49454F] text-sm font-medium hover:bg-[#F5F5F5] transition-colors"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-3 rounded-full bg-[#3D7A52] text-white text-sm font-medium shadow-[0_2px_8px_rgba(61,122,82,0.3)] hover:bg-[#2D5F3F] transition-colors disabled:opacity-60"
          >
            {submitting ? "Criando..." : "Criar Sessão"}
          </button>
        </div>
      </form>
    </div>
  );
}
