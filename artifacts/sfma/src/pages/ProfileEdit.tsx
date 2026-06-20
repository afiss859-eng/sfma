import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useQueryClient } from "@tanstack/react-query";
import Layout from "@/components/Layout";
import { customFetch } from "@/lib/custom-fetch";
import { getGetMeQueryKey } from "@workspace/api-client-react";

const COUNTRY_LIST = [
  "France", "Maroc", "Algérie", "Tunisie", "Belgique", "Suisse", "Canada",
  "Côte d'Ivoire", "Sénégal", "Cameroun", "Guinée", "Mali", "Espagne",
  "Italie", "Allemagne", "USA", "Autre",
];

export default function ProfileEdit() {
  const { user, login, token } = useAuth();
  const qc = useQueryClient();
  const [bio, setBio] = useState(user?.bio || "");
  const [country, setCountry] = useState(user?.country || "");
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || "");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>(user?.avatarUrl || "");
  const [whatsapp, setWhatsapp] = useState(user?.whatsapp || "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  if (!user) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setAvatarPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      let finalAvatarUrl = avatarUrl;

      // If user picked a local file, convert to base64 data URL for now
      // (in production, you'd upload to a storage bucket)
      if (avatarFile && avatarPreview.startsWith("data:")) {
        finalAvatarUrl = avatarPreview;
      }

      // Update profile via PATCH /api/members/:id (bio, country)
      const profileRes = await customFetch(`/api/members/${user.id}`, {
        method: "PATCH",
        body: JSON.stringify({ bio, country }),
      });

      // Update avatar if changed
      if (finalAvatarUrl && finalAvatarUrl !== user.avatarUrl) {
        await customFetch(`/api/members/${user.id}/avatar`, {
          method: "POST",
          body: JSON.stringify({ avatarUrl: finalAvatarUrl }),
        });
      }

      // Refresh user from /api/auth/me
      const me = await customFetch("/api/auth/me") as any;
      login(me, token!);
      qc.invalidateQueries({ queryKey: getGetMeQueryKey() });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      setError("Erreur lors de la sauvegarde. Réessayez.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Layout>
      <div className="p-4 md:p-6 overflow-y-auto h-[calc(100vh-60px)]">
        <h1 className="sfma-title text-2xl text-yellow-400 mb-8">Mon Profil</h1>

        <div className="max-w-lg mx-auto glass-panel gold-border rounded-2xl p-6">
          <form onSubmit={handleSave} className="space-y-5">
            {/* Avatar section */}
            <div className="flex flex-col items-center gap-3 mb-2">
              <div className="relative">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="avatar" className="w-24 h-24 rounded-full object-cover border-2 border-yellow-600" />
                ) : (
                  <div className="w-24 h-24 rounded-full flex items-center justify-center border-2 border-yellow-600 text-4xl"
                    style={{ background: "radial-gradient(circle, rgba(139,0,0,0.4), rgba(10,10,15,0.9))" }}>
                    {user.gradeEmoji}
                  </div>
                )}
                <label className="absolute -bottom-2 -right-2 cursor-pointer w-8 h-8 rounded-full flex items-center justify-center text-sm"
                  style={{ background: "linear-gradient(135deg, #8B0000, #CC0000)", border: "1px solid rgba(255,68,68,0.4)" }}>
                  📷
                  <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" data-testid="input-avatar-file" />
                </label>
              </div>
              <span className="text-gray-500 text-xs">Cliquez sur 📷 pour changer la photo</span>
            </div>

            {/* Or use a URL */}
            <div>
              <label className="block text-gray-400 text-xs mb-1">Ou entrez une URL d'image</label>
              <input
                data-testid="input-avatar-url"
                type="url"
                value={avatarUrl}
                onChange={e => { setAvatarUrl(e.target.value); setAvatarPreview(e.target.value); setAvatarFile(null); }}
                placeholder="https://example.com/photo.jpg"
                className="w-full px-4 py-2 rounded-lg bg-[#0F0F18] border border-red-900/30 text-white placeholder-gray-600 focus:outline-none focus:border-yellow-600 transition-colors text-sm"
              />
            </div>

            {/* Read-only info */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-gray-400 text-xs mb-1">Pseudo</label>
                <div className="px-4 py-2 rounded-lg bg-[#0A0A0F]/50 border border-gray-800 text-gray-400 text-sm">{user.username}</div>
              </div>
              <div>
                <label className="block text-gray-400 text-xs mb-1">ID Membre</label>
                <div className="px-4 py-2 rounded-lg bg-[#0A0A0F]/50 border border-gray-800 text-gray-400 text-sm">{user.memberId}</div>
              </div>
            </div>

            {/* Country */}
            <div>
              <label className="block text-gray-400 text-xs mb-1">Pays</label>
              <select
                data-testid="select-country"
                value={country}
                onChange={e => setCountry(e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-[#0F0F18] border border-red-900/30 text-white focus:outline-none focus:border-yellow-600 transition-colors text-sm"
              >
                <option value="">Sélectionner...</option>
                {COUNTRY_LIST.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {/* WhatsApp */}
            <div>
              <label className="block text-gray-400 text-xs mb-1">Numéro WhatsApp</label>
              <input
                data-testid="input-whatsapp"
                type="text"
                value={whatsapp}
                onChange={e => setWhatsapp(e.target.value)}
                placeholder="+33612345678"
                className="w-full px-4 py-2 rounded-lg bg-[#0F0F18] border border-red-900/30 text-white placeholder-gray-600 focus:outline-none focus:border-yellow-600 transition-colors text-sm"
              />
            </div>

            {/* Bio */}
            <div>
              <label className="block text-gray-400 text-xs mb-1">Bio</label>
              <textarea
                data-testid="input-bio"
                value={bio}
                onChange={e => setBio(e.target.value)}
                rows={3}
                maxLength={200}
                placeholder="Décrivez-vous en quelques mots..."
                className="w-full px-4 py-2 rounded-lg bg-[#0F0F18] border border-red-900/30 text-white placeholder-gray-600 focus:outline-none focus:border-yellow-600 transition-colors text-sm resize-none"
              />
              <div className="text-gray-600 text-xs text-right mt-1">{bio.length}/200</div>
            </div>

            {error && <div className="text-red-400 text-sm bg-red-900/20 rounded-lg p-3 border border-red-800/40">{error}</div>}

            {saved && <div className="text-green-400 text-sm bg-green-900/20 rounded-lg p-3 border border-green-800/40">✅ Profil mis à jour avec succès !</div>}

            <button
              data-testid="button-save-profile"
              type="submit"
              disabled={saving}
              className="btn-ripple w-full py-3 rounded-lg font-semibold text-white transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50"
              style={{ background: "linear-gradient(135deg, #8B0000, #CC0000)", border: "1px solid rgba(255,68,68,0.4)", boxShadow: "0 0 20px rgba(204,0,0,0.3)" }}
            >
              {saving ? "Sauvegarde..." : "Sauvegarder le profil"}
            </button>
          </form>
        </div>
      </div>
    </Layout>
  );
}
