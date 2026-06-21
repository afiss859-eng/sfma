import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useListGroups, useGetGroupMessages, useSendMessage, useAddReaction, getGetGroupMessagesQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import GradeBadge from "@/components/GradeBadge";
import Layout from "@/components/Layout";

const EMOJIS = ["👍", "❤️", "🔥", "😂", "😮", "👑", "⚔️", "💀"];

function Avatar({ author }: { author: any }) {
  if (author?.avatarUrl) {
    return <img src={author.avatarUrl} alt={author.username} className="w-8 h-8 rounded-full object-cover border border-yellow-600/40 flex-shrink-0" />;
  }
  return (
    <div className="w-8 h-8 rounded-full flex items-center justify-center border border-red-900/50 flex-shrink-0 text-sm"
      style={{ background: "linear-gradient(135deg, #1a0000, #0a0a0f)" }}>
      {author?.gradeEmoji || "👤"}
    </div>
  );
}

export default function Chat() {
  const { user } = useAuth();
  const { data: groups } = useListGroups();
  const [activeGroupId, setActiveGroupId] = useState<string>("");
  const [message, setMessage] = useState("");
  const [replyTo, setReplyTo] = useState<any>(null);
  const [showEmoji, setShowEmoji] = useState<string | null>(null);
  const [mentionQuery, setMentionQuery] = useState("");
  const [showMentions, setShowMentions] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setMessage(val);
    const atIdx = val.lastIndexOf("@");
    if (atIdx !== -1 && atIdx === val.length - 1) {
      setShowMentions(true);
      setMentionQuery("");
    } else if (atIdx !== -1 && val.slice(atIdx + 1).match(/^\w*$/)) {
      setShowMentions(true);
      setMentionQuery(val.slice(atIdx + 1));
    } else {
      setShowMentions(false);
    }
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !activeGroupId) return;
    const mentions = [...message.matchAll(/@(\w+)/g)].map(m => m[1]);
    sendMutation.mutate(
      { id: activeGroupId, data: { content: message.trim(), replyToId: replyTo?.id || null, mentions } },
      {
        onSuccess: () => {
          setMessage("");
          setReplyTo(null);
          setShowMentions(false);
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
  const authorsList = messages ? [...new Map((messages as any[]).map(m => [m.author?.username, m.author?.username])).values()].filter(Boolean) : [];
  const filteredMentions = authorsList.filter((u: any) => u !== user?.username && u.toLowerCase().includes(mentionQuery.toLowerCase()));

  const isMe = (msg: any) => msg.author?.id === user?.id || msg.author?.username === user?.username;

  const formatTime = (ts: string) => ts ? new Date(ts).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }) : "";

  const renderContent = (content: string) => {
    const parts = content.split(/(@\w+)/g);
    return parts.map((part, i) =>
      part.startsWith("@") ? (
        <span key={i} className="text-yellow-400 font-semibold bg-yellow-900/20 rounded px-0.5">{part}</span>
      ) : part
    );
  };

  return (
    <Layout>
      <div className="flex h-[calc(100vh-60px)]">
        {/* Sidebar groupes */}
        <aside className="w-16 md:w-60 border-r border-red-900/20 flex flex-col bg-[#0A0A0F]/90 overflow-y-auto flex-shrink-0">
          <div className="p-3 border-b border-red-900/20 hidden md:block">
            <h2 className="sfma-title text-yellow-400 text-xs font-bold tracking-widest">GROUPES</h2>
          </div>
          {groups?.map((group, i) => (
            <motion.button
              key={group.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => setActiveGroupId(group.id)}
              className={`flex items-center gap-3 px-3 py-3 transition-all hover:bg-yellow-900/10 border-l-2 ${
                activeGroupId === group.id ? "border-yellow-600 bg-yellow-900/10" : "border-transparent"
              }`}
            >
              <span className="text-xl">{group.emoji}</span>
              <span className="hidden md:block text-sm text-gray-300 truncate">{group.name}</span>
            </motion.button>
          ))}
        </aside>

        {/* Zone messages */}
        <div className="flex-1 flex flex-col min-w-0 relative">
          {/* Header groupe */}
          {activeGroup && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="px-4 py-3 border-b border-red-900/20 flex items-center gap-3"
              style={{ background: "rgba(10,10,15,0.95)", backdropFilter: "blur(10px)" }}
            >
              <span className="text-2xl">{activeGroup.emoji}</span>
              <div>
                <h3 className="sfma-title text-yellow-400 text-sm font-bold">{activeGroup.name}</h3>
                <p className="text-gray-500 text-xs hidden md:block">{activeGroup.description}</p>
              </div>
              <div className="ml-auto flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-gray-500 text-xs hidden md:block">En ligne</span>
              </div>
            </motion.div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-1" style={{ background: "radial-gradient(ellipse at center, rgba(139,0,0,0.03) 0%, transparent 70%)" }}>
            {!activeGroupId && (
              <div className="flex items-center justify-center h-full text-gray-600 text-sm">
                Sélectionnez un groupe
              </div>
            )}
            <AnimatePresence initial={false}>
              {(messages as any[])?.map((msg: any, idx: number) => {
                const mine = isMe(msg);
                const showAvatar = !mine;
                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className={`flex items-end gap-2 group ${mine ? "flex-row-reverse" : "flex-row"}`}
                  >
                    {/* Avatar (only for others) */}
                    {showAvatar ? <Avatar author={msg.author} /> : <div className="w-8 flex-shrink-0" />}

                    <div className={`flex flex-col max-w-[75%] md:max-w-[60%] ${mine ? "items-end" : "items-start"}`}>
                      {/* Nom + grade (pour les autres) */}
                      {!mine && (
                        <div className="flex items-center gap-1.5 mb-0.5 px-1">
                          <span className="text-xs font-semibold text-yellow-400">{msg.author?.username}</span>
                          <GradeBadge grade={msg.author?.grade} emoji={msg.author?.gradeEmoji} size="sm" />
                        </div>
                      )}

                      {/* Réponse citée */}
                      {msg.replyTo && (
                        <div className={`mb-1 px-2 py-1 rounded-lg border-l-2 border-yellow-600/60 bg-black/30 text-xs text-gray-400 max-w-full truncate ${mine ? "text-right" : ""}`}>
                          ↩ <span className="text-yellow-500">{msg.replyTo.authorUsername}:</span> {msg.replyTo.content}
                        </div>
                      )}

                      {/* Bulle de message */}
                      <div
                        className={`relative px-3 py-2 rounded-2xl text-sm leading-relaxed break-words ${
                          mine
                            ? "rounded-br-sm text-white"
                            : "rounded-bl-sm text-gray-100"
                        }`}
                        style={mine
                          ? { background: "linear-gradient(135deg, #8B0000, #CC0000)", boxShadow: "0 2px 8px rgba(204,0,0,0.3)" }
                          : { background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }
                        }
                      >
                        {renderContent(msg.content)}

                        {/* Heure + statut */}
                        <div className={`flex items-center gap-1 mt-0.5 ${mine ? "justify-end" : "justify-start"}`}>
                          <span className="text-[10px] opacity-50">{formatTime(msg.createdAt)}</span>
                          {mine && <span className="text-[10px] opacity-60">✓✓</span>}
                        </div>
                      </div>

                      {/* Réactions */}
                      {msg.reactions && msg.reactions.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {msg.reactions.map((r: any) => (
                            <motion.button
                              key={r.emoji}
                              whileHover={{ scale: 1.2 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleReaction(msg.id, r.emoji)}
                              className={`text-xs px-2 py-0.5 rounded-full border transition-all ${
                                r.userIds?.includes(user?.id) ? "border-yellow-600 bg-yellow-900/30 text-yellow-400" : "border-gray-700 bg-gray-900/60 text-gray-300"
                              }`}
                            >
                              {r.emoji} {r.count}
                            </motion.button>
                          ))}
                        </div>
                      )}

                      {/* Actions hover */}
                      <div className={`hidden group-hover:flex items-center gap-1 mt-1 ${mine ? "flex-row-reverse" : ""}`}>
                        <button onClick={() => setShowEmoji(showEmoji === msg.id ? null : msg.id)}
                          className="text-[11px] text-gray-600 hover:text-yellow-400 transition-colors px-1.5 py-0.5 rounded bg-black/30">
                          😊
                        </button>
                        <button onClick={() => { setReplyTo(msg); inputRef.current?.focus(); }}
                          className="text-[11px] text-gray-600 hover:text-blue-400 transition-colors px-1.5 py-0.5 rounded bg-black/30">
                          ↩
                        </button>
                      </div>

                      {/* Emoji picker */}
                      <AnimatePresence>
                        {showEmoji === msg.id && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="flex gap-1.5 mt-1 p-2 rounded-xl bg-[#0F0F18] border border-red-900/30 shadow-xl"
                          >
                            {EMOJIS.map(e => (
                              <button key={e} onClick={() => handleReaction(msg.id, e)}
                                className="text-lg hover:scale-125 transition-transform">
                                {e}
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>

          {/* Zone de saisie */}
          <div className="p-3 border-t border-red-900/20 flex-shrink-0"
            style={{ background: "rgba(10,10,15,0.95)", backdropFilter: "blur(10px)" }}>
            {/* Réponse en cours */}
            <AnimatePresence>
              {replyTo && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-center gap-2 mb-2 px-3 py-1.5 bg-yellow-900/10 rounded-xl border border-yellow-900/30 text-xs overflow-hidden"
                >
                  <div className="w-0.5 h-4 bg-yellow-600 rounded" />
                  <span className="text-gray-400 truncate">
                    <strong className="text-yellow-400">{replyTo.author?.username}</strong>: {replyTo.content}
                  </span>
                  <button onClick={() => setReplyTo(null)} className="ml-auto text-gray-500 hover:text-red-400 flex-shrink-0">✕</button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Suggestions @mention */}
            <AnimatePresence>
              {showMentions && filteredMentions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="mb-2 bg-[#0F0F18] border border-red-900/30 rounded-xl overflow-hidden shadow-xl"
                >
                  {filteredMentions.slice(0, 5).map((u: any) => (
                    <button
                      key={u}
                      onClick={() => {
                        const atIdx = message.lastIndexOf("@");
                        setMessage(message.slice(0, atIdx) + `@${u} `);
                        setShowMentions(false);
                        inputRef.current?.focus();
                      }}
                      className="w-full text-left px-3 py-2 text-sm text-gray-200 hover:bg-yellow-900/20 hover:text-yellow-400 transition-colors flex items-center gap-2"
                    >
                      <span className="text-yellow-500">@</span>{u}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSend} className="flex items-center gap-2">
              <div className="flex-1 relative">
                <input
                  ref={inputRef}
                  data-testid="input-message"
                  type="text"
                  value={message}
                  onChange={handleInputChange}
                  placeholder="Message... (@ pour mentionner)"
                  className="w-full px-4 py-3 rounded-full bg-[#0F0F18] border border-red-900/30 text-white placeholder-gray-600 focus:outline-none focus:border-yellow-600/60 transition-colors text-sm pr-10"
                />
              </div>
              <motion.button
                data-testid="button-send"
                type="submit"
                disabled={sendMutation.isPending || !message.trim()}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-11 h-11 rounded-full flex items-center justify-center text-white disabled:opacity-40 transition-all flex-shrink-0"
                style={{ background: "linear-gradient(135deg, #8B0000, #CC0000)", boxShadow: "0 0 15px rgba(204,0,0,0.4)" }}
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" style={{ transform: "rotate(45deg)" }}>
                  <path d="M2 21L23 12 2 3v7l15 2-15 2z"/>
                </svg>
              </motion.button>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
}
