import { useListPolls, useVotePoll, getListPollsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import Layout from "@/components/Layout";
import { useAuth } from "@/context/AuthContext";

export default function Polls() {
  const { data: polls, isLoading } = useListPolls();
  const voteMutation = useVotePoll();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const handleVote = (pollId: string, optionId: string) => {
    voteMutation.mutate({ id: pollId, data: { optionId } }, {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: getListPollsQueryKey() }),
    });
  };

  return (
    <Layout>
      <div className="p-4 md:p-6 overflow-y-auto h-[calc(100vh-60px)]">
        <h1 className="sfma-title text-2xl text-yellow-400 mb-6">Sondages</h1>

        {isLoading ? (
          <div className="text-yellow-400 sfma-title animate-pulse text-center py-12">Chargement...</div>
        ) : polls?.length === 0 ? (
          <div className="glass-panel gold-border rounded-xl p-8 text-center text-gray-500">
            Aucun sondage disponible
          </div>
        ) : (
          <div className="space-y-4">
            {polls?.map((poll: any) => (
              <div key={poll.id} data-testid={`poll-${poll.id}`} className="glass-panel gold-border rounded-xl p-5 card-tilt">
                <h3 className="sfma-title text-yellow-400 mb-1 font-medium">{poll.question}</h3>
                <div className="text-gray-500 text-xs mb-4">{poll.totalVotes} vote{poll.totalVotes !== 1 ? "s" : ""}</div>

                <div className="space-y-2">
                  {poll.options?.map((opt: any) => {
                    const voted = poll.userVotedOption === opt.id;
                    const hasVoted = !!poll.userVotedOption;
                    return (
                      <button
                        key={opt.id}
                        data-testid={`option-${opt.id}`}
                        onClick={() => !hasVoted && handleVote(poll.id, opt.id)}
                        disabled={hasVoted || voteMutation.isPending}
                        className={`w-full text-left rounded-lg overflow-hidden border transition-all relative ${
                          voted ? "border-yellow-600" : "border-gray-700 hover:border-gray-500"
                        } ${!hasVoted ? "hover:scale-[1.01] cursor-pointer" : "cursor-default"}`}
                      >
                        <div
                          className="absolute inset-0 transition-all duration-700"
                          style={{
                            width: hasVoted ? `${opt.percentage}%` : "0%",
                            background: voted ? "rgba(201,162,39,0.2)" : "rgba(139,0,0,0.15)",
                          }}
                        />
                        <div className="relative px-4 py-2.5 flex justify-between items-center">
                          <span className={`text-sm ${voted ? "text-yellow-300" : "text-gray-300"}`}>{opt.text}</span>
                          {hasVoted && <span className={`text-sm font-bold ${voted ? "text-yellow-400" : "text-gray-500"}`}>{opt.percentage}%</span>}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
