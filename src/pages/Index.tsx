import { useState } from "react";
import { useQueue } from "@/hooks/useQueue";
import { QueueDisplay } from "@/components/QueueDisplay";
import { TokenCard } from "@/components/TokenCard";
import { Button } from "@/components/ui/button";
import { Ticket, RefreshCw, LayoutDashboard } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  const { queueStatus, waitingTokens, loading, generateToken, estimatedWait, refetch } = useQueue();
  const [myToken, setMyToken] = useState<number | null>(null);
  const [generating, setGenerating] = useState(false);

  const handleGenerateToken = async () => {
    setGenerating(true);
    const token = await generateToken();
    if (token) setMyToken(token);
    setGenerating(false);
  };

  return (
    <div className="min-h-screen bg-background grid-bg">
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
              <Ticket className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-black text-lg text-foreground tracking-tight">QueueFlow</h1>
              <p className="text-xs text-muted-foreground">Digital Queue System</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={refetch}
              disabled={loading}
              className="text-muted-foreground hover:text-foreground"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
            <Link to="/admin">
              <Button variant="outline" size="sm" className="gap-2 border-border text-muted-foreground hover:text-foreground">
                <LayoutDashboard className="w-4 h-4" />
                Admin
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* Queue Status Display */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-queue-served animate-pulse" />
            <span className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">Live Queue Status</span>
          </div>
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-36 rounded-xl bg-card border border-border animate-pulse" />
              ))}
            </div>
          ) : (
            <QueueDisplay queueStatus={queueStatus} waitingCount={waitingTokens.length} />
          )}
        </section>

        {/* Generate Token */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary" />
            <span className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">Take a Number</span>
          </div>

          {!myToken ? (
            <div className="card-glow rounded-2xl bg-card border border-border p-8 text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto">
                <Ticket className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">Join the Queue</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Get your queue token and wait for your number to be called.
                </p>
              </div>
              <Button
                onClick={handleGenerateToken}
                disabled={generating}
                size="lg"
                className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold px-10 py-6 text-base rounded-xl gap-2"
              >
                {generating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Ticket className="w-5 h-5" />
                    Get Token
                  </>
                )}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <TokenCard
                tokenNumber={myToken}
                estimatedWait={estimatedWait(myToken)}
                currentToken={queueStatus?.current_token ?? 0}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => setMyToken(null)}
                className="w-full border-border text-muted-foreground hover:text-foreground"
              >
                Get Another Token
              </Button>
            </div>
          )}
        </section>

        {/* Waiting list */}
        {waitingTokens.length > 0 && (
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-queue-waiting" />
              <span className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">
                Waiting — {waitingTokens.length} token{waitingTokens.length !== 1 ? "s" : ""}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {waitingTokens.map((t) => (
                <div
                  key={t.id}
                  className={`px-3 py-1.5 rounded-lg text-sm font-mono font-bold border transition-colors ${
                    t.token_number === myToken
                      ? "bg-primary/20 border-primary/50 text-primary"
                      : "bg-muted/30 border-border text-muted-foreground"
                  }`}
                >
                  #{String(t.token_number).padStart(3, "0")}
                  {t.token_number === myToken && " (you)"}
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      <footer className="border-t border-border mt-8 py-4 text-center">
        <p className="text-xs text-muted-foreground">QueueFlow · Digital Token Management</p>
      </footer>
    </div>
  );
};

export default Index;
