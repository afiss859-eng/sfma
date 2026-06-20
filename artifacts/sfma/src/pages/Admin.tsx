import { useState } from "react";
import { useListApplications, useAcceptApplication, useRejectApplication, useListMembers, useUpdateMember, useBanMember, useListGroups, useCreateGroup, useDeleteGroup, useCreatePoll, useCreateEvent, useGetSettings, useUpdateSettings, useGetAuditLog, useApprovePhoto, useListGallery, getListApplicationsQueryKey, getListMembersQueryKey, getListGroupsQueryKey, getListGalleryQueryKey, getGetSettingsQueryKey, getGetAuditLogQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import Layout from "@/components/Layout";
import { useAuth } from "@/context/AuthContext";
import GradeBadge from "@/components/GradeBadge";

const TABS = ["Candidatures", "Membres", "Groupes", "Sondages", "Événements", "Galerie", "Paramètres", "Journal"];
const FOUNDER_TAB = "Fondateur";

const GRADES = ["Fondateur_Suprême", "Co-Fondateur", "Lord", "Administrateur", "Recruteur", "Modérateur", "Membre_Élite", "Membre", "Nouveau_Membre"];
const GRADE_EMOJIS: Record<string, string> = {
  "Fondateur_Suprême": "👑", "Co-Fondateur": "⚜️", "Lord": "⚔️", "Administrateur": "🛡️",
  "Recruteur": "🎖️", "Modérateur": "⭐", "Membre_Élite": "🔥", "Membre": "👤", "Nouveau_Membre": "🌱",
};

export default function Admin() {
  const [activeTab, setActiveTab] = useState("Candidatures");
  const { isFounder } = useAuth();
  const qc = useQueryClient();
  const tabs = isFounder ? [...TABS, FOUNDER_TAB] : TABS;

  return (
    <Layout>
      <div className="flex h-[calc(100vh-60px)]">
        {/* Tab sidebar */}
        <aside className="w-16 md:w-48 border-r border-red-900/20 bg-[#0A0A0F]/80 overflow-y-auto flex-shrink-0">
          <div className="p-3 border-b border-red-900/20">
            <h2 className="sfma-title text-red-400 text-xs font-bold hidden md:block">ADMIN</h2>
          </div>
          {tabs.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`w-full text-left px-3 py-3 text-sm transition-all hover:bg-red-900/10 border-l-2 ${activeTab === tab ? "border-red-500 bg-red-900/10 text-red-300" : "border-transparent text-gray-500"}`}>
              <span className="hidden md:block">{tab}</span>
              <span className="md:hidden text-xs">{tab.slice(0, 3)}</span>
            </button>
          ))}
        </aside>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          {activeTab === "Candidatures" && <ApplicationsTab qc={qc} />}
          {activeTab === "Membres" && <MembersTab qc={qc} />}
          {activeTab === "Groupes" && <GroupsTab qc={qc} />}
          {activeTab === "Sondages" && <PollsTab qc={qc} />}
          {activeTab === "Événements" && <EventsTab qc={qc} />}
          {activeTab === "Galerie" && <GalleryTab qc={qc} />}
          {activeTab === "Paramètres" && <SettingsTab qc={qc} />}
          {activeTab === "Journal" && <AuditTab />}
          {activeTab === FOUNDER_TAB && <FounderTab qc={qc} />}
        </div>
      </div>
    </Layout>
  );
}

