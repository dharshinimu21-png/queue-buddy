import { QueueStatus } from "@/hooks/useQueue";
import { Users, Clock, Hash } from "lucide-react";

interface QueueDisplayProps {
  queueStatus: QueueStatus | null;
  waitingCount: number;
}

export function QueueDisplay({ queueStatus, waitingCount }: QueueDisplayProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {/* Now Serving */}
      <div className="active-card-glow rounded-xl bg-card border border-queue-active/30 p-6 flex flex-col items-center gap-2 pulse-ring">
        <span className="text-xs font-semibold uppercase tracking-widest text-queue-active/80">Now Serving</span>
        <span className="text-7xl font-black token-number-glow text-queue-active animate-count-up">
          {queueStatus?.current_token === 0 ? "—" : String(queueStatus?.current_token ?? 0).padStart(3, "0")}
        </span>
        <span className="text-xs text-muted-foreground">Current Token</span>
      </div>

      {/* Waiting */}
      <div className="card-glow rounded-xl bg-card border border-border p-6 flex flex-col items-center gap-2">
        <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Waiting</span>
        <div className="flex items-center gap-2">
          <Users className="w-6 h-6 text-queue-waiting" />
          <span className="text-5xl font-black text-queue-waiting">{waitingCount}</span>
        </div>
        <span className="text-xs text-muted-foreground">In Queue</span>
      </div>

      {/* Issued Today */}
      <div className="card-glow rounded-xl bg-card border border-border p-6 flex flex-col items-center gap-2">
        <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Issued Today</span>
        <div className="flex items-center gap-2">
          <Hash className="w-6 h-6 text-primary" />
          <span className="text-5xl font-black text-primary">{queueStatus?.last_token_issued ?? 0}</span>
        </div>
        <span className="text-xs text-muted-foreground">Total Tokens</span>
      </div>
    </div>
  );
}
