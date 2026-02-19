import { useState } from "react";
import { useQueue } from "@/hooks/useQueue";
import { QueueDisplay } from "@/components/QueueDisplay";
import { HistoryTable } from "@/components/HistoryTable";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ChevronRight, RotateCcw, History, LayoutDashboard, Home, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";

const Admin = () => {
  const { queueStatus, waitingTokens, history, loading, callNextToken, resetQueue, refetch } = useQueue();
  const [callingNext, setCallingNext] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [tab, setTab] = useState<"dashboard" | "history">("dashboard");

  const handleCallNext = async () => {
    setCallingNext(true);
    await callNextToken();
    setCallingNext(false);
  };

  const handleReset = async () => {
    setResetting(true);
    await resetQueue();
    setResetting(false);
  };

  return (
    <div className="min-h-screen bg-background grid-bg">
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center">
              <LayoutDashboard className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="font-black text-lg text-foreground tracking-tight">Admin Console</h1>
              <p className="text-xs text-muted-foreground">QueueFlow Management</p>
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
            <Link to="/">
              <Button variant="outline" size="sm" className="gap-2 border-border text-muted-foreground hover:text-foreground">
                <Home className="w-4 h-4" />
                User View
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        {/* Queue Status */}
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

        {/* Admin Controls */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary" />
            <span className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">Admin Controls</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Call Next */}
            <div className="card-glow rounded-2xl bg-card border border-border p-6 space-y-4">
              <div>
                <h3 className="font-bold text-foreground text-lg">Call Next Token</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {waitingTokens.length > 0
                    ? `Next: #${String(waitingTokens[0]?.token_number ?? 0).padStart(3, "0")} · ${waitingTokens.length} waiting`
                    : "No tokens in queue"}
                </p>
              </div>
              <Button
                onClick={handleCallNext}
                disabled={callingNext || waitingTokens.length === 0}
                size="lg"
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-bold gap-2 rounded-xl py-6"
              >
                {callingNext ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Calling...
                  </>
                ) : (
                  <>
                    <ChevronRight className="w-5 h-5" />
                    Call Next
                  </>
                )}
              </Button>
            </div>

            {/* Reset Queue */}
            <div className="card-glow rounded-2xl bg-card border border-destructive/20 p-6 space-y-4">
              <div>
                <h3 className="font-bold text-foreground text-lg">Reset Queue</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Clear all waiting tokens and start fresh. This cannot be undone.
                </p>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="lg"
                    disabled={resetting}
                    className="w-full border-destructive/40 text-destructive hover:bg-destructive/10 font-bold gap-2 rounded-xl py-6"
                  >
                    {resetting ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Resetting...
                      </>
                    ) : (
                      <>
                        <RotateCcw className="w-4 h-4" />
                        Reset Queue
                      </>
                    )}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-card border-border">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Reset the Queue?</AlertDialogTitle>
                    <AlertDialogDescription>
                      All {waitingTokens.length} waiting token{waitingTokens.length !== 1 ? "s" : ""} will be cleared. The
                      token counter will reset to 0. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="border-border">Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleReset}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Yes, Reset Queue
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </section>

        {/* Tab nav */}
        <section className="space-y-3">
          <div className="flex items-center gap-1 bg-muted/30 rounded-lg p-1 w-fit">
            <button
              onClick={() => setTab("dashboard")}
              className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors ${
                tab === "dashboard"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Waiting List
            </button>
            <button
              onClick={() => setTab("history")}
              className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                tab === "history"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <History className="w-3.5 h-3.5" />
              History
            </button>
          </div>

          {tab === "dashboard" && (
            <div className="card-glow rounded-2xl bg-card border border-border p-6">
              {waitingTokens.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p className="text-sm">No tokens currently waiting.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold mb-4">
                    {waitingTokens.length} Token{waitingTokens.length !== 1 ? "s" : ""} Waiting
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {waitingTokens.map((t, i) => (
                      <div
                        key={t.id}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg border font-mono font-bold text-sm transition-colors ${
                          i === 0
                            ? "bg-primary/15 border-primary/40 text-primary"
                            : "bg-muted/20 border-border text-muted-foreground"
                        }`}
                      >
                        #{String(t.token_number).padStart(3, "0")}
                        {i === 0 && <span className="text-xs font-sans font-semibold text-primary/70">next</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {tab === "history" && (
            <div className="card-glow rounded-2xl bg-card border border-border p-1 overflow-hidden">
              <HistoryTable history={history} />
            </div>
          )}
        </section>
      </main>

      <footer className="border-t border-border mt-8 py-4 text-center">
        <p className="text-xs text-muted-foreground">QueueFlow Admin · {new Date().toLocaleDateString()}</p>
      </footer>
    </div>
  );
};

export default Admin;