function ApplicationsTab({ qc }: any) {
  const { data: apps } = useListApplications();
  const acceptMutation = useAcceptApplication();
  const rejectMutation = useRejectApplication();

  const pending = apps?.filter((a: any) => a.status === "pending") || [];

  const accept = (id: string) => {
    if (window.confirm("Accepter cette candidature et créer le compte ?"))
      acceptMutation.mutate({ id }, { onSuccess: () => qc.invalidateQueries({ queryKey: getListApplicationsQueryKey() }) });
  };
  const reject = (id: string) => {
    if (window.confirm("Refuser cette candidature ?"))
      rejectMutation.mutate({ id }, { onSuccess: () => qc.invalidateQueries({ queryKey: getListApplicationsQueryKey() }) });
  };

  return (
    <div>
      <h2 className="sfma-title text-yellow-400 text-xl mb-6">Candidatures ({pending.length} en attente)</h2>
      <div className="space-y-4">
        {pending.map((app: any) => (
          <div key={app.id} data-testid={`application-${app.id}`} className="glass-panel gold-border rounded-xl p-4">
            <div className="flex justify-between items-start mb-3">
              <div>
                <div className="text-white font-medium">{app.pseudo}</div>
                <div className="text-gray-500 text-xs">{app.age} ans · {app.country} · {app.availability}</div>
              </div>
              <div className="text-gray-600 text-xs">{new Date(app.submittedAt).toLocaleDateString("fr-FR")}</div>
            </div>
            <div className="space-y-1 mb-3 text-sm">
              <div><span className="text-gray-500">Motivation:</span> <span className="text-gray-300">{app.reason}</span></div>
              <div><span className="text-gray-500">Valeur:</span> <span className="text-gray-300">{app.valueContribution}</span></div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => accept(app.id)} disabled={acceptMutation.isPending}
                className="btn-ripple px-4 py-2 rounded-lg text-sm text-white font-medium disabled:opacity-50"
                style={{ background: "linear-gradient(135deg, #006600, #009900)" }}>
                ✓ Accepter
              </button>
              <button onClick={() => reject(app.id)} disabled={rejectMutation.isPending}
                className="btn-ripple px-4 py-2 rounded-lg text-sm text-white font-medium disabled:opacity-50"
                style={{ background: "linear-gradient(135deg, #8B0000, #CC0000)" }}>
                ✗ Refuser
              </button>
            </div>
          </div>
        ))}
        {pending.length === 0 && <div className="text-gray-600 text-center py-8">Aucune candidature en attente</div>}
      </div>
    </div>
  );
}

