import { Clock, CheckCircle2, AlertCircle } from "lucide-react";

interface TokenCardProps {
  tokenNumber: number;
  estimatedWait: number;
  currentToken: number;
}

export function TokenCard({ tokenNumber, estimatedWait, currentToken }: TokenCardProps) {
  const position = Math.max(0, tokenNumber - currentToken);
  const isNext = position === 1;
  const isCurrent = currentToken === tokenNumber;

  return (
    <div className={`rounded-2xl border p-8 flex flex-col items-center gap-4 animate-fade-in ${
      isCurrent
        ? "active-card-glow border-queue-active/50 bg-card"
        : isNext
        ? "card-glow border-primary/40 bg-card"
        : "card-glow border-border bg-card"
    }`}>
      <div className="flex items-center gap-2">
        {isCurrent ? (
          <CheckCircle2 className="w-5 h-5 text-queue-active" />
        ) : (
          <AlertCircle className="w-5 h-5 text-primary" />
        )}
        <span className={`text-sm font-semibold uppercase tracking-wider ${
          isCurrent ? "text-queue-active" : "text-primary"
        }`}>
          {isCurrent ? "Now Being Served!" : "Your Token"}
        </span>
      </div>

      <div className={`text-8xl font-black ${
        isCurrent ? "token-number-glow text-queue-active" : "primary-glow text-primary"
      }`}>
        {String(tokenNumber).padStart(3, "0")}
      </div>

      <div className="w-full border-t border-border pt-4 flex justify-between text-sm">
        <div className="flex flex-col items-center gap-1">
          <span className="text-muted-foreground text-xs uppercase tracking-wide">Queue Position</span>
          <span className="font-bold text-foreground text-lg">{isCurrent ? "🎉" : `#${position}`}</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <span className="text-muted-foreground text-xs uppercase tracking-wide flex items-center gap-1">
            <Clock className="w-3 h-3" /> Est. Wait
          </span>
          <span className="font-bold text-foreground text-lg">
            {isCurrent ? "—" : estimatedWait === 0 ? "< 1 min" : `~${estimatedWait} min`}
          </span>
        </div>
      </div>

      {isNext && !isCurrent && (
        <div className="w-full bg-primary/10 border border-primary/30 rounded-lg py-2 px-3 text-center">
          <span className="text-primary text-xs font-semibold">⚡ You're next! Please be ready.</span>
        </div>
      )}
    </div>
  );
}
