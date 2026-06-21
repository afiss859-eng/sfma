import { useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { useListMembers } from "@workspace/api-client-react";
import Layout from "@/components/Layout";
import GradeBadge from "@/components/GradeBadge";

export default function Members() {
  const { data: members, isLoading } = useListMembers();
  const [search, setSearch] = useState("");

  const filtered = members?.filter((m: any) =>
    m.username.toLowerCase().includes(search.toLowerCase()) ||
    (m.country || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Layout>
      <div className="p-4 md:p-6 overflow-y-auto h-[calc(100vh-60px)]">
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-6"
        >
          <h1 className="sfma-title text-2xl text-yellow-400 tracking-wider">👥 Membres</h1>
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-gray-500 text-sm px-3 py-1 rounded-full border border-gray-800"
          >
            {members?.length || 0} guerriers
          </motion.span>
        </motion.div>

        <motion.input
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          data-testid="input-search-members"
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="🔍 Rechercher un membre ou pays..."
          className="w-full mb-6 px-4 py-3 rounded-xl bg-[#0F0F18] border border-red-900/30 text-white placeholder-gray-600 focus:outline-none focus:border-yellow-600/60 transition-colors text-sm"
        />

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              className="w-10 h-10 rounded-full border-2 border-yellow-600/30 border-t-yellow-600"
            />
            <span className="text-yellow-400/60 sfma-title text-sm tracking-widest">CHARGEMENT...</span>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtered?.map((member: any, i: number) => (
              <Link key={member.id} href={`/profile/${member.id}`}>
                <motion.div
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: i * 0.04, duration: 0.3 }}
                  whileHover={{ y: -4, boxShadow: "0 8px 30px rgba(201,162,39,0.2)" }}
                  data-testid={`card-member-${member.id}`}
                  className="glass-panel rounded-xl p-4 cursor-pointer border border-red-900/20 hover:border-yellow-600/40 transition-colors"
                >
                  <div className="flex flex-col items-center text-center gap-2">
                    {member.avatarUrl ? (
                      <img src={member.avatarUrl} alt={member.username}
                        className="w-14 h-14 rounded-full object-cover border-2 border-yellow-600/40" />
                    ) : (
                      <div className="w-14 h-14 rounded-full flex items-center justify-center border-2 border-red-900/40 text-2xl"
                        style={{ background: "linear-gradient(135deg, #1a0000, #0a0a0f)" }}>
                        {member.gradeEmoji}
                      </div>
                    )}
                    <div>
                      <p className="text-white text-sm font-semibold truncate max-w-[100px]">{member.username}</p>
                      <GradeBadge grade={member.grade} emoji={member.gradeEmoji} size="sm" />
                    </div>
                    {member.country && (
                      <span className="text-gray-600 text-xs">{member.country}</span>
                    )}
                    {member.reputation > 0 && (
                      <span className="text-yellow-500 text-xs">⭐ {member.reputation}</span>
                    )}
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        )}

        {filtered?.length === 0 && !isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20 text-gray-600"
          >
            Aucun membre trouvé pour "{search}"
          </motion.div>
        )}
      </div>
    </Layout>
  );
}
