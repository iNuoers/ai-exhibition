'use client'
'use no memo'

import type { ColumnDef } from '@tanstack/react-table'
import { Eye, MessageSquare, MoreHorizontal, UserRound } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'

import type { ConversationRow } from './schema'

export const conversationsColumns: ColumnDef<ConversationRow>[] = [
    {
        id: 'select',
        header: ({ table }) => (
            <Checkbox
                checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
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
        enableHiding: false
    },
    {
        accessorKey: 'id',
        header: 'Session ID',
        cell: ({ row }) => <span className="font-mono text-xs">#{row.getValue('id')}</span>
    },
    {
        accessorKey: 'user_nickname',
        header: 'Visitor',
        cell: ({ row }) => {
            return (
                <div className="flex items-center gap-2">
                    <UserRound className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">
                        {row.getValue('user_nickname') || `User ${row.original.user_id}`}
                    </span>
                </div>
            )
        }
    },
    {
        accessorKey: 'context',
        header: 'Context (Exhibition / Agent)',
        cell: ({ row }) => {
            return (
                <div className="flex flex-col">
                    <span className="font-medium text-sm">{row.original.exhibition_name || 'Unknown Exhibition'}</span>
                    <span className="text-muted-foreground text-xs">
                        via {row.original.agent_name || 'Unknown Agent'}
                    </span>
                </div>
            )
        }
    },
    {
        accessorKey: 'message_count',
        header: 'Messages',
        cell: ({ row }) => {
            return (
                <Badge variant="secondary" className="flex w-fit items-center gap-1">
                    <MessageSquare className="h-3 w-3" />
                    {row.original.message_count || 0}
                </Badge>
            )
        }
    },
    {
        accessorKey: 'created_at',
        header: 'Started',
        cell: ({ row }) => {
            const dateStr = row.getValue('created_at') as string
            if (!dateStr) return <span className="text-muted-foreground">-</span>
            return <span className="text-muted-foreground text-sm">{new Date(dateStr).toLocaleString()}</span>
        }
    },
    {
        id: 'actions',
        cell: ({ row }) => {
            const _session = row.original

            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4" /> View Thread
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        }
    }
]
