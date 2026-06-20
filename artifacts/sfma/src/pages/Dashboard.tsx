import { useEffect, useState } from "react";
import { useGetCommunityStats } from "@workspace/api-client-react";
import Layout from "@/components/Layout";
import GradeBadge from "@/components/GradeBadge";

function AnimatedCounter({ target, duration = 1500 }: { target: number; duration?: number }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (target === 0) return;
    const start = Date.now();
    const timer = setInterval(() => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      setCount(Math.floor(progress * target));
      if (progress >= 1) clearInterval(timer);
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return <span>{count}</span>;
}

export default function Dashboard() {
  const { data: stats, isLoading } = useGetCommunityStats();

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-yellow-400 sfma-title animate-pulse">Chargement...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-4 md:p-6 overflow-y-auto h-[calc(100vh-60px)]">
        <h1 className="sfma-title text-2xl text-yellow-400 mb-6">Tableau de Bord</h1>

        {/* Stats grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Membres", value: stats?.totalMembers || 0, icon: "👥", color: "#C9A227" },
            { label: "Messages", value: stats?.totalMessages || 0, icon: "💬", color: "#CC0000" },
            { label: "Événements", value: stats?.totalEvents || 0, icon: "📅", color: "#8B4513" },
            { label: "Candidatures", value: stats?.pendingApplications || 0, icon: "📋", color: "#6B48FF" },
          ].map(stat => (
            <div key={stat.label} className="glass-panel gold-border rounded-xl p-4 card-tilt text-center">
              <div className="text-3xl mb-2">{stat.icon}</div>
              <div className="text-3xl font-bold mb-1" style={{ color: stat.color }}>
                <AnimatedCounter target={stat.value} />
              </div>
              <div className="text-gray-400 text-xs">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Grade distribution */}
          <div className="glass-panel gold-border rounded-xl p-5">
            <h2 className="sfma-title text-yellow-400 mb-4 text-sm">Distribution des Grades</h2>
            <div className="space-y-3">
              {stats?.gradeDistribution?.map((item: any) => (
                <div key={item.grade}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-300">{item.grade.replace(/_/g, " ")}</span>
                    <span className="text-yellow-400">{item.count}</span>
                  </div>
                  <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-1000"
                      style={{
                        width: `${stats?.totalMembers ? (item.count / stats.totalMembers) * 100 : 0}%`,
                        background: "linear-gradient(90deg, #8B0000, #C9A227)",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent joins */}
          <div className="glass-panel gold-border rounded-xl p-5">
            <h2 className="sfma-title text-yellow-400 mb-4 text-sm">Dernières Recrues</h2>
            <div className="space-y-3">
              {stats?.recentJoins?.map((member: any) => (
                <div key={member.id} className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center border border-red-900/40 text-sm flex-shrink-0"
                    style={{ background: "linear-gradient(135deg, #1a0000, #0a0a0f)" }}>
                    {member.gradeEmoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-white text-sm truncate">{member.username}</div>
                    <div className="text-gray-500 text-xs">{member.country || "—"}</div>
                  </div>
                  <GradeBadge grade={member.grade} emoji={member.gradeEmoji} size="sm" />
                </div>
              ))}
              {(!stats?.recentJoins || stats.recentJoins.length === 0) && (
                <p className="text-gray-600 text-sm text-center py-4">Aucun membre récent</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
