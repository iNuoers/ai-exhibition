"use client";

import { useEffect, useState } from "react";

import { toast } from "sonner";

import { ApiClient } from "@/lib/api-client";

import { ConversationsTable } from "./_components/conversations-table";
import type { ConversationRow } from "./_components/schema";

export default function ConversationsPage() {
    const [conversations, setConversations] = useState<ConversationRow[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                const data = await ApiClient.get<any[]>("/auth/sessions");
                let parsedData: any[] = [];

                if (Array.isArray(data)) {
                    parsedData = data;
                } else if (data && typeof data === "object" && "data" in data && Array.isArray((data as any).data)) {
                    parsedData = (data as any).data;
                }

                setConversations(
                    parsedData.map((session: any) => ({
                        id: session.id,
                        user_id: session.user_id,
                        user_nickname: `User ${session.user_id}`,
                        exhibition_name: "Exhibition",
                        agent_name: "Agent",
                        is_active: session.is_active ?? true,
                        created_at: session.created_at || session.last_active_at,
                        message_count: 0,
                    })),
                );
            } catch (error) {
                console.error("Failed to fetch sessions/conversations:", error);
                toast.error("Failed to load conversations");
            } finally {
                setLoading(false);
            }
        }

        void fetchData();
    }, []);

    return (
        <div className="flex flex-col gap-6 p-6">
            <div>
                <h1 className="font-bold text-3xl tracking-tight">Conversations</h1>
                <p className="text-muted-foreground">View and monitor visitor chat sessions with your Agents.</p>
            </div>
            {loading ? (
                <div className="flex items-center justify-center py-10">
                    <div className="h-8 w-8 animate-spin rounded-full border-primary border-b-2" />
                </div>
            ) : (
                <ConversationsTable data={conversations} />
            )}
        </div>
    );
}
