import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useGetCommunityStats, useGetSettings } from "@workspace/api-client-react";
import { useAuth } from "@/context/AuthContext";
import Layout from "@/components/Layout";
import GradeBadge from "@/components/GradeBadge";

function AnimatedCounter({ target, duration = 1800 }: { target: number; duration?: number }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (target === 0) return;
    const start = Date.now();
    const timer = setInterval(() => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress >= 1) clearInterval(timer);
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return <span>{count}</span>;
}

export default function Dashboard() {
  const { user } = useAuth();
  const { data: stats, isLoading } = useGetCommunityStats();
  const { data: settings } = useGetSettings();

  const waLink = (settings as any)?.whatsappGroupLink;

  if (isLoading) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            className="w-10 h-10 rounded-full border-2 border-yellow-600/30 border-t-yellow-600"
          />
          <span className="text-yellow-400/60 sfma-title text-sm tracking-widest animate-pulse">CHARGEMENT...</span>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-4 md:p-6 overflow-y-auto h-[calc(100vh-60px)]">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-6"
        >
          <div>
            <h1 className="sfma-title text-2xl text-yellow-400 tracking-wider">
              {user?.gradeEmoji} Bienvenue, {user?.username}
            </h1>
            <p className="text-gray-600 text-xs mt-0.5">{user?.grade?.replace(/_/g, " ")}</p>
          </div>
          {waLink && (
            <motion.a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(37,211,102,0.4)" }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold"
              style={{ background: "rgba(37,211,102,0.12)", border: "1px solid rgba(37,211,102,0.4)", color: "#25D366" }}
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Groupe WhatsApp
            </motion.a>
          )}
        </motion.div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Membres", value: stats?.totalMembers || 0, icon: "👥", color: "#C9A227" },
            { label: "Messages", value: stats?.totalMessages || 0, icon: "💬", color: "#CC0000" },
            { label: "Événements", value: stats?.totalEvents || 0, icon: "📅", color: "#7B68EE" },
            { label: "Candidatures", value: stats?.pendingApplications || 0, icon: "📋", color: "#25D366" },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: i * 0.1, duration: 0.4 }}
              whileHover={{ y: -4, boxShadow: `0 8px 30px ${stat.color}33` }}
              className="glass-panel rounded-xl p-4 text-center cursor-default border border-red-900/20 hover:border-yellow-900/30 transition-colors"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2 + i * 0.1, type: "spring" }}
                className="text-3xl mb-2"
              >
                {stat.icon}
              </motion.div>
              <div className="text-3xl font-bold mb-1 sfma-title" style={{ color: stat.color }}>
                <AnimatedCounter target={stat.value} />
              </div>
              <div className="text-gray-500 text-xs tracking-wider">{stat.label.toUpperCase()}</div>
            </motion.div>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Distribution des grades */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="glass-panel rounded-xl p-5 border border-red-900/20"
          >
            <h2 className="sfma-title text-yellow-400 mb-4 text-sm tracking-widest">⚔️ DISTRIBUTION DES GRADES</h2>
            <div className="space-y-3">
              {stats?.gradeDistribution?.map((item: any, i: number) => (
                <div key={item.grade}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-300">{item.grade.replace(/_/g, " ")}</span>
                    <span className="text-yellow-400 font-semibold">{item.count}</span>
                  </div>
                  <div className="h-1.5 bg-gray-800/60 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${stats?.totalMembers ? (item.count / stats.totalMembers) * 100 : 0}%` }}
                      transition={{ delay: 0.5 + i * 0.05, duration: 0.8, ease: "easeOut" }}
                      className="h-full rounded-full"
                      style={{ background: "linear-gradient(90deg, #8B0000, #C9A227)" }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Dernières recrues */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="glass-panel rounded-xl p-5 border border-red-900/20"
          >
            <h2 className="sfma-title text-yellow-400 mb-4 text-sm tracking-widest">🌱 DERNIÈRES RECRUES</h2>
            <div className="space-y-3">
              {stats?.recentJoins?.map((member: any, i: number) => (
                <motion.div
                  key={member.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + i * 0.07 }}
                  className="flex items-center gap-3"
                >
                  <div className="w-9 h-9 rounded-full flex items-center justify-center border border-red-900/40 text-sm flex-shrink-0 overflow-hidden"
                    style={{ background: "linear-gradient(135deg, #1a0000, #0a0a0f)" }}>
                    {member.avatarUrl
                      ? <img src={member.avatarUrl} alt="" className="w-full h-full object-cover" />
                      : member.gradeEmoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-white text-sm font-medium truncate">{member.username}</div>
                    <div className="text-gray-600 text-xs">{member.country || "—"}</div>
                  </div>
                  <GradeBadge grade={member.grade} emoji={member.gradeEmoji} size="sm" />
                </motion.div>
              ))}
              {(!stats?.recentJoins || stats.recentJoins.length === 0) && (
                <p className="text-gray-700 text-sm text-center py-6">Aucun membre récent</p>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
}
