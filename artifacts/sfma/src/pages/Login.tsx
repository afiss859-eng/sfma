import { useState } from "react";
import { useLocation } from "wouter";
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

      <div className="relative z-10 w-full max-w-sm px-6">
        <div className="glass-panel rounded-2xl p-8 gold-border">
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center border border-yellow-600 mb-4 grade-founder"
              style={{ background: "radial-gradient(circle, rgba(139,0,0,0.4), rgba(10,10,15,0.9))" }}>
              <span className="text-3xl">⚜️</span>
            </div>
            <h1 className="sfma-title text-xl font-bold text-yellow-400">SFMA</h1>
            <p className="text-gray-400 text-sm mt-1">Connexion au clan</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-300 text-sm mb-1">Pseudo</label>
              <input
                data-testid="input-username"
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-[#0F0F18] border border-red-900/40 text-white placeholder-gray-600 focus:outline-none focus:border-yellow-600 focus:ring-1 focus:ring-yellow-600 transition-colors"
                placeholder="Votre pseudo"
                required
              />
            </div>
            <div>
              <label className="block text-gray-300 text-sm mb-1">Mot de passe</label>
              <input
                data-testid="input-password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-[#0F0F18] border border-red-900/40 text-white placeholder-gray-600 focus:outline-none focus:border-yellow-600 focus:ring-1 focus:ring-yellow-600 transition-colors"
                placeholder="••••••••"
                required
              />
            </div>

            {error && (
              <div className="text-red-400 text-sm text-center bg-red-900/20 rounded-lg py-2 px-3 border border-red-800/40">
                {error}
              </div>
            )}

            <button
              data-testid="button-submit-login"
              type="submit"
              disabled={loginMutation.isPending}
              className="btn-ripple w-full py-3 rounded-lg font-semibold text-white transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50"
              style={{ background: "linear-gradient(135deg, #8B0000, #CC0000)", border: "1px solid rgba(255,68,68,0.4)", boxShadow: "0 0 20px rgba(204,0,0,0.3)" }}
            >
              {loginMutation.isPending ? "Connexion..." : "Se connecter"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <a href="/apply" className="text-yellow-600 hover:text-yellow-400 text-sm transition-colors">
              Pas encore membre ? Faire une candidature
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
