import { useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { useLogin } from "@workspace/api-client-react";
import { useAuth } from "@/context/AuthContext";
import ParticleBackground from "@/components/ParticleBackground";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const [, setLocation] = useLocation();
  const loginMutation = useLogin();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    loginMutation.mutate(
      { data: { username, password } },
      {
        onSuccess: (data: any) => {
          login(data.member, data.token);
          setLocation("/chat");
        },
        onError: () => {
          setError("Identifiants invalides. Vérifiez votre pseudo et mot de passe.");
        },
      }
    );
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[#0A0A0F] overflow-hidden">
      <ParticleBackground />

      {/* Halo derrière le formulaire */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 4, repeat: Infinity }}
          className="w-[500px] h-[500px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(139,0,0,0.2) 0%, transparent 70%)" }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "backOut" }}
        className="relative z-10 w-full max-w-sm px-6"
      >
        <div className="glass-panel rounded-2xl p-8 gold-border">
          {/* Logo */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="text-center mb-8"
          >
            <motion.div
              animate={{ boxShadow: ["0 0 15px rgba(201,162,39,0.3)", "0 0 40px rgba(201,162,39,0.6)", "0 0 15px rgba(201,162,39,0.3)"] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="w-20 h-20 mx-auto rounded-full flex items-center justify-center border-2 border-yellow-600 mb-4"
              style={{ background: "radial-gradient(circle, rgba(139,0,0,0.4), rgba(10,10,15,0.9))" }}
            >
              <span className="text-4xl">⚜️</span>
            </motion.div>
            <h1 className="sfma-title text-2xl font-bold text-yellow-400 tracking-widest">SFMA</h1>
            <p className="text-gray-500 text-sm mt-1">Accès réservé aux membres</p>
          </motion.div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { label: "Pseudo", value: username, set: setUsername, type: "text", testId: "input-username", placeholder: "Votre pseudo" },
              { label: "Mot de passe", value: password, set: setPassword, type: "password", testId: "input-password", placeholder: "••••••••" },
            ].map((field, i) => (
              <motion.div
                key={field.label}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
              >
                <label className="block text-gray-400 text-xs mb-1.5 sfma-title tracking-wider">{field.label.toUpperCase()}</label>
                <input
                  data-testid={field.testId}
                  type={field.type}
                  value={field.value}
                  onChange={e => field.set(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-[#0F0F18] border border-red-900/40 text-white placeholder-gray-700 focus:outline-none focus:border-yellow-600/60 focus:ring-1 focus:ring-yellow-600/30 transition-all text-sm"
                  placeholder={field.placeholder}
                  required
                />
              </motion.div>
            ))}

            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-red-400 text-sm text-center bg-red-900/20 rounded-xl py-2.5 px-3 border border-red-800/40"
              >
                ⚠️ {error}
              </motion.div>
            )}

            <motion.button
              data-testid="button-submit-login"
              type="submit"
              disabled={loginMutation.isPending}
              whileHover={{ scale: 1.03, boxShadow: "0 0 30px rgba(204,0,0,0.5)" }}
              whileTap={{ scale: 0.97 }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="w-full py-3.5 rounded-xl font-bold text-white disabled:opacity-50 sfma-title tracking-widest text-sm"
              style={{ background: "linear-gradient(135deg, #8B0000, #CC0000)", border: "1px solid rgba(255,68,68,0.4)", boxShadow: "0 0 20px rgba(204,0,0,0.3)" }}
            >
              {loginMutation.isPending ? "⏳ CONNEXION..." : "🔑 SE CONNECTER"}
            </motion.button>
          </form>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="mt-6 text-center"
          >
            <a href="/apply" className="text-yellow-700 hover:text-yellow-400 text-xs transition-colors sfma-title tracking-wider">
              Pas encore membre ? → Faire une candidature
            </a>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
