import { ReactNode, useState } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { useGetSettings } from "@workspace/api-client-react";
import ParticleBackground from "./ParticleBackground";

const NAV_ITEMS = [
  { href: "/chat", label: "Chat", icon: "💬" },
  { href: "/members", label: "Membres", icon: "👥" },
  { href: "/polls", label: "Sondages", icon: "📊" },
  { href: "/events", label: "Événements", icon: "📅" },
  { href: "/gallery", label: "Galerie", icon: "🖼️" },
  { href: "/dashboard", label: "Stats", icon: "📈" },
  { href: "/card", label: "Ma Carte", icon: "🪪" },
  { href: "/profile-edit", label: "Profil", icon: "✏️" },
];

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { user, logout, isLord } = useAuth();
  const [location] = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const { data: settings } = useGetSettings({ query: { staleTime: 60000 } });

  const waLink = (settings as any)?.whatsappGroupLink || null;

  return (
    <div className="relative min-h-screen bg-[#0A0A0F] flex flex-col">
      <ParticleBackground />

      {/* Top bar */}
      <header className="relative z-20 border-b border-red-900/20 px-4 py-2.5 flex items-center justify-between"
        style={{ background: "rgba(10,10,15,0.92)", backdropFilter: "blur(12px)" }}>
        <Link href="/dashboard">
          <div className="flex items-center gap-2.5 cursor-pointer group">
            <motion.div
              animate={{ boxShadow: ["0 0 8px rgba(201,162,39,0.3)", "0 0 20px rgba(201,162,39,0.6)", "0 0 8px rgba(201,162,39,0.3)"] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="w-8 h-8 rounded-full flex items-center justify-center border border-yellow-600/60"
              style={{ background: "radial-gradient(circle, rgba(139,0,0,0.5), rgba(10,10,15,0.9))" }}
            >
              <span className="text-sm">⚜️</span>
            </motion.div>
            <span className="sfma-title text-yellow-400 font-bold text-sm hidden sm:block tracking-widest group-hover:text-yellow-300 transition-colors">SFMA</span>
          </div>
        </Link>

        {/* Nav desktop */}
        <nav className="hidden md:flex items-center gap-0.5">
          {NAV_ITEMS.map(item => (
            <Link key={item.href} href={item.href}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`px-2.5 py-1.5 rounded-lg text-xs transition-all ${
                  location === item.href
                    ? "text-yellow-400 bg-yellow-900/20 border border-yellow-900/30"
                    : "text-gray-400 hover:text-yellow-400 hover:bg-yellow-900/10"
                }`}
              >
                <span className="mr-1">{item.icon}</span>{item.label}
              </motion.button>
            </Link>
          ))}
          {isLord && (
            <Link href="/admin">
              <motion.button
                whileHover={{ scale: 1.05 }}
                className={`px-2.5 py-1.5 rounded-lg text-xs transition-all ${
                  location === "/admin" ? "text-red-400 bg-red-900/20 border border-red-900/30" : "text-gray-500 hover:text-red-400 hover:bg-red-900/10"
                }`}
              >
                ⚙️ Admin
              </motion.button>
            </Link>
          )}
        </nav>

        {/* Droite : WA + user + menu */}
        <div className="flex items-center gap-2">
          {/* Bouton groupe WhatsApp */}
          {waLink && (
            <motion.a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
              style={{ background: "rgba(37,211,102,0.15)", border: "1px solid rgba(37,211,102,0.4)", color: "#25D366" }}
            >
              <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              Groupe WA
            </motion.a>
          )}

          {user && (
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-gray-400">
              <span>{user.gradeEmoji}</span>
              <span className="max-w-[80px] truncate">{user.username}</span>
            </div>
          )}

          {/* Burger mobile */}
          <motion.button
            onClick={() => setMenuOpen(!menuOpen)}
            whileTap={{ scale: 0.9 }}
            className="md:hidden p-2 text-gray-400 hover:text-yellow-400 transition-colors"
            data-testid="button-menu-toggle"
          >
            <motion.div animate={{ rotate: menuOpen ? 45 : 0 }} className="w-5 h-5 flex flex-col justify-center gap-1">
              <span className={`block h-0.5 bg-current transition-all ${menuOpen ? "w-5 translate-y-1.5" : "w-5"}`} />
              <span className={`block h-0.5 bg-current transition-all ${menuOpen ? "opacity-0" : "w-4"}`} />
              <span className={`block h-0.5 bg-current transition-all ${menuOpen ? "w-5 -translate-y-1.5 -rotate-90" : "w-5"}`} />
            </motion.div>
          </motion.button>

          <button onClick={logout} data-testid="button-logout"
            className="text-gray-600 hover:text-red-400 text-xs transition-colors hidden sm:block px-2 py-1 rounded hover:bg-red-900/10">
            🚪
          </button>
        </div>
      </header>

      {/* Menu mobile */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="relative z-20 border-b border-red-900/20 md:hidden"
            style={{ background: "rgba(10,10,15,0.97)", backdropFilter: "blur(12px)" }}
          >
            <div className="flex flex-col p-3 gap-1">
              {NAV_ITEMS.map((item, i) => (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                >
                  <Link href={item.href}>
                    <button
                      onClick={() => setMenuOpen(false)}
                      className={`w-full text-left px-4 py-3 rounded-xl text-sm transition-all ${
                        location === item.href
                          ? "text-yellow-400 bg-yellow-900/20 border border-yellow-900/30"
                          : "text-gray-400 hover:text-yellow-400 hover:bg-yellow-900/10"
                      }`}
                    >
                      <span className="mr-2">{item.icon}</span>{item.label}
                    </button>
                  </Link>
                </motion.div>
              ))}
              {isLord && (
                <Link href="/admin">
                  <button onClick={() => setMenuOpen(false)} className="w-full text-left px-4 py-3 rounded-xl text-sm text-gray-400 hover:text-red-400 hover:bg-red-900/10 transition-all">
                    ⚙️ Admin
                  </button>
                </Link>
              )}
              {waLink && (
                <a href={waLink} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm transition-all"
                  style={{ color: "#25D366" }}>
                  📱 Rejoindre le groupe WhatsApp
                </a>
              )}
              <button onClick={() => { logout(); setMenuOpen(false); }}
                className="w-full text-left px-4 py-3 rounded-xl text-sm text-gray-500 hover:text-red-400 transition-all">
                🚪 Déconnexion
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Contenu principal */}
      <main className="relative z-10 flex-1 overflow-hidden">
        {children}
      </main>
    </div>
  );
}
