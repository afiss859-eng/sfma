import { useState } from "react";
import { useLocation } from "wouter";
import { useSubmitApplication } from "@workspace/api-client-react";
import ParticleBackground from "@/components/ParticleBackground";

const STEPS = [
  { title: "Identité", fields: ["pseudo", "age", "country"] },
  { title: "Contact", fields: ["whatsapp"] },
  { title: "Historique", fields: ["previousClan", "previousClanLeaveReason"] },
  { title: "Disponibilité", fields: ["availability"] },
  { title: "Motivation", fields: ["reason", "valueContribution"] },
  { title: "Valeurs", fields: ["respectAnswer", "conflictAnswer"] },
  { title: "Sécurité", fields: ["desiredPassword"] },
];

const FIELD_LABELS: Record<string, string> = {
  pseudo: "Votre pseudo",
  age: "Votre âge",
  country: "Votre pays",
  whatsapp: "Numéro WhatsApp (ex: +33612345678)",
  previousClan: "Clan précédent (si applicable)",
  previousClanLeaveReason: "Pourquoi avez-vous quitté votre ancien clan ?",
  availability: "Votre disponibilité (heures/semaine, créneaux...)",
  reason: "Pourquoi voulez-vous rejoindre SFMA ?",
  valueContribution: "Quelle valeur apportez-vous au clan ?",
  respectAnswer: "Comment gérez-vous le respect envers les autres membres ?",
  conflictAnswer: "Comment gérez-vous un conflit avec un coéquipier ?",
  desiredPassword: "Mot de passe souhaité",
};

export default function Apply() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    pseudo: "", age: "", country: "", whatsapp: "",
    previousClan: "", previousClanLeaveReason: "",
    availability: "", reason: "", valueContribution: "",
    respectAnswer: "", conflictAnswer: "", desiredPassword: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [, setLocation] = useLocation();
  const submitMutation = useSubmitApplication();

  const currentFields = STEPS[step].fields;
  const isLastStep = step === STEPS.length - 1;

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLastStep) {
      submitMutation.mutate(
        { data: { ...form, age: Number(form.age) } as any },
        {
          onSuccess: () => setSubmitted(true),
          onError: () => alert("Erreur lors de la soumission. Réessayez."),
        }
      );
    } else {
      setStep(s => s + 1);
    }
  };

  if (submitted) {
    return (
      <div className="relative min-h-screen flex items-center justify-center bg-[#0A0A0F] overflow-hidden">
        <ParticleBackground />
        <div className="relative z-10 glass-panel rounded-2xl p-8 gold-border max-w-sm w-full mx-6 text-center">
          <div className="text-5xl mb-4">✅</div>
          <h2 className="sfma-title text-xl text-yellow-400 mb-3">Candidature envoyée !</h2>
          <p className="text-gray-300 text-sm mb-6">Votre candidature est en cours d'examen par les Lords. Vous serez notifié dans les salons internes.</p>
          <button onClick={() => setLocation("/login")} className="btn-ripple w-full py-3 rounded-lg font-semibold text-yellow-400 border border-yellow-700 hover:border-yellow-500 transition-all">
            Aller à la connexion
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[#0A0A0F] overflow-hidden py-8">
      <ParticleBackground />

      <div className="relative z-10 w-full max-w-sm px-6">
        {/* Progress */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="sfma-title text-yellow-400 text-sm">Étape {step + 1}/{STEPS.length}</span>
            <span className="text-gray-400 text-sm">{STEPS[step].title}</span>
          </div>
          <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${((step + 1) / STEPS.length) * 100}%`, background: "linear-gradient(90deg, #8B0000, #C9A227)" }}
            />
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-6 gold-border">
          <h2 className="sfma-title text-lg text-yellow-400 mb-5 text-center">
            Candidature SFMA
          </h2>

          <form onSubmit={handleNext} className="space-y-4">
            {currentFields.map(field => (
              <div key={field}>
                <label className="block text-gray-300 text-sm mb-1">{FIELD_LABELS[field]}</label>
                {field === "previousClanLeaveReason" || field === "reason" || field === "valueContribution" || field === "respectAnswer" || field === "conflictAnswer" ? (
                  <textarea
                    data-testid={`input-${field}`}
                    value={(form as any)[field]}
                    onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 rounded-lg bg-[#0F0F18] border border-red-900/40 text-white placeholder-gray-600 focus:outline-none focus:border-yellow-600 focus:ring-1 focus:ring-yellow-600 transition-colors resize-none text-sm"
                    placeholder="Votre réponse..."
                    required={field !== "previousClanLeaveReason"}
                  />
                ) : (
                  <input
                    data-testid={`input-${field}`}
                    type={field === "age" ? "number" : field === "desiredPassword" ? "password" : "text"}
                    value={(form as any)[field]}
                    onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
                    className="w-full px-4 py-3 rounded-lg bg-[#0F0F18] border border-red-900/40 text-white placeholder-gray-600 focus:outline-none focus:border-yellow-600 focus:ring-1 focus:ring-yellow-600 transition-colors"
                    placeholder={FIELD_LABELS[field]}
                    required={field !== "previousClan"}
                    min={field === "age" ? 13 : undefined}
                    max={field === "age" ? 80 : undefined}
                  />
                )}
              </div>
            ))}

            <div className="flex gap-3 mt-2">
              {step > 0 && (
                <button type="button" onClick={() => setStep(s => s - 1)}
                  className="flex-1 py-3 rounded-lg text-gray-300 border border-gray-700 hover:border-gray-500 transition-all text-sm">
                  Retour
                </button>
              )}
              <button
                data-testid="button-next-step"
                type="submit"
                disabled={submitMutation.isPending}
                className="btn-ripple flex-1 py-3 rounded-lg font-semibold text-white transition-all duration-200 hover:scale-105 active:scale-95 text-sm disabled:opacity-50"
                style={{ background: "linear-gradient(135deg, #8B0000, #CC0000)", border: "1px solid rgba(255,68,68,0.4)" }}
              >
                {isLastStep ? (submitMutation.isPending ? "Envoi..." : "Soumettre") : "Continuer"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
