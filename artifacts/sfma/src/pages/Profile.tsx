import { useParams } from "wouter";
import { useGetMember, getGetMemberQueryKey } from "@workspace/api-client-react";
import GradeBadge from "@/components/GradeBadge";
import ParticleBackground from "@/components/ParticleBackground";
import { Link } from "wouter";

export default function Profile() {
  const { id } = useParams<{ id: string }>();
  const { data: member, isLoading } = useGetMember(id, {
    query: { enabled: !!id, queryKey: getGetMemberQueryKey(id) },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center">
        <div className="text-yellow-400 sfma-title animate-pulse">Chargement...</div>
      </div>
    );
  }

  if (!member) {
    return (
      <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center">
        <div className="text-red-400">Membre introuvable</div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#0A0A0F] overflow-hidden">
      <ParticleBackground />
      <div className="relative z-10 max-w-md mx-auto px-6 py-12">
        <Link href="/members">
          <button className="text-gray-500 hover:text-yellow-400 text-sm mb-6 transition-colors">
            ← Retour aux membres
          </button>
        </Link>

        <div className="glass-panel gold-border rounded-2xl p-6 text-center">
          {/* Avatar */}
          <div className="mb-4">
            {(member as any).avatarUrl ? (
              <img src={(member as any).avatarUrl} alt={(member as any).username} className="w-24 h-24 rounded-full object-cover mx-auto border-2 border-yellow-600" />
            ) : (
              <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto border-2 border-yellow-600 text-4xl"
                style={{ background: "radial-gradient(circle, rgba(139,0,0,0.4), rgba(10,10,15,0.9))" }}>
                {(member as any).gradeEmoji}
              </div>
            )}
          </div>

          <h1 className="sfma-title text-2xl text-white mb-1">{(member as any).username}</h1>
          <div className="text-yellow-600 text-sm mb-3">{(member as any).memberId}</div>

          <div className="flex justify-center mb-4">
            <GradeBadge grade={(member as any).grade} emoji={(member as any).gradeEmoji} size="lg" />
          </div>

          {(member as any).bio && (
            <p className="text-gray-400 text-sm mb-4 italic">"{(member as any).bio}"</p>
          )}

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="glass-panel rounded-lg p-3">
              <div className="text-gray-500 text-xs mb-1">Pays</div>
              <div className="text-white">{(member as any).country || "—"}</div>
            </div>
            <div className="glass-panel rounded-lg p-3">
              <div className="text-gray-500 text-xs mb-1">Réputation</div>
              <div className="text-yellow-400 font-bold">{(member as any).reputation} pts</div>
            </div>
            <div className="glass-panel rounded-lg p-3 col-span-2">
              <div className="text-gray-500 text-xs mb-1">Membre depuis</div>
              <div className="text-white">{new Date((member as any).joinedAt).toLocaleDateString("fr-FR")}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