function MembersTab({ qc }: any) {
  const { data: members } = useListMembers();
  const updateMutation = useUpdateMember();
  const banMutation = useBanMember();

  const promote = (id: string, currentGrade: string) => {
    const idx = GRADES.indexOf(currentGrade);
    if (idx <= 0) return;
    const newGrade = GRADES[idx - 1];
    if (!window.confirm(`Promouvoir au grade ${newGrade} ?`)) return;
    updateMutation.mutate({ id, data: { grade: newGrade } }, { onSuccess: () => qc.invalidateQueries({ queryKey: getListMembersQueryKey() }) });
  };

  const demote = (id: string, currentGrade: string) => {
    const idx = GRADES.indexOf(currentGrade);
    if (idx >= GRADES.length - 1) return;
    const newGrade = GRADES[idx + 1];
    if (!window.confirm(`Rétrograder au grade ${newGrade} ?`)) return;
    updateMutation.mutate({ id, data: { grade: newGrade } }, { onSuccess: () => qc.invalidateQueries({ queryKey: getListMembersQueryKey() }) });
  };

  const ban = (id: string, username: string) => {
    if (!window.confirm(`Bannir ${username} ?`)) return;
    banMutation.mutate({ id }, { onSuccess: () => qc.invalidateQueries({ queryKey: getListMembersQueryKey() }) });
  };

  return (
    <div>
      <h2 className="sfma-title text-yellow-400 text-xl mb-6">Gestion des membres</h2>
      <div className="space-y-2">
        {members?.filter((m: any) => !m.isBanned).map((member: any) => (
          <div key={member.id} data-testid={`member-row-${member.id}`} className="glass-panel gold-border rounded-xl p-3 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full flex items-center justify-center border border-red-900/40 text-sm flex-shrink-0">
              {member.gradeEmoji}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-white text-sm">{member.username}</div>
              <div className="text-gray-500 text-xs">{member.memberId}</div>
            </div>
            <GradeBadge grade={member.grade} emoji={member.gradeEmoji} size="sm" />
            <div className="flex gap-1">
              <button onClick={() => promote(member.id, member.grade)} title="Promouvoir"
                className="px-2 py-1 rounded text-xs text-green-400 border border-green-800 hover:bg-green-900/20 transition-all">▲</button>
              <button onClick={() => demote(member.id, member.grade)} title="Rétrograder"
                className="px-2 py-1 rounded text-xs text-orange-400 border border-orange-800 hover:bg-orange-900/20 transition-all">▼</button>
              <button onClick={() => ban(member.id, member.username)} title="Bannir"
                className="px-2 py-1 rounded text-xs text-red-400 border border-red-800 hover:bg-red-900/20 transition-all">⛔</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function GroupsTab({ qc }: any) {
  const { data: groups } = useListGroups();
  const createMutation = useCreateGroup();
  const deleteMutation = useDeleteGroup();
  const [name, setName] = useState(""); const [emoji, setEmoji] = useState("💬");
  const [desc, setDesc] = useState(""); const [perm, setPerm] = useState<"all" | "lords_only">("all");

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({ data: { name, emoji, description: desc, writePermission: perm } }, {
      onSuccess: () => { setName(""); setDesc(""); qc.invalidateQueries({ queryKey: getListGroupsQueryKey() }); },
    });
  };

  return (
    <div>
      <h2 className="sfma-title text-yellow-400 text-xl mb-6">Groupes</h2>
      <form onSubmit={handleCreate} className="glass-panel gold-border rounded-xl p-4 mb-6 space-y-3">
        <h3 className="text-gray-300 text-sm font-medium">Créer un groupe</h3>
        <div className="grid grid-cols-2 gap-2">
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Nom" required
            className="px-3 py-2 rounded-lg bg-[#0F0F18] border border-red-900/30 text-white text-sm focus:outline-none focus:border-yellow-600" />
          <input value={emoji} onChange={e => setEmoji(e.target.value)} placeholder="Emoji"
            className="px-3 py-2 rounded-lg bg-[#0F0F18] border border-red-900/30 text-white text-sm focus:outline-none focus:border-yellow-600" />
        </div>
        <input value={desc} onChange={e => setDesc(e.target.value)} placeholder="Description"
          className="w-full px-3 py-2 rounded-lg bg-[#0F0F18] border border-red-900/30 text-white text-sm focus:outline-none focus:border-yellow-600" />
        <select value={perm} onChange={e => setPerm(e.target.value as any)}
          className="w-full px-3 py-2 rounded-lg bg-[#0F0F18] border border-red-900/30 text-white text-sm focus:outline-none focus:border-yellow-600">
          <option value="all">Tous les membres</option>
          <option value="lords_only">Lords seulement</option>
        </select>
        <button type="submit" disabled={createMutation.isPending}
          className="btn-ripple w-full py-2 rounded-lg text-white text-sm font-medium disabled:opacity-50"
          style={{ background: "linear-gradient(135deg, #8B0000, #CC0000)" }}>
          Créer
        </button>
      </form>
      <div className="space-y-2">
        {groups?.map((g: any) => (
          <div key={g.id} className="glass-panel gold-border rounded-xl p-3 flex items-center gap-3">
            <span className="text-xl">{g.emoji}</span>
            <div className="flex-1">
              <div className="text-white text-sm">{g.name}</div>
              <div className="text-gray-600 text-xs">{g.writePermission === "lords_only" ? "Lords seulement" : "Tous"}</div>
            </div>
            <button onClick={() => { if (window.confirm(`Supprimer ${g.name} ?`)) deleteMutation.mutate({ id: g.id }, { onSuccess: () => qc.invalidateQueries({ queryKey: getListGroupsQueryKey() }) }); }}
              className="text-red-500 hover:text-red-400 text-sm transition-colors">🗑️</button>
          </div>
        ))}
      </div>
    </div>
  );
}

function PollsTab({ qc }: any) {
  const createMutation = useCreatePoll();
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const validOpts = options.filter(o => o.trim());
    if (validOpts.length < 2) return;
    createMutation.mutate({ data: { question, options: validOpts } }, {
      onSuccess: () => { setQuestion(""); setOptions(["", ""]); },
    });
  };

  return (
    <div>
      <h2 className="sfma-title text-yellow-400 text-xl mb-6">Créer un sondage</h2>
      <form onSubmit={handleCreate} className="glass-panel gold-border rounded-xl p-5 space-y-3 max-w-md">
        <input value={question} onChange={e => setQuestion(e.target.value)} placeholder="Question" required
          className="w-full px-4 py-2 rounded-lg bg-[#0F0F18] border border-red-900/30 text-white text-sm focus:outline-none focus:border-yellow-600" />
        {options.map((opt, i) => (
          <div key={i} className="flex gap-2">
            <input value={opt} onChange={e => { const o = [...options]; o[i] = e.target.value; setOptions(o); }} placeholder={`Option ${i + 1}`} required={i < 2}
              className="flex-1 px-4 py-2 rounded-lg bg-[#0F0F18] border border-red-900/30 text-white text-sm focus:outline-none focus:border-yellow-600" />
            {i >= 2 && <button type="button" onClick={() => setOptions(o => o.filter((_, j) => j !== i))} className="text-red-500 px-2">✕</button>}
          </div>
        ))}
        <button type="button" onClick={() => setOptions(o => [...o, ""])} className="text-yellow-600 text-sm hover:text-yellow-400 transition-colors">
          + Ajouter une option
        </button>
        <button type="submit" disabled={createMutation.isPending}
          className="btn-ripple w-full py-2 rounded-lg text-white text-sm font-medium disabled:opacity-50"
          style={{ background: "linear-gradient(135deg, #8B0000, #CC0000)" }}>
          Créer le sondage
        </button>
      </form>
    </div>
  );
}

function EventsTab({ qc }: any) {
  const createMutation = useCreateEvent();
  const [title, setTitle] = useState(""); const [desc, setDesc] = useState("");
  const [loc, setLoc] = useState(""); const [date, setDate] = useState("");

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({ data: { title, description: desc, location: loc, eventDate: date } }, {
      onSuccess: () => { setTitle(""); setDesc(""); setLoc(""); setDate(""); },
    });
  };

  return (
    <div>
      <h2 className="sfma-title text-yellow-400 text-xl mb-6">Créer un événement</h2>
      <form onSubmit={handleCreate} className="glass-panel gold-border rounded-xl p-5 space-y-3 max-w-md">
        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Titre" required
          className="w-full px-4 py-2 rounded-lg bg-[#0F0F18] border border-red-900/30 text-white text-sm focus:outline-none focus:border-yellow-600" />
        <textarea value={desc} onChange={e => setDesc(e.target.value)} placeholder="Description" rows={3} required
          className="w-full px-4 py-2 rounded-lg bg-[#0F0F18] border border-red-900/30 text-white text-sm focus:outline-none focus:border-yellow-600 resize-none" />
        <input value={loc} onChange={e => setLoc(e.target.value)} placeholder="Lieu (optionnel)"
          className="w-full px-4 py-2 rounded-lg bg-[#0F0F18] border border-red-900/30 text-white text-sm focus:outline-none focus:border-yellow-600" />
        <input type="date" value={date} onChange={e => setDate(e.target.value)} required
          className="w-full px-4 py-2 rounded-lg bg-[#0F0F18] border border-red-900/30 text-white text-sm focus:outline-none focus:border-yellow-600" />
        <button type="submit" disabled={createMutation.isPending}
          className="btn-ripple w-full py-2 rounded-lg text-white text-sm font-medium disabled:opacity-50"
          style={{ background: "linear-gradient(135deg, #8B0000, #CC0000)" }}>
          Créer l'événement
        </button>
      </form>
    </div>
  );
}

function GalleryTab({ qc }: any) {
  const { data: photos } = useListGallery();
  const approveMutation = useApprovePhoto();

  return (
    <div>
      <h2 className="sfma-title text-yellow-400 text-xl mb-6">Modération de la galerie</h2>
      <p className="text-gray-500 text-sm mb-4">Seules les photos approuvées sont visibles dans la galerie publique.</p>
      <div className="grid grid-cols-2 gap-3">
        {photos?.map((p: any) => (
          <div key={p.id} className="glass-panel gold-border rounded-xl overflow-hidden">
            <img src={p.url} alt="" className="w-full h-32 object-cover" />
            <div className="p-2 flex justify-between items-center">
              <span className={`text-xs ${p.status === "approved" ? "text-green-400" : "text-yellow-500"}`}>{p.status}</span>
              {p.status !== "approved" && (
                <button onClick={() => approveMutation.mutate({ id: p.id }, { onSuccess: () => qc.invalidateQueries({ queryKey: getListGalleryQueryKey() }) })}
                  className="text-xs text-green-400 border border-green-800 px-2 py-1 rounded hover:bg-green-900/20 transition-all">
                  Approuver
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SettingsTab({ qc }: any) {
  const { data: settings } = useGetSettings();
  const updateMutation = useUpdateSettings();
  const [form, setForm] = useState<any>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate({ data: form }, {
      onSuccess: () => qc.invalidateQueries({ queryKey: getGetSettingsQueryKey() }),
    });
  };

  const val = (key: string) => form[key] !== undefined ? form[key] : (settings as any)?.[key] || "";
  const set = (key: string, value: string) => setForm((f: any) => ({ ...f, [key]: value }));

  return (
    <div>
      <h2 className="sfma-title text-yellow-400 text-xl mb-6">Paramètres du site</h2>
      <form onSubmit={handleSubmit} className="glass-panel gold-border rounded-xl p-5 space-y-4 max-w-lg">
        {[
          { key: "siteName", label: "Nom du site" },
          { key: "slogan", label: "Slogan" },
          { key: "description", label: "Description" },
          { key: "logoUrl", label: "URL du logo" },
          { key: "backgroundImageUrl", label: "URL de l'image de fond" },
          { key: "fontFamily", label: "Police (ex: Cinzel, Roboto...)" },
          { key: "whatsappGroupLink", label: "Lien WhatsApp" },
          { key: "whatsappGroupPhoto", label: "Photo du groupe WhatsApp (URL)" },
        ].map(({ key, label }) => (
          <div key={key}>
            <label className="block text-gray-400 text-xs mb-1">{label}</label>
            <input value={val(key)} onChange={e => set(key, e.target.value)} placeholder={label}
              className="w-full px-4 py-2 rounded-lg bg-[#0F0F18] border border-red-900/30 text-white text-sm focus:outline-none focus:border-yellow-600" />
          </div>
        ))}
        <div className="grid grid-cols-3 gap-2">
          {[
            { key: "primaryColor", label: "Rouge principal" },
            { key: "accentColor", label: "Or accent" },
            { key: "backgroundColor", label: "Fond" },
          ].map(({ key, label }) => (
            <div key={key}>
              <label className="block text-gray-400 text-xs mb-1">{label}</label>
              <div className="flex gap-1">
                <input type="color" value={val(key) || "#CC0000"} onChange={e => set(key, e.target.value)} className="w-8 h-8 rounded cursor-pointer" />
                <input value={val(key)} onChange={e => set(key, e.target.value)}
                  className="flex-1 px-2 py-1 rounded bg-[#0F0F18] border border-red-900/30 text-white text-xs focus:outline-none" />
              </div>
            </div>
          ))}
        </div>
        <button type="submit" disabled={updateMutation.isPending}
          className="btn-ripple w-full py-2 rounded-lg text-white text-sm font-medium disabled:opacity-50"
          style={{ background: "linear-gradient(135deg, #8B0000, #CC0000)" }}>
          {updateMutation.isPending ? "Sauvegarde..." : "Sauvegarder"}
        </button>
      </form>
    </div>
  );
}

function AuditTab() {
  const { data: logs } = useGetAuditLog();

  return (
    <div>
      <h2 className="sfma-title text-yellow-400 text-xl mb-6">Journal des actions</h2>
      <div className="space-y-2">
        {logs?.map((log: any) => (
          <div key={log.id} className="glass-panel rounded-lg px-4 py-2 border border-red-900/20 flex items-start gap-3 text-sm">
            <div className="text-gray-600 text-xs flex-shrink-0 mt-0.5">
              {new Date(log.timestamp).toLocaleString("fr-FR")}
            </div>
            <div className="flex-1">
              <span className="text-yellow-400">{log.actorUsername}</span>
              <span className="text-gray-400"> — {log.action}</span>
              {log.targetName && <span className="text-gray-500"> ({log.targetName})</span>}
            </div>
          </div>
        ))}
        {(!logs || logs.length === 0) && <div className="text-gray-600 text-center py-8">Aucune action enregistrée</div>}
      </div>
    </div>
  );
}

function FounderTab({ qc }: any) {
  const { data: members } = useListMembers();
  const updateMutation = useUpdateMember();

  const promote = (id: string, grade: string, username: string) => {
    const eligible = ["Lord", "Membre_Élite", "Membre", "Administrateur"];
    if (!eligible.includes(grade) && !["Lord", "Administrateur"].includes(grade)) {
      alert("Ce membre doit être au moins Lord ou Administrateur pour être promu Co-Fondateur.");
      return;
    }
    const target = window.confirm(`Nommer ${username} Co-Fondateur ?`) ? "Co-Fondateur" : null;
    if (!target) return;
    updateMutation.mutate({ id, data: { grade: target } }, { onSuccess: () => qc.invalidateQueries({ queryKey: getListMembersQueryKey() }) });
  };

  const promoteLord = (id: string, username: string) => {
    if (!window.confirm(`Nommer ${username} Lord ?`)) return;
    updateMutation.mutate({ id, data: { grade: "Lord" } }, { onSuccess: () => qc.invalidateQueries({ queryKey: getListMembersQueryKey() }) });
  };

  const demoteToElite = (id: string, username: string) => {
    if (!window.confirm(`Rétrograder ${username} à Membre Élite ?`)) return;
    updateMutation.mutate({ id, data: { grade: "Membre_Élite" } }, { onSuccess: () => qc.invalidateQueries({ queryKey: getListMembersQueryKey() }) });
  };

  const lords = members?.filter((m: any) => ["Lord", "Co-Fondateur"].includes(m.grade)) || [];

  return (
    <div>
      <h2 className="sfma-title text-yellow-400 text-xl mb-2">Espace Fondateur</h2>
      <p className="text-gray-500 text-sm mb-6">Gérez les Lords et Co-Fondateurs. Toute action est journalisée.</p>

      <h3 className="text-gray-300 text-sm font-medium mb-3">Lords & Co-Fondateurs actuels</h3>
      <div className="space-y-2 mb-6">
        {lords.map((m: any) => (
          <div key={m.id} className="glass-panel gold-border rounded-xl p-3 flex items-center gap-3">
            <span className="text-xl">{m.gradeEmoji}</span>
            <div className="flex-1">
              <div className="text-white">{m.username}</div>
              <div className="text-gray-500 text-xs">{m.grade.replace(/_/g, " ")}</div>
            </div>
            <button onClick={() => demoteToElite(m.id, m.username)}
              className="text-xs text-orange-400 border border-orange-800 px-3 py-1 rounded hover:bg-orange-900/20 transition-all">
              Rétrograder
            </button>
          </div>
        ))}
      </div>

      <h3 className="text-gray-300 text-sm font-medium mb-3">Promouvoir un membre</h3>
      <div className="space-y-2">
        {members?.filter((m: any) => !["Fondateur_Suprême", "Co-Fondateur", "Lord"].includes(m.grade) && !m.isBanned).map((m: any) => (
          <div key={m.id} className="glass-panel rounded-lg p-3 border border-red-900/20 flex items-center gap-3">
            <span className="text-sm">{m.gradeEmoji}</span>
            <div className="flex-1 text-sm text-gray-300">{m.username}</div>
            <div className="flex gap-1">
              <button onClick={() => promoteLord(m.id, m.username)}
                className="text-xs text-red-400 border border-red-800 px-2 py-1 rounded hover:bg-red-900/20 transition-all">
                ⚔️ Lord
              </button>
              <button onClick={() => promote(m.id, m.grade, m.username)}
                className="text-xs text-yellow-400 border border-yellow-800 px-2 py-1 rounded hover:bg-yellow-900/20 transition-all">
                ⚜️ Co-Fond
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
