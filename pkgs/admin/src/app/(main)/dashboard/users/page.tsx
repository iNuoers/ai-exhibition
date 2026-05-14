"use client";

import { useEffect, useState } from "react";

import { toast } from "sonner";

import { ApiClient } from "@/lib/api-client";

import type { UserRow } from "./_components/schema";
import { UsersTable } from "./_components/users-table";

export default function UsersPage() {
    const [users, setUsers] = useState<UserRow[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                const data = await ApiClient.get<any[]>("/users");
                let parsedData: any[] = [];

                if (Array.isArray(data)) {
                    parsedData = data;
                } else if (data && typeof data === "object" && "data" in data && Array.isArray((data as any).data)) {
                    parsedData = (data as any).data;
                }

                setUsers(
                    parsedData.map((u: any) => ({
                        ...u,
                        is_active: u.is_active ?? true,
                    })),
                );
            } catch (error) {
                console.error("Failed to fetch users:", error);
                toast.error("Failed to load users");
            } finally {
                setLoading(false);
            }
        }

        void fetchData();
    }, []);

    return (
        <div className="flex flex-col gap-6 p-6">
            <div>
                <h1 className="font-bold text-3xl tracking-tight">Users</h1>
                <p className="text-muted-foreground">Manage your application and exhibition users.</p>
            </div>
            {loading ? (
                <div className="flex items-center justify-center py-10">
                    <div className="h-8 w-8 animate-spin rounded-full border-primary border-b-2" />
                </div>
            ) : (
                <UsersTable data={users} />
            )}
        </div>
    );
}
