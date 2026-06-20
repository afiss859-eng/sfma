interface GradeBadgeProps {
  grade: string;
  emoji?: string;
  size?: "sm" | "md" | "lg";
}

const GRADE_EMOJIS: Record<string, string> = {
  "Fondateur_Suprême": "👑",
  "Co-Fondateur": "⚜️",
  "Lord": "⚔️",
  "Administrateur": "🛡️",
  "Recruteur": "🎖️",
  "Modérateur": "⭐",
  "Membre_Élite": "🔥",
  "Membre": "👤",
  "Nouveau_Membre": "🌱",
};

const GRADE_COLORS: Record<string, string> = {
  "Fondateur_Suprême": "border-yellow-500 text-yellow-400 grade-founder",
  "Co-Fondateur": "border-yellow-600 text-yellow-500 grade-founder",
  "Lord": "border-red-700 text-red-400 grade-lord",
  "Administrateur": "border-red-800 text-red-500 grade-lord",
  "Recruteur": "border-orange-700 text-orange-400 grade-member",
  "Modérateur": "border-yellow-700 text-yellow-500 grade-member",
  "Membre_Élite": "border-orange-800 text-orange-500 grade-member",
  "Membre": "border-gray-600 text-gray-400",
  "Nouveau_Membre": "border-green-800 text-green-500",
};

const SIZE_CLASSES: Record<string, string> = {
  sm: "text-xs px-1.5 py-0.5",
  md: "text-sm px-2 py-0.5",
  lg: "text-base px-3 py-1",
};

export default function GradeBadge({ grade, emoji, size = "sm" }: GradeBadgeProps) {
  const e = emoji || GRADE_EMOJIS[grade] || "👤";
  const colors = GRADE_COLORS[grade] || "border-gray-600 text-gray-400";
  const sizeClass = SIZE_CLASSES[size];

  return (
    <span
      className={`inline-flex items-center gap-1 rounded border font-medium ${colors} ${sizeClass}`}
      style={{ fontFamily: "Inter, sans-serif" }}
    >
      <span>{e}</span>
      <span>{grade.replace(/_/g, " ")}</span>
    </span>
  );
}
