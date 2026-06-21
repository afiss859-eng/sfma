import { Link } from "wouter";
import { motion } from "framer-motion";
import ParticleBackground from "@/components/ParticleBackground";

const STATS = [
  { value: "11", label: "Lords Actifs" },
  { value: "9", label: "Grades" },
  { value: "∞", label: "Gloire" },
];

export default function Landing() {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-[#0A0A0F]">
      <ParticleBackground />

      {/* Halo rouge derrière */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <motion.div
          animate={{ scale: [1, 1.08, 1], opacity: [0.15, 0.25, 0.15] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="w-[700px] h-[700px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(139,0,0,0.25) 0%, transparent 70%)" }}
        />
      </div>

      {/* Lignes décoratives */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/2 w-px h-32 bg-gradient-to-b from-transparent via-yellow-600/20 to-transparent" />
        <div className="absolute bottom-0 left-1/2 w-px h-32 bg-gradient-to-t from-transparent via-yellow-600/20 to-transparent" />
        <div className="absolute left-0 top-1/2 h-px w-32 bg-gradient-to-r from-transparent via-red-600/20 to-transparent" />
        <div className="absolute right-0 top-1/2 h-px w-32 bg-gradient-to-l from-transparent via-red-600/20 to-transparent" />
      </div>

      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-lg w-full">
        {/* Logo animé */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: "backOut" }}
          className="mb-8"
        >
          <motion.div
            animate={{ boxShadow: ["0 0 20px rgba(201,162,39,0.3)", "0 0 50px rgba(201,162,39,0.7)", "0 0 20px rgba(201,162,39,0.3)"] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="w-32 h-32 mx-auto rounded-full flex items-center justify-center border-2 border-yellow-600"
            style={{ background: "radial-gradient(circle, rgba(139,0,0,0.5), rgba(10,10,15,0.9))" }}
          >
            <motion.span
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="text-6xl"
            >
              ⚜️
            </motion.span>
          </motion.div>
        </motion.div>

        {/* Titre */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.7 }}
        >
          <h1 className="sfma-title text-3xl md:text-4xl font-bold text-yellow-400 mb-1 leading-tight tracking-wider">
            SUPRÊME FAMILLE
          </h1>
          <h1 className="sfma-title text-3xl md:text-4xl font-bold text-red-500 mb-2 leading-tight tracking-wider">
            MUZAN AMPIROUS
          </h1>
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-yellow-600 text-sm tracking-[0.5em] mb-6 sfma-title"
          >
            — SFMA —
          </motion.div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex gap-8 mb-8"
        >
          {STATS.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 + i * 0.1 }}
              className="flex flex-col items-center"
            >
              <span className="sfma-title text-2xl font-bold text-yellow-400">{s.value}</span>
              <span className="text-gray-500 text-xs mt-0.5">{s.label}</span>
            </motion.div>
          ))}
        </motion.div>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-gray-300 text-sm leading-relaxed mb-8 max-w-sm"
        >
          Une communauté d'élite forgée dans l'ombre et la gloire.<br />
          Ici, seuls les plus dévoués trouvent leur place.<br />
          <span className="text-yellow-600/80">L'empire attend ses guerriers.</span>
        </motion.p>

        {/* Boutons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="flex flex-col gap-3 w-full max-w-xs"
        >
          <Link href="/apply">
            <motion.button
              data-testid="button-join"
              whileHover={{ scale: 1.05, boxShadow: "0 0 40px rgba(204,0,0,0.7)" }}
              whileTap={{ scale: 0.97 }}
              className="w-full py-4 px-6 rounded-2xl font-bold text-white sfma-title tracking-widest text-sm"
              style={{ background: "linear-gradient(135deg, #8B0000, #CC0000)", border: "1px solid rgba(255,68,68,0.4)", boxShadow: "0 0 25px rgba(204,0,0,0.5)" }}
            >
              ⚔️ REJOINDRE L'EMPIRE
            </motion.button>
          </Link>
          <Link href="/login">
            <motion.button
              data-testid="button-login"
              whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(201,162,39,0.4)" }}
              whileTap={{ scale: 0.97 }}
              className="w-full py-4 px-6 rounded-2xl font-semibold sfma-title tracking-widest text-sm"
              style={{ background: "rgba(201,162,39,0.08)", border: "1px solid rgba(201,162,39,0.5)", color: "#C9A227", boxShadow: "0 0 15px rgba(201,162,39,0.2)" }}
            >
              🔑 SE CONNECTER
            </motion.button>
          </Link>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="mt-12 text-gray-700 text-xs tracking-widest sfma-title"
        >
          © 2026 SFMA — TOUS DROITS RÉSERVÉS
        </motion.div>
      </div>
    </div>
  );
}
