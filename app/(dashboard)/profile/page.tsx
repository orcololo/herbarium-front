"use client";

import { ChangeEvent, FormEvent, useEffect, useRef, useState } from "react";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import {
  Building2,
  Camera,
  Mail,
  Save,
  Shield,
  Upload,
  UserCircle,
} from "lucide-react";

const ROLE_LABELS: Record<string, string> = {
  admin: "Administrador",
  researcher: "Pesquisador",
  collector: "Coletor",
};

type ProfileForm = {
  name: string;
  email: string;
  institution: string;
  avatar: string;
};

export default function ProfilePage() {
  const { user, updateProfile } = useAuth();
  const [form, setForm] = useState<ProfileForm>({
    name: "",
    email: "",
    institution: "",
    avatar: "",
  });
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const loadedUserIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!user) return;
    if (loadedUserIdRef.current === user.id) return;
    loadedUserIdRef.current = user.id;
    setForm({
      name: user.name ?? "",
      email: user.email ?? "",
      institution: user.institution ?? "",
      avatar: user.avatar ?? "",
    });
  }, [user]);

  useEffect(() => {
    return () => {
      if (avatarPreview?.startsWith("blob:"))
        URL.revokeObjectURL(avatarPreview);
    };
  }, [avatarPreview]);

  function getProfilePayload(avatar = form.avatar) {
    return {
      name: form.name.trim(),
      email: form.email.trim(),
      institution: form.institution.trim() || undefined,
      avatar: avatar.trim() || undefined,
    };
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (uploadingAvatar) return;
    setSaving(true);
    setSaved(false);
    setError(null);
    try {
      await updateProfile(getProfilePayload());
      setSaved(true);
      setTimeout(() => setSaved(false), 2400);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Falha ao salvar perfil.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleAvatarUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    setAvatarPreview(previewUrl);
    setUploadingAvatar(true);
    setSaved(false);
    setError(null);

    try {
      const upload = await api.upload.image(file);
      const avatar = upload.thumbnailUrl || upload.url;
      await updateProfile({ avatar });
      setForm((prev) => ({ ...prev, avatar }));
      setAvatarPreview(null);
      setSaved(true);
      setTimeout(() => setSaved(false), 2400);
    } catch (err) {
      setAvatarPreview(null);
      setError(
        err instanceof ApiError
          ? err.message
          : "Falha ao enviar foto de perfil.",
      );
    } finally {
      setUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  const initials = user?.name?.charAt(0).toUpperCase() ?? "U";
  const role = user?.role ?? "collector";
  const avatarSrc = avatarPreview ?? form.avatar;

  return (
    <div className="max-w-5xl mx-auto animate-fade-in space-y-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-[#E8F5E9] text-[#3D7A52] flex items-center justify-center shadow-sm overflow-hidden">
            {avatarSrc ? (
              <img
                src={avatarSrc}
                alt=""
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-xl font-bold">{initials}</span>
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#1C1B1F]">Perfil</h1>
            <p className="text-sm text-[#6D4C41] mt-1">{user?.email}</p>
          </div>
        </div>
        <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#E8F5E9] text-[#2D5F3F] text-xs font-bold uppercase tracking-wider w-fit">
          <Shield className="w-3.5 h-3.5" />
          {ROLE_LABELS[role] ?? role}
        </span>
      </header>

      {error && (
        <div className="bg-[#FFEBEE] text-[#C62828] px-4 py-3 rounded-xl text-sm border border-[#FFCDD2]">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.08)] p-6 space-y-5"
        >
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 pb-5 border-b border-[#EEEEEE]">
            <div className="relative w-20 h-20 rounded-full bg-[#F1F8E9] text-[#3D7A52] flex items-center justify-center overflow-hidden shadow-inner shrink-0">
              {avatarSrc ? (
                <img
                  src={avatarSrc}
                  alt=""
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-2xl font-bold">{initials}</span>
              )}
              {uploadingAvatar && (
                <div className="absolute inset-0 bg-black/35 flex items-center justify-center text-white text-xs font-bold">
                  ...
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingAvatar || saving}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#E8F5E9] text-[#2D5F3F] text-sm font-medium hover:bg-[#DDEEDC] disabled:opacity-60 transition-colors"
              >
                {uploadingAvatar ? (
                  <Upload className="w-4 h-4 animate-pulse" />
                ) : (
                  <Camera className="w-4 h-4" />
                )}
                {uploadingAvatar ? "Enviando..." : "Enviar foto"}
              </button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleAvatarUpload}
              tabIndex={-1}
              aria-hidden="true"
              className="hidden"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="block">
              <span className="flex items-center gap-2 text-[10px] font-bold text-[#9E9E9E] uppercase tracking-wider mb-1.5">
                <UserCircle className="w-3.5 h-3.5" /> Nome
              </span>
              <input
                type="text"
                required
                value={form.name}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, name: event.target.value }))
                }
                className="w-full px-4 py-3 rounded-xl bg-[#F5F5F5] text-sm text-[#1C1B1F] border-2 border-transparent focus:border-[#3D7A52] outline-none transition-colors"
              />
            </label>

            <label className="block">
              <span className="flex items-center gap-2 text-[10px] font-bold text-[#9E9E9E] uppercase tracking-wider mb-1.5">
                <Mail className="w-3.5 h-3.5" /> E-mail
              </span>
              <input
                type="email"
                required
                value={form.email}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, email: event.target.value }))
                }
                className="w-full px-4 py-3 rounded-xl bg-[#F5F5F5] text-sm text-[#1C1B1F] border-2 border-transparent focus:border-[#3D7A52] outline-none transition-colors"
              />
            </label>
          </div>

          <label className="block">
            <span className="flex items-center gap-2 text-[10px] font-bold text-[#9E9E9E] uppercase tracking-wider mb-1.5">
              <Building2 className="w-3.5 h-3.5" /> Instituição
            </span>
            <input
              type="text"
              value={form.institution}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  institution: event.target.value,
                }))
              }
              className="w-full px-4 py-3 rounded-xl bg-[#F5F5F5] text-sm text-[#1C1B1F] border-2 border-transparent focus:border-[#3D7A52] outline-none transition-colors"
            />
          </label>

          <label className="block">
            <span className="text-[10px] font-bold text-[#9E9E9E] uppercase tracking-wider mb-1.5 block">
              Avatar URL
            </span>
            <input
              type="url"
              value={form.avatar}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, avatar: event.target.value }))
              }
              className="w-full px-4 py-3 rounded-xl bg-[#F5F5F5] text-sm text-[#1C1B1F] border-2 border-transparent focus:border-[#3D7A52] outline-none transition-colors"
            />
          </label>

          <div className="flex items-center justify-end gap-3 pt-2">
            {saved && (
              <span className="text-sm font-medium text-[#3D7A52]">Salvo</span>
            )}
            <button
              type="submit"
              disabled={saving || uploadingAvatar}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#3D7A52] text-white text-sm font-medium hover:bg-[#2D5F3F] disabled:opacity-60 transition-colors"
            >
              <Save className="w-4 h-4" />
              {saving ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </form>

        <aside className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.08)] p-6 h-fit space-y-5">
          <div>
            <p className="text-[10px] font-bold text-[#9E9E9E] uppercase tracking-wider mb-1">
              ID
            </p>
            <p className="text-sm text-[#49454F] break-all font-mono">
              {user?.id}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-[#9E9E9E] uppercase tracking-wider mb-1">
              Função
            </p>
            <p className="text-sm text-[#1C1B1F] font-medium">
              {ROLE_LABELS[role] ?? role}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-[#9E9E9E] uppercase tracking-wider mb-1">
              Status
            </p>
            <p className="text-sm text-[#1C1B1F] font-medium">
              {user?.isActive === false ? "Inativo" : "Ativo"}
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
