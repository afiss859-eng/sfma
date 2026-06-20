import { ReactNode, useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/context/AuthContext";
import ParticleBackground from "./ParticleBackground";

const NAV_ITEMS = [
  { href: "/chat", label: "Chat", icon: "💬" },
  { href: "/members", label: "Membres", icon: "👥" },
  { href: "/polls", label: "Sondages", icon: "📊" },
  { href: "/events", label: "Événements", icon: "📅" },
  { href: "/gallery", label: "Galerie", icon: "🖼️" },
  { href: "/dashboard", label: "Stats", icon: "📈" },
  { href: "/card", label: "Ma Carte", icon: "🪪" },
];

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { user, logout, isLord } = useAuth();
  const [location] = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="relative min-h-screen bg-[#0A0A0F] flex flex-col">
      <ParticleBackground />

      {/* Top bar */}
      <header className="relative z-20 glass-panel border-b border-red-900/30 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full flex items-center justify-center border border-yellow-600/60 grade-founder"
            style={{ background: "radial-gradient(circle, rgba(139,0,0,0.5), rgba(10,10,15,0.9))" }}>
            <span className="text-sm">⚜️</span>
          </div>
          <span className="sfma-title text-yellow-400 font-bold text-sm hidden sm:block">SFMA</span>
        </div>

        <nav className="hidden md:flex items-center gap-1">
          {NAV_ITEMS.map(item => (
            <Link key={item.href} href={item.href}>
              <button
                className={`px-3 py-1.5 rounded-lg text-sm transition-all hover:text-yellow-400 ${
                  location === item.href ? "text-yellow-400 bg-yellow-900/20" : "text-gray-400"
                }`}
              >
                {item.label}
              </button>
            </Link>
          ))}
          {isLord && (
            <Link href="/admin">
              <button className={`px-3 py-1.5 rounded-lg text-sm transition-all hover:text-red-400 ${location === "/admin" ? "text-red-400 bg-red-900/20" : "text-gray-500"}`}>
                ⚙️ Admin
              </button>
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-2">
          {user && (
            <span className="text-gray-300 text-xs hidden sm:block">
              {user.gradeEmoji} {user.username}
            </span>
          )}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 text-gray-400 hover:text-yellow-400 transition-colors"
            data-testid="button-menu-toggle"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <button onClick={logout} data-testid="button-logout"
            className="text-gray-500 hover:text-red-400 text-xs transition-colors hidden sm:block">
            Déconnexion
          </button>
        </div>
      </header>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="relative z-20 glass-panel border-b border-red-900/30 md:hidden">
          <div className="flex flex-col p-3 gap-1">
            {NAV_ITEMS.map(item => (
              <Link key={item.href} href={item.href}>
                <button
                  onClick={() => setMenuOpen(false)}
                  className={`w-full text-left px-4 py-3 rounded-lg text-sm transition-all hover:text-yellow-400 hover:bg-yellow-900/10 ${
                    location === item.href ? "text-yellow-400 bg-yellow-900/20" : "text-gray-400"
                  }`}
                >
                  {item.icon} {item.label}
                </button>
              </Link>
            ))}
            {isLord && (
              <Link href="/admin">
                <button onClick={() => setMenuOpen(false)} className="w-full text-left px-4 py-3 rounded-lg text-sm text-gray-400 hover:text-red-400 hover:bg-red-900/10 transition-all">
                  ⚙️ Admin
                </button>
              </Link>
            )}
            <button onClick={() => { logout(); setMenuOpen(false); }}
              className="w-full text-left px-4 py-3 rounded-lg text-sm text-gray-500 hover:text-red-400 transition-all">
              🚪 Déconnexion
            </button>
          </div>
        </div>
      )}

      {/* Main content */}
      <main className="relative z-10 flex-1 overflow-hidden">
        {children}
      </main>
    </div>
  );
}
