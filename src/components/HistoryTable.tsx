import { QueueHistory } from "@/hooks/useQueue";
import { format } from "date-fns";

interface HistoryTableProps {
  history: QueueHistory[];
}

const ACTION_LABELS: Record<string, { label: string; color: string }> = {
  TOKEN_GENERATED: { label: "Token Generated", color: "text-queue-waiting" },
  TOKEN_CALLED: { label: "Token Called", color: "text-queue-active" },
  QUEUE_RESET: { label: "Queue Reset", color: "text-destructive" },
};

export function HistoryTable({ history }: HistoryTableProps) {
  if (history.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p className="text-sm">No activity yet today.</p>
      </div>
    );
  }

  return (
    <div className="overflow-auto rounded-xl border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/30">
            <th className="text-left px-4 py-3 text-xs uppercase tracking-widest text-muted-foreground font-semibold">Time</th>
            <th className="text-left px-4 py-3 text-xs uppercase tracking-widest text-muted-foreground font-semibold">Action</th>
            <th className="text-left px-4 py-3 text-xs uppercase tracking-widest text-muted-foreground font-semibold">Token #</th>
            <th className="text-left px-4 py-3 text-xs uppercase tracking-widest text-muted-foreground font-semibold">Details</th>
          </tr>
        </thead>
        <tbody>
          {history.map((entry, i) => {
            const meta = ACTION_LABELS[entry.action] ?? { label: entry.action, color: "text-foreground" };
            return (
              <tr
                key={entry.id}
                className={`border-b border-border/50 transition-colors hover:bg-muted/20 ${
                  i % 2 === 0 ? "bg-transparent" : "bg-muted/10"
                }`}
              >
                <td className="px-4 py-3 text-muted-foreground font-mono text-xs">
                  {format(new Date(entry.performed_at), "HH:mm:ss")}
                </td>
                <td className="px-4 py-3">
                  <span className={`font-semibold ${meta.color}`}>{meta.label}</span>
                </td>
                <td className="px-4 py-3 font-mono font-bold text-foreground">
                  {entry.token_number != null ? `#${String(entry.token_number).padStart(3, "0")}` : "—"}
                </td>
                <td className="px-4 py-3 text-muted-foreground">{entry.details ?? "—"}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
