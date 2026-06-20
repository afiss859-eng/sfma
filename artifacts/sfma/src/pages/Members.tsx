import { useState } from "react";
import { Link } from "wouter";
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
        <div className="flex items-center justify-between mb-6">
          <h1 className="sfma-title text-2xl text-yellow-400">Membres</h1>
          <span className="text-gray-500 text-sm">{members?.length || 0} membres</span>
        </div>

        <input
          data-testid="input-search-members"
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Rechercher un membre..."
          className="w-full mb-6 px-4 py-3 rounded-lg bg-[#0F0F18] border border-red-900/30 text-white placeholder-gray-600 focus:outline-none focus:border-yellow-600 transition-colors text-sm"
        />

        {isLoading ? (
          <div className="text-yellow-400 sfma-title animate-pulse text-center py-12">Chargement...</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtered?.map((member: any) => (
              <Link key={member.id} href={`/profile/${member.id}`}>
                <div
                  data-testid={`card-member-${member.id}`}
                  className="glass-panel gold-border rounded-xl p-4 card-tilt cursor-pointer hover:border-yellow-500 transition-all"
                >
                  <div className="flex flex-col items-center text-center gap-2">
                    {member.avatarUrl ? (
                      <img src={member.avatarUrl} alt={member.username} className="w-14 h-14 rounded-full object-cover border-2 border-red-900/40" />
                    ) : (
                      <div className="w-14 h-14 rounded-full flex items-center justify-center border-2 border-red-900/40 text-2xl"
                        style={{ background: "linear-gradient(135deg, #1a0000, #0a0a0f)" }}>
                        {member.gradeEmoji}
                      </div>
                    )}
                    <div>
                      <div className="text-white text-sm font-medium">{member.username}</div>
                      <div className="text-gray-500 text-xs">{member.memberId}</div>
                    </div>
                    <GradeBadge grade={member.grade} emoji={member.gradeEmoji} size="sm" />
                    <div className="text-yellow-600 text-xs">{member.reputation} pts</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
