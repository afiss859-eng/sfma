import { Link } from "wouter";
import ParticleBackground from "@/components/ParticleBackground";

export default function Landing() {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-[#0A0A0F]">
      <ParticleBackground />

      {/* Radial glow behind content */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[600px] h-[600px] rounded-full" style={{ background: "radial-gradient(circle, rgba(139,0,0,0.15) 0%, transparent 70%)" }} />
      </div>

      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-lg w-full">
        {/* Logo / Crest */}
        <div className="mb-6">
          <div className="w-28 h-28 mx-auto rounded-full flex items-center justify-center border-2 border-yellow-600 grade-founder"
            style={{ background: "radial-gradient(circle, rgba(139,0,0,0.4), rgba(10,10,15,0.9))" }}>
            <span className="text-5xl">⚜️</span>
          </div>
        </div>

        {/* Title */}
        <h1 className="sfma-title text-2xl md:text-3xl font-bold text-yellow-400 mb-1 leading-tight">
          SUPRÊME FAMILLE
        </h1>
        <h1 className="sfma-title text-2xl md:text-3xl font-bold text-red-500 mb-1 leading-tight">
          MUZAN AMPIROUS
        </h1>
        <div className="text-yellow-600 text-sm tracking-[0.3em] mb-6 sfma-title">— SFMA —</div>

        {/* Description */}
        <p className="text-gray-300 text-sm leading-relaxed mb-8 max-w-sm">
          Une communauté d'élite forgée dans l'ombre et la gloire. Ici, seuls les plus dévoués trouvent leur place. L'empire attend ses guerriers.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col gap-3 w-full max-w-xs">
          <Link href="/apply">
            <button
              data-testid="button-join"
              className="btn-ripple w-full py-3 px-6 rounded-lg font-semibold text-white transition-all duration-200 hover:scale-105 active:scale-95"
              style={{ background: "linear-gradient(135deg, #8B0000, #CC0000)", border: "1px solid rgba(255,68,68,0.4)", boxShadow: "0 0 20px rgba(204,0,0,0.4)" }}
            >
              Rejoindre l'Empire
            </button>
          </Link>
          <Link href="/login">
            <button
              data-testid="button-login"
              className="btn-ripple w-full py-3 px-6 rounded-lg font-semibold transition-all duration-200 hover:scale-105 active:scale-95"
              style={{ background: "rgba(201,162,39,0.1)", border: "1px solid rgba(201,162,39,0.5)", color: "#C9A227", boxShadow: "0 0 12px rgba(201,162,39,0.2)" }}
            >
              Se connecter
            </button>
          </Link>
        </div>

        {/* Footer */}
        <div className="mt-12 text-gray-700 text-xs">
          © 2026 SFMA — Tous droits réservés
        </div>
      </div>
    </div>
  );
}
