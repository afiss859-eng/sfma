import { useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import Layout from "@/components/Layout";
import GradeBadge from "@/components/GradeBadge";

export default function MemberCard() {
  const { user } = useAuth();
  const cardRef = useRef<HTMLDivElement>(null);

  const handleExport = () => {
    if (!cardRef.current) return;
    // Simple print / screenshot hint
    window.print();
  };

  if (!user) return null;

  return (
    <Layout>
      <div className="p-4 md:p-6 overflow-y-auto h-[calc(100vh-60px)] flex flex-col items-center">
        <h1 className="sfma-title text-2xl text-yellow-400 mb-8">Ma Carte de Membre</h1>

        <div
          ref={cardRef}
          data-testid="member-card"
          className="relative w-full max-w-sm rounded-2xl overflow-hidden"
          style={{
            background: "linear-gradient(135deg, #0F0005 0%, #1A0000 50%, #0A0A0F 100%)",
            border: "1px solid rgba(201,162,39,0.5)",
            boxShadow: "0 0 40px rgba(201,162,39,0.2), 0 0 80px rgba(139,0,0,0.2)",
          }}
        >
          {/* Top accent */}
          <div className="h-1 w-full" style={{ background: "linear-gradient(90deg, #8B0000, #C9A227, #8B0000)" }} />

          <div className="p-6">
            {/* Header */}
            <div className="flex justify-between items-start mb-6">
              <div>
                <div className="sfma-title text-yellow-400 text-xs tracking-widest">SUPRÊME FAMILLE</div>
                <div className="sfma-title text-red-500 text-xs tracking-widest">MUZAN AMPIROUS</div>
              </div>
              <span className="text-2xl">⚜️</span>
            </div>

            {/* Avatar + Info */}
            <div className="flex gap-4 mb-6">
              <div>
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt={user.username} className="w-20 h-20 rounded-xl object-cover border-2 border-yellow-600/60" />
                ) : (
                  <div className="w-20 h-20 rounded-xl flex items-center justify-center border-2 border-yellow-600/60 text-4xl"
                    style={{ background: "radial-gradient(circle, rgba(139,0,0,0.5), rgba(10,10,15,0.9))" }}>
                    {user.gradeEmoji}
                  </div>
                )}
              </div>
              <div className="flex-1">
                <div className="sfma-title text-white text-xl font-bold mb-1">{user.username}</div>
                <div className="text-yellow-600 text-sm mb-2">{user.memberId}</div>
                <GradeBadge grade={user.grade} emoji={user.gradeEmoji} size="md" />
              </div>
            </div>

            {/* Details */}
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <div className="text-gray-600 text-xs">PAYS</div>
                <div className="text-white">{user.country || "—"}</div>
              </div>
              <div>
                <div className="text-gray-600 text-xs">RÉPUTATION</div>
                <div className="text-yellow-400 font-bold">{user.reputation} pts</div>
              </div>
              <div>
                <div className="text-gray-600 text-xs">MEMBRE DEPUIS</div>
                <div className="text-white">{new Date(user.joinedAt).toLocaleDateString("fr-FR")}</div>
              </div>
              <div>
                <div className="text-gray-600 text-xs">STATUT</div>
                <div className="text-green-400">Actif</div>
              </div>
            </div>

            {/* Bottom */}
            <div className="mt-4 pt-4 border-t border-yellow-900/30 flex justify-between items-center">
              <div className="text-gray-600 text-xs">sfma-clan.app</div>
              <div className="text-yellow-700 text-xs sfma-title">MEMBRE VÉRIFIÉ</div>
            </div>
          </div>

          {/* Bottom accent */}
          <div className="h-0.5 w-full" style={{ background: "linear-gradient(90deg, transparent, #C9A227, transparent)" }} />
        </div>

        <button
          data-testid="button-export-card"
          onClick={handleExport}
          className="btn-ripple mt-6 px-6 py-3 rounded-lg font-semibold text-yellow-400 border border-yellow-700 hover:border-yellow-500 transition-all hover:scale-105"
        >
          📥 Exporter / Capturer
        </button>
      </div>
    </Layout>
  );
}
