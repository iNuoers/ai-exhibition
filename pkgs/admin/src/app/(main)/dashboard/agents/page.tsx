"use client";

import { useEffect, useState } from "react";

import { toast } from "sonner";

import { ApiClient } from "@/lib/api-client";

import { AgentsTable } from "./_components/agents-table";
import type { AgentRow } from "./_components/schema";

export default function AgentsPage() {
    const [agents, setAgents] = useState<AgentRow[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                const data = await ApiClient.get<any[]>("/agents");
                if (Array.isArray(data)) {
                    setAgents(data);
                } else if (data && typeof data === "object" && "data" in data && Array.isArray((data as any).data)) {
                    setAgents((data as any).data);
                }
            } catch (error) {
                console.error("Failed to fetch agents:", error);
                toast.error("Failed to load agents");
            } finally {
                setLoading(false);
            }
        }

        void fetchData();
    }, []);

    return (
        <div className="flex flex-col gap-6 p-6">
            <div>
                <h1 className="font-bold text-3xl tracking-tight">Agents</h1>
                <p className="text-muted-foreground">Manage and configure AI Assistants for your exhibitions.</p>
            </div>
            {loading ? (
                <div className="flex items-center justify-center py-10">
                    <div className="h-8 w-8 animate-spin rounded-full border-primary border-b-2" />
                </div>
            ) : (
                <AgentsTable data={agents} />
            )}
        </div>
    );
}
