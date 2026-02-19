import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface QueueStatus {
  id: string;
  current_token: number;
  last_token_issued: number;
  avg_service_minutes: number;
  session_date: string;
  updated_at: string;
}

export interface Token {
  id: string;
  token_number: number;
  status: string;
  created_at: string;
  called_at: string | null;
  session_date: string;
}

export interface QueueHistory {
  id: string;
  action: string;
  token_number: number | null;
  details: string | null;
  performed_at: string;
}

export function useQueue() {
  const [queueStatus, setQueueStatus] = useState<QueueStatus | null>(null);
  const [waitingTokens, setWaitingTokens] = useState<Token[]>([]);
  const [history, setHistory] = useState<QueueHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchQueueStatus = useCallback(async () => {
    const today = new Date().toISOString().split("T")[0];
    const { data, error } = await supabase
      .from("queue_status")
      .select("*")
      .eq("session_date", today)
      .maybeSingle();

    if (error) {
      console.error("Error fetching queue status:", error);
      return;
    }

    if (!data) {
      // Create today's queue status
      const { data: newStatus } = await supabase
        .from("queue_status")
        .insert({ current_token: 0, last_token_issued: 0, avg_service_minutes: 5, session_date: today })
        .select()
        .single();
      setQueueStatus(newStatus);
    } else {
      setQueueStatus(data);
    }
  }, []);

  const fetchWaitingTokens = useCallback(async () => {
    const today = new Date().toISOString().split("T")[0];
    const { data, error } = await supabase
      .from("tokens")
      .select("*")
      .eq("session_date", today)
      .eq("status", "waiting")
      .order("token_number", { ascending: true });

    if (!error && data) setWaitingTokens(data);
  }, []);

  const fetchHistory = useCallback(async () => {
    const today = new Date().toISOString().split("T")[0];
    const { data, error } = await supabase
      .from("queue_history")
      .select("*")
      .eq("session_date", today)
      .order("performed_at", { ascending: false })
      .limit(50);

    if (!error && data) setHistory(data);
  }, []);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    await Promise.all([fetchQueueStatus(), fetchWaitingTokens(), fetchHistory()]);
    setLoading(false);
  }, [fetchQueueStatus, fetchWaitingTokens, fetchHistory]);

  useEffect(() => {
    fetchAll();

    // Realtime subscriptions
    const channel = supabase
      .channel("queue-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "queue_status" }, () => {
        fetchQueueStatus();
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "tokens" }, () => {
        fetchWaitingTokens();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchAll, fetchQueueStatus, fetchWaitingTokens]);

  // POST /token — Generate a new token
  const generateToken = useCallback(async (): Promise<number | null> => {
    const today = new Date().toISOString().split("T")[0];

    // Get current status
    const { data: status } = await supabase
      .from("queue_status")
      .select("*")
      .eq("session_date", today)
      .maybeSingle();

    const nextTokenNumber = (status?.last_token_issued ?? 0) + 1;

    const { error: tokenError } = await supabase.from("tokens").insert({
      token_number: nextTokenNumber,
      status: "waiting",
      session_date: today,
    });

    if (tokenError) {
      toast({ title: "Error", description: "Failed to generate token.", variant: "destructive" });
      return null;
    }

    // Update queue status
    if (status) {
      await supabase
        .from("queue_status")
        .update({ last_token_issued: nextTokenNumber, updated_at: new Date().toISOString() })
        .eq("id", status.id);
    } else {
      await supabase.from("queue_status").insert({
        current_token: 0,
        last_token_issued: nextTokenNumber,
        avg_service_minutes: 5,
        session_date: today,
      });
    }

    await supabase.from("queue_history").insert({
      action: "TOKEN_GENERATED",
      token_number: nextTokenNumber,
      details: `Token #${nextTokenNumber} generated`,
      session_date: today,
    });

    await fetchAll();
    return nextTokenNumber;
  }, [toast, fetchAll]);

  // PUT /queue/next — Admin calls next token
  const callNextToken = useCallback(async () => {
    const today = new Date().toISOString().split("T")[0];

    const { data: status } = await supabase
      .from("queue_status")
      .select("*")
      .eq("session_date", today)
      .maybeSingle();

    if (!status) return;

    // Find next waiting token
    const { data: nextToken } = await supabase
      .from("tokens")
      .select("*")
      .eq("session_date", today)
      .eq("status", "waiting")
      .order("token_number", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (!nextToken) {
      toast({ title: "Queue Empty", description: "No waiting tokens in the queue." });
      return;
    }

    // Mark previous current token as served
    if (status.current_token > 0) {
      await supabase
        .from("tokens")
        .update({ status: "served", served_at: new Date().toISOString() })
        .eq("token_number", status.current_token)
        .eq("session_date", today);
    }

    // Update next token to called
    await supabase
      .from("tokens")
      .update({ status: "called", called_at: new Date().toISOString() })
      .eq("id", nextToken.id);

    // Update queue status
    await supabase
      .from("queue_status")
      .update({ current_token: nextToken.token_number, updated_at: new Date().toISOString() })
      .eq("id", status.id);

    await supabase.from("queue_history").insert({
      action: "TOKEN_CALLED",
      token_number: nextToken.token_number,
      details: `Token #${nextToken.token_number} called`,
      session_date: today,
    });

    await fetchAll();
    toast({ title: `Now Serving #${nextToken.token_number}`, description: "Next token called successfully." });
  }, [toast, fetchAll]);

  // POST /queue/reset — Admin resets queue
  const resetQueue = useCallback(async () => {
    const today = new Date().toISOString().split("T")[0];

    // Mark all waiting/called tokens as skipped
    await supabase
      .from("tokens")
      .update({ status: "skipped" })
      .eq("session_date", today)
      .in("status", ["waiting", "called"]);

    // Reset queue status
    await supabase
      .from("queue_status")
      .update({ current_token: 0, last_token_issued: 0, updated_at: new Date().toISOString() })
      .eq("session_date", today);

    await supabase.from("queue_history").insert({
      action: "QUEUE_RESET",
      token_number: null,
      details: "Queue reset by admin",
      session_date: today,
    });

    await fetchAll();
    toast({ title: "Queue Reset", description: "The queue has been reset successfully." });
  }, [toast, fetchAll]);

  const estimatedWait = useCallback(
    (tokenNumber: number) => {
      if (!queueStatus) return 0;
      const position = Math.max(0, tokenNumber - queueStatus.current_token - 1);
      return position * (queueStatus.avg_service_minutes ?? 5);
    },
    [queueStatus]
  );

  return {
    queueStatus,
    waitingTokens,
    history,
    loading,
    generateToken,
    callNextToken,
    resetQueue,
    estimatedWait,
    refetch: fetchAll,
  };
}
