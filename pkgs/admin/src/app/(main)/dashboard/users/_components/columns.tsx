"use client";
"use no memo";

import type { ColumnDef } from "@tanstack/react-table";
import { UserRound } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";

import type { UserRow } from "./schema";

export const usersColumns: ColumnDef<UserRow>[] = [
    {
        id: "select",
        header: ({ table }) => (
            <Checkbox
                checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
                onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                aria-label="Select all"
            />
        ),
        cell: ({ row }) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label="Select row"
            />
        ),
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: "nickname",
        header: "User",
        cell: ({ row }) => {
            const nickname = row.original.nickname || row.original.full_name || "Unknown";
            const avatarUrl = row.original.avatar_url;

            return (
                <div className="flex items-center gap-2">
                    {avatarUrl ? (
                        // biome-ignore lint/performance/noImgElement: External avatars
                        <img src={avatarUrl} alt={nickname} className="h-8 w-8 rounded-full bg-muted object-cover" />
                    ) : (
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground">
                            <UserRound className="h-4 w-4" />
                        </div>
                    )}
                    <div className="flex flex-col">
                        <span className="font-medium">{nickname}</span>
                        {row.original.email && (
                            <span className="text-muted-foreground text-xs">{row.original.email}</span>
                        )}
                        {row.original.openid && !row.original.email && (
                            <span
                                className="max-w-[120px] truncate text-muted-foreground text-xs"
                                title={row.original.openid}
                            >
                                {row.original.openid}
                            </span>
                        )}
                    </div>
                </div>
            );
        },
    },
    {
        accessorKey: "role",
        header: "Role",
        cell: ({ row }) => {
            const role = row.getValue("role") as string;
            return (
                <Badge variant={role === "admin" ? "default" : role === "superuser" ? "destructive" : "secondary"}>
                    {role}
                </Badge>
            );
        },
    },
    {
        accessorKey: "is_active",
        header: "Status",
        cell: ({ row }) => {
            const isActive = row.getValue("is_active") as boolean;
            return (
                <Badge
                    variant={isActive ? "outline" : "secondary"}
                    className={isActive ? "border-green-600 text-green-600" : ""}
                >
                    {isActive ? "Active" : "Inactive"}
                </Badge>
            );
        },
    },
    {
        accessorKey: "created_at",
        header: "Joined",
        cell: ({ row }) => {
            const dateStr = row.getValue("created_at") as string;
            if (!dateStr) return <span className="text-muted-foreground">-</span>;
            return <span>{new Date(dateStr).toLocaleDateString()}</span>;
        },
    },
];
