import { useListEvents, useRsvpEvent, getListEventsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import Layout from "@/components/Layout";
import { useAuth } from "@/context/AuthContext";

export default function Events() {
  const { data: events, isLoading } = useListEvents();
  const rsvpMutation = useRsvpEvent();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const handleRsvp = (id: string) => {
    rsvpMutation.mutate({ id }, {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: getListEventsQueryKey() }),
    });
  };

  return (
    <Layout>
      <div className="p-4 md:p-6 overflow-y-auto h-[calc(100vh-60px)]">
        <h1 className="sfma-title text-2xl text-yellow-400 mb-6">Événements</h1>

        {isLoading ? (
          <div className="text-yellow-400 sfma-title animate-pulse text-center py-12">Chargement...</div>
        ) : events?.length === 0 ? (
          <div className="glass-panel gold-border rounded-xl p-8 text-center text-gray-500">
            Aucun événement planifié
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {events?.map((event: any) => (
              <div key={event.id} data-testid={`event-${event.id}`} className="glass-panel gold-border rounded-xl p-5 card-tilt">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="sfma-title text-yellow-400 font-medium text-lg flex-1">{event.title}</h3>
                  <span className="text-2xl">📅</span>
                </div>

                <p className="text-gray-400 text-sm mb-3">{event.description}</p>

                <div className="space-y-1 mb-4">
                  {event.location && (
                    <div className="text-gray-500 text-xs">📍 {event.location}</div>
                  )}
                  <div className="text-gray-400 text-sm font-medium">
                    🗓️ {new Date(event.eventDate).toLocaleDateString("fr-FR", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-gray-400 text-sm">
                    <span className="text-yellow-400 font-bold">{event.participantCount}</span> participant{event.participantCount !== 1 ? "s" : ""}
                  </div>
                  <button
                    data-testid={`button-rsvp-${event.id}`}
                    onClick={() => handleRsvp(event.id)}
                    disabled={rsvpMutation.isPending}
                    className={`btn-ripple px-4 py-2 rounded-lg text-sm font-medium transition-all hover:scale-105 active:scale-95 ${
                      event.isParticipating
                        ? "text-yellow-400 border border-yellow-700 bg-yellow-900/20"
                        : "text-white border border-red-800"
                    }`}
                    style={!event.isParticipating ? { background: "linear-gradient(135deg, #8B0000, #CC0000)" } : {}}
                  >
                    {event.isParticipating ? "✓ Je participe" : "Participer"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
