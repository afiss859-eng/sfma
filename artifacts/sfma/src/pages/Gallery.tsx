import { useState } from "react";
import { useListGallery, useSubmitPhoto, getListGalleryQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import Layout from "@/components/Layout";

export default function Gallery() {
  const { data: photos, isLoading } = useListGallery();
  const submitMutation = useSubmitPhoto();
  const queryClient = useQueryClient();
  const [url, setUrl] = useState("");
  const [caption, setCaption] = useState("");
  const [showForm, setShowForm] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    submitMutation.mutate({ data: { url: url.trim(), caption: caption.trim() } }, {
      onSuccess: () => {
        setUrl(""); setCaption(""); setShowForm(false);
        queryClient.invalidateQueries({ queryKey: getListGalleryQueryKey() });
      },
    });
  };

  return (
    <Layout>
      <div className="p-4 md:p-6 overflow-y-auto h-[calc(100vh-60px)]">
        <div className="flex items-center justify-between mb-6">
          <h1 className="sfma-title text-2xl text-yellow-400">Galerie</h1>
          <button
            data-testid="button-submit-photo"
            onClick={() => setShowForm(!showForm)}
            className="btn-ripple px-4 py-2 rounded-lg text-sm font-medium text-white transition-all hover:scale-105"
            style={{ background: "linear-gradient(135deg, #8B0000, #CC0000)", border: "1px solid rgba(255,68,68,0.4)" }}
          >
            + Proposer une photo
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="glass-panel gold-border rounded-xl p-4 mb-6 space-y-3">
            <h3 className="sfma-title text-yellow-400 text-sm">Proposer une photo (en attente d'approbation)</h3>
            <input
              data-testid="input-photo-url"
              type="url"
              value={url}
              onChange={e => setUrl(e.target.value)}
              placeholder="URL de l'image"
              className="w-full px-4 py-2 rounded-lg bg-[#0F0F18] border border-red-900/30 text-white placeholder-gray-600 focus:outline-none focus:border-yellow-600 transition-colors text-sm"
              required
            />
            <input
              data-testid="input-photo-caption"
              type="text"
              value={caption}
              onChange={e => setCaption(e.target.value)}
              placeholder="Légende (optionnel)"
              className="w-full px-4 py-2 rounded-lg bg-[#0F0F18] border border-red-900/30 text-white placeholder-gray-600 focus:outline-none focus:border-yellow-600 transition-colors text-sm"
            />
            <div className="flex gap-2">
              <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-2 rounded-lg text-gray-400 border border-gray-700 hover:border-gray-500 text-sm transition-all">
                Annuler
              </button>
              <button type="submit" disabled={submitMutation.isPending}
                className="btn-ripple flex-1 py-2 rounded-lg font-medium text-white text-sm disabled:opacity-50"
                style={{ background: "linear-gradient(135deg, #8B0000, #CC0000)" }}>
                {submitMutation.isPending ? "Envoi..." : "Soumettre"}
              </button>
            </div>
          </form>
        )}

        {isLoading ? (
          <div className="text-yellow-400 sfma-title animate-pulse text-center py-12">Chargement...</div>
        ) : photos?.length === 0 ? (
          <div className="glass-panel gold-border rounded-xl p-8 text-center text-gray-500">
            Aucune photo approuvée dans la galerie
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {photos?.map((photo: any) => (
              <div key={photo.id} data-testid={`photo-${photo.id}`} className="glass-panel gold-border rounded-xl overflow-hidden card-tilt">
                <img src={photo.url} alt={photo.caption || ""} className="w-full h-40 object-cover" />
                {photo.caption && (
                  <div className="p-2 text-gray-400 text-xs text-center">{photo.caption}</div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
