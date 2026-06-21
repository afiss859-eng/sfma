import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { useQueryClient } from "@tanstack/react-query";
import Layout from "@/components/Layout";
import { customFetch } from "@/lib/custom-fetch";
import { getGetMeQueryKey } from "@workspace/api-client-react";

const COUNTRY_LIST = [
  "France", "Maroc", "Algérie", "Tunisie", "Belgique", "Suisse", "Canada",
  "Côte d'Ivoire", "Sénégal", "Cameroun", "Guinée", "Mali", "Congo",
  "Madagascar", "Espagne", "Italie", "Allemagne", "USA", "Autre",
];

export default function ProfileEdit() {
  const { user, login, token } = useAuth();
  const qc = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [bio, setBio] = useState(user?.bio || "");
  const [country, setCountry] = useState(user?.country || "");
  const [avatarPreview, setAvatarPreview] = useState<string>(user?.avatarUrl || "");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || "");
  const [whatsapp, setWhatsapp] = useState(user?.whatsapp || "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);

  if (!user) return null;

  const processFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Seules les images sont acceptées (JPG, PNG, GIF, WebP).");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Image trop lourde (max 5 Mo).");
      return;
    }
    setAvatarFile(file);
    setError("");
    const reader = new FileReader();
    reader.onload = (ev) => {
      setAvatarPreview(ev.target?.result as string);
      setAvatarUrl("");
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      let finalAvatarUrl = avatarUrl;
      if (avatarFile && avatarPreview.startsWith("data:")) {
        finalAvatarUrl = avatarPreview;
      }

      await customFetch(`/api/members/${user.id}`, {
        method: "PATCH",
        body: JSON.stringify({ bio, country, whatsapp }),
      });

      if (finalAvatarUrl && finalAvatarUrl !== user.avatarUrl) {
        await customFetch(`/api/members/${user.id}/avatar`, {
          method: "POST",
          body: JSON.stringify({ avatarUrl: finalAvatarUrl }),
        });
      }

      const me = await customFetch("/api/auth/me") as any;
      login(me, token!);
      qc.invalidateQueries({ queryKey: getGetMeQueryKey() });
      setSaved(true);
      setAvatarFile(null);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setError("Erreur lors de la sauvegarde. Réessayez.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Layout>
      <div className="p-4 md:p-6 overflow-y-auto h-[calc(100vh-60px)]">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="sfma-title text-2xl text-yellow-400 mb-6"
        >
          ✏️ Mon Profil
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="max-w-lg mx-auto glass-panel gold-border rounded-2xl p-6"
        >
          <form onSubmit={handleSave} className="space-y-5">
            {/* Avatar */}
            <div className="flex flex-col items-center gap-3">
              {/* Zone de drop / aperçu */}
              <div
                className={`relative cursor-pointer transition-all ${dragOver ? "scale-105" : ""}`}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <div className={`w-28 h-28 rounded-full overflow-hidden border-2 transition-all ${dragOver ? "border-yellow-400 shadow-[0_0_20px_rgba(201,162,39,0.6)]" : "border-yellow-600/60"}`}
                  style={{ background: "radial-gradient(circle, rgba(139,0,0,0.4), rgba(10,10,15,0.9))" }}>
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="avatar" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl">
                      {user.gradeEmoji}
                    </div>
                  )}
                </div>
                {/* Overlay caméra */}
                <div className="absolute inset-0 rounded-full flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity">
                  <span className="text-2xl">📷</span>
                </div>
                {/* Badge caméra */}
                <div className="absolute -bottom-1 -right-1 w-9 h-9 rounded-full flex items-center justify-center text-sm border-2 border-[#0A0A0F]"
                  style={{ background: "linear-gradient(135deg, #8B0000, #CC0000)" }}>
                  📷
                </div>
              </div>

              {/* Input fichier natif (déclenché par le clic sur l'avatar) */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileChange}
                className="hidden"
                data-testid="input-avatar-file"
              />

              <p className="text-gray-500 text-xs text-center">
                Appuyez pour ouvrir la galerie ou la caméra<br />
                <span className="text-gray-700">JPG, PNG, GIF · max 5 Mo</span>
              </p>

              {avatarFile && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="text-xs text-green-400 bg-green-900/20 rounded px-2 py-1">
                  ✓ {avatarFile.name}
                </motion.div>
              )}
            </div>

            {/* URL alternative */}
            <div>
              <label className="block text-gray-400 text-xs mb-1 sfma-title tracking-wider">OU URL D'IMAGE</label>
              <input
                data-testid="input-avatar-url"
                type="url"
                value={avatarUrl}
                onChange={e => { setAvatarUrl(e.target.value); setAvatarPreview(e.target.value); setAvatarFile(null); }}
                placeholder="https://example.com/photo.jpg"
                className="w-full px-4 py-2.5 rounded-xl bg-[#0F0F18] border border-red-900/30 text-white placeholder-gray-600 focus:outline-none focus:border-yellow-600/60 transition-colors text-sm"
              />
            </div>

            {/* Infos lecture seule */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-gray-500 text-xs mb-1 sfma-title tracking-wider">PSEUDO</label>
                <div className="px-4 py-2.5 rounded-xl bg-[#0A0A0F]/70 border border-gray-800/60 text-gray-400 text-sm">{user.username}</div>
              </div>
              <div>
                <label className="block text-gray-500 text-xs mb-1 sfma-title tracking-wider">ID MEMBRE</label>
                <div className="px-4 py-2.5 rounded-xl bg-[#0A0A0F]/70 border border-gray-800/60 text-yellow-600 text-sm font-mono">{user.memberId}</div>
              </div>
            </div>

            {/* Pays */}
            <div>
              <label className="block text-gray-400 text-xs mb-1 sfma-title tracking-wider">PAYS</label>
              <select
                data-testid="select-country"
                value={country}
                onChange={e => setCountry(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-[#0F0F18] border border-red-900/30 text-white focus:outline-none focus:border-yellow-600/60 transition-colors text-sm"
              >
                <option value="">Sélectionner...</option>
                {COUNTRY_LIST.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {/* WhatsApp */}
            <div>
              <label className="block text-gray-400 text-xs mb-1 sfma-title tracking-wider">NUMÉRO WHATSAPP</label>
              <div className="flex items-center gap-2">
                <span className="text-xl">📱</span>
                <input
                  data-testid="input-whatsapp"
                  type="tel"
                  value={whatsapp}
                  onChange={e => setWhatsapp(e.target.value)}
                  placeholder="+33 6 12 34 56 78"
                  className="flex-1 px-4 py-2.5 rounded-xl bg-[#0F0F18] border border-red-900/30 text-white placeholder-gray-600 focus:outline-none focus:border-yellow-600/60 transition-colors text-sm"
                />
              </div>
            </div>

            {/* Bio */}
            <div>
              <label className="block text-gray-400 text-xs mb-1 sfma-title tracking-wider">BIO</label>
              <textarea
                data-testid="input-bio"
                value={bio}
                onChange={e => setBio(e.target.value)}
                rows={3}
                maxLength={200}
                placeholder="Décrivez-vous en quelques mots..."
                className="w-full px-4 py-2.5 rounded-xl bg-[#0F0F18] border border-red-900/30 text-white placeholder-gray-600 focus:outline-none focus:border-yellow-600/60 transition-colors text-sm resize-none"
              />
              <div className="text-gray-600 text-xs text-right mt-1">{bio.length}/200</div>
            </div>

            {error && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="text-red-400 text-sm bg-red-900/20 rounded-xl p-3 border border-red-800/40">
                ⚠️ {error}
              </motion.div>
            )}

            <AnimatePresenceWrapper show={saved}>
              <div className="text-green-400 text-sm bg-green-900/20 rounded-xl p-3 border border-green-800/40">
                ✅ Profil mis à jour avec succès !
              </div>
            </AnimatePresenceWrapper>

            <motion.button
              data-testid="button-save-profile"
              type="submit"
              disabled={saving}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3 rounded-xl font-semibold text-white transition-all disabled:opacity-50 sfma-title tracking-wider"
              style={{ background: "linear-gradient(135deg, #8B0000, #CC0000)", border: "1px solid rgba(255,68,68,0.4)", boxShadow: "0 0 20px rgba(204,0,0,0.3)" }}
            >
              {saving ? "⏳ Sauvegarde..." : "💾 SAUVEGARDER"}
            </motion.button>
          </form>
        </motion.div>
      </div>
    </Layout>
  );
}

function AnimatePresenceWrapper({ show, children }: { show: boolean; children: React.ReactNode }) {
  if (!show) return null;
  return <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}>{children}</motion.div>;
}
