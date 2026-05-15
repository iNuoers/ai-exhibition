'use client'
'use no memo'

import type { ColumnDef } from '@tanstack/react-table'
import { Bot, Edit, MessageSquareCode, MoreHorizontal } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Switch } from '@/components/ui/switch'

import type { AgentRow } from './schema'

export const agentsColumns: ColumnDef<AgentRow>[] = [
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
        accessorKey: 'name',
        header: 'Agent',
        cell: ({ row }) => {
            return (
                <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <Bot className="h-4 w-4" />
                    </div>
                    <div className="flex flex-col">
                        <span className="font-medium">{row.getValue('name')}</span>
                        {row.original.description && (
                            <span className="max-w-[200px] truncate text-muted-foreground text-xs">
                                {row.original.description}
                            </span>
                        )}
                    </div>
                </div>
            )
        }
    },
    {
        accessorKey: 'llm_model',
        header: 'Model',
        cell: ({ row }) => {
            return (
                <Badge variant="outline" className="font-mono text-xs">
                    {row.original.llm_provider}/{row.original.llm_model}
                </Badge>
            )
        }
    },
    {
        accessorKey: 'is_published',
        header: 'Published',
        cell: ({ row }) => {
            const isPublished = row.getValue('is_published') as boolean
            return (
                <Switch
                    checked={isPublished}
                    onCheckedChange={(checked) => {
                        console.log(`Toggle publish for agent ${row.original.id} to ${checked}`)
                    }}
                    aria-label="Toggle published state"
                />
            )
        }
    },
    {
        id: 'actions',
        cell: ({ row }) => {
            const _agent = row.original

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
                            <MessageSquareCode className="mr-2 h-4 w-4" /> Test Chat
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" /> Configuration
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        }
    }
]
