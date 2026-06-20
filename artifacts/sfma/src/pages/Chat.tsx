import { useState, useEffect, useRef } from "react";
import { useListGroups, useGetGroupMessages, useSendMessage, useAddReaction, getGetGroupMessagesQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import GradeBadge from "@/components/GradeBadge";
import Layout from "@/components/Layout";

const EMOJIS = ["👍", "❤️", "🔥", "😂", "😮", "👑", "⚔️"];

export default function Chat() {
  const { user } = useAuth();
  const { data: groups } = useListGroups();
  const [activeGroupId, setActiveGroupId] = useState<string>("");
  const [message, setMessage] = useState("");
  const [replyTo, setReplyTo] = useState<any>(null);
  const [showEmoji, setShowEmoji] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const { data: messages } = useGetGroupMessages(activeGroupId, {
    query: { enabled: !!activeGroupId, queryKey: getGetGroupMessagesQueryKey(activeGroupId) },
  });

  const sendMutation = useSendMessage();
  const reactionMutation = useAddReaction();

  useEffect(() => {
    if (groups && groups.length > 0 && !activeGroupId) {
      setActiveGroupId(groups[0].id);
    }
  }, [groups]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Real-time Supabase subscription
  useEffect(() => {
    if (!activeGroupId) return;
    const channel = supabase
      .channel(`messages-${activeGroupId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: `group_id=eq.${activeGroupId}` },
        () => { queryClient.invalidateQueries({ queryKey: getGetGroupMessagesQueryKey(activeGroupId) }); }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [activeGroupId, queryClient]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !activeGroupId) return;
    sendMutation.mutate(
      { id: activeGroupId, data: { content: message.trim(), replyToId: replyTo?.id || null, mentions: [] } },
      {
        onSuccess: () => {
          setMessage("");
          setReplyTo(null);
          queryClient.invalidateQueries({ queryKey: getGetGroupMessagesQueryKey(activeGroupId) });
        },
      }
    );
  };

  const handleReaction = (msgId: string, emoji: string) => {
    reactionMutation.mutate({ id: msgId, data: { emoji } }, {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: getGetGroupMessagesQueryKey(activeGroupId) }),
    });
    setShowEmoji(null);
  };

  const activeGroup = groups?.find(g => g.id === activeGroupId);

  return (
    <Layout>
      <div className="flex h-[calc(100vh-60px)]">
        {/* Sidebar */}
        <aside className="w-20 md:w-64 border-r border-red-900/20 flex flex-col bg-[#0A0A0F]/80 overflow-y-auto">
          <div className="p-3 border-b border-red-900/20">
            <h2 className="sfma-title text-yellow-400 text-xs font-bold hidden md:block">GROUPES</h2>
          </div>
          {groups?.map(group => (
            <button
              key={group.id}
              data-testid={`group-${group.id}`}
              onClick={() => setActiveGroupId(group.id)}
              className={`flex items-center gap-3 px-3 py-3 transition-all hover:bg-yellow-900/10 border-l-2 ${
                activeGroupId === group.id ? "border-yellow-600 bg-yellow-900/10" : "border-transparent"
              }`}
            >
              <span className="text-xl">{group.emoji}</span>
              <span className="hidden md:block text-sm text-gray-300 truncate">{group.name}</span>
            </button>
          ))}
        </aside>

        {/* Messages area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Group header */}
          {activeGroup && (
            <div className="px-4 py-3 border-b border-red-900/20 glass-panel flex items-center gap-3">
              <span className="text-xl">{activeGroup.emoji}</span>
              <div>
                <h3 className="sfma-title text-yellow-400 text-sm font-bold">{activeGroup.name}</h3>
                <p className="text-gray-500 text-xs hidden md:block">{activeGroup.description}</p>
              </div>
            </div>
          )}

          {/* Messages list */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {!activeGroupId && (
              <div className="flex items-center justify-center h-full text-gray-600 text-sm">
                Sélectionnez un groupe
              </div>
            )}
            {messages?.map((msg: any) => (
              <div key={msg.id} className="message-enter group flex gap-3">
                {/* Avatar */}
                <div className="flex-shrink-0">
                  {msg.author?.avatarUrl ? (
                    <img src={msg.author.avatarUrl} alt={msg.author.username} className="w-9 h-9 rounded-full object-cover border border-red-900/40" />
                  ) : (
                    <div className="w-9 h-9 rounded-full flex items-center justify-center border border-red-900/40 text-sm"
                      style={{ background: "linear-gradient(135deg, #1a0000, #0a0a0f)" }}>
                      {msg.author?.gradeEmoji || "👤"}
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  {/* Header */}
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-white text-sm font-medium">{msg.author?.username}</span>
                    <GradeBadge grade={msg.author?.grade} emoji={msg.author?.gradeEmoji} size="sm" />
                    <span className="text-gray-600 text-xs">
                      {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }) : ""}
                    </span>
                  </div>

                  {/* Reply */}
                  {msg.replyTo && (
                    <div className="mb-1 pl-3 border-l-2 border-yellow-700/50 text-gray-500 text-xs truncate">
                      ↩ <span className="text-gray-400">{msg.replyTo.authorUsername}</span>: {msg.replyTo.content}
                    </div>
                  )}

                  {/* Content */}
                  <p className="text-gray-200 text-sm break-words">{msg.content}</p>

                  {/* Reactions */}
                  {msg.reactions && msg.reactions.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {msg.reactions.map((r: any) => (
                        <button
                          key={r.emoji}
                          onClick={() => handleReaction(msg.id, r.emoji)}
                          className={`text-xs px-2 py-0.5 rounded-full border transition-all hover:scale-110 ${
                            r.userIds?.includes(user?.id) ? "border-yellow-600 bg-yellow-900/20 text-yellow-400" : "border-gray-700 bg-gray-900/50 text-gray-300"
                          }`}
                        >
                          {r.emoji} {r.count}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Action buttons (hover) */}
                  <div className="hidden group-hover:flex items-center gap-1 mt-1">
                    <button onClick={() => setShowEmoji(showEmoji === msg.id ? null : msg.id)}
                      className="text-xs text-gray-600 hover:text-yellow-400 transition-colors px-2 py-0.5 rounded hover:bg-yellow-900/10">
                      😊 Réagir
                    </button>
                    <button onClick={() => setReplyTo(msg)}
                      className="text-xs text-gray-600 hover:text-blue-400 transition-colors px-2 py-0.5 rounded hover:bg-blue-900/10">
                      ↩ Répondre
                    </button>
                  </div>

                  {/* Emoji picker */}
                  {showEmoji === msg.id && (
                    <div className="flex gap-1 mt-1 flex-wrap">
                      {EMOJIS.map(e => (
                        <button key={e} onClick={() => handleReaction(msg.id, e)}
                          className="text-lg hover:scale-125 transition-transform">
                          {e}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input area */}
          <div className="p-3 border-t border-red-900/20 glass-panel">
            {replyTo && (
              <div className="flex items-center gap-2 mb-2 px-3 py-1.5 bg-yellow-900/10 rounded-lg border border-yellow-900/30 text-xs">
                <span className="text-gray-400">↩ Réponse à <strong className="text-yellow-400">{replyTo.author?.username}</strong></span>
                <button onClick={() => setReplyTo(null)} className="ml-auto text-gray-500 hover:text-red-400">✕</button>
              </div>
            )}
            <form onSubmit={handleSend} className="flex gap-2">
              <input
                data-testid="input-message"
                type="text"
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="Écrire un message..."
                className="flex-1 px-4 py-3 rounded-lg bg-[#0F0F18] border border-red-900/30 text-white placeholder-gray-600 focus:outline-none focus:border-yellow-600 transition-colors text-sm"
              />
              <button
                data-testid="button-send"
                type="submit"
                disabled={sendMutation.isPending || !message.trim()}
                className="btn-ripple px-4 py-3 rounded-lg font-semibold text-white transition-all hover:scale-105 active:scale-95 disabled:opacity-40"
                style={{ background: "linear-gradient(135deg, #8B0000, #CC0000)", border: "1px solid rgba(255,68,68,0.4)" }}
              >
                ➤
              </button>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
}
