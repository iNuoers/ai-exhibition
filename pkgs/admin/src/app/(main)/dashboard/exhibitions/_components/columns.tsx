'use client'
'use no memo'

import type { ColumnDef } from '@tanstack/react-table'
import { Building2, Edit, MoreHorizontal, Trash } from 'lucide-react'

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

import type { ExhibitionRow } from './schema'

export const exhibitionsColumns: ColumnDef<ExhibitionRow>[] = [
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
        header: 'Exhibition',
        cell: ({ row }) => {
            return (
                <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded bg-muted text-muted-foreground">
                        <Building2 className="h-4 w-4" />
                    </div>
                    <div className="flex flex-col">
                        <span className="font-medium">{row.getValue('name')}</span>
                        {row.original.location && (
                            <span className="text-muted-foreground text-xs">{row.original.location}</span>
                        )}
                    </div>
                </div>
            )
        }
    },
    {
        accessorKey: 'date_range',
        header: 'Date',
        cell: ({ row }) => {
            const start = row.original.start_date
            const end = row.original.end_date

            if (!start && !end) return <span className="text-muted-foreground">-</span>

            const formatStr = (d: string) => new Date(d).toLocaleDateString()
            return (
                <div className="text-sm">
                    {start ? formatStr(start) : '...'} - {end ? formatStr(end) : '...'}
                </div>
            )
        }
    },
    {
        accessorKey: 'is_active',
        header: 'Status',
        cell: ({ row }) => {
            const isActive = row.getValue('is_active') as boolean
            return (
                <Badge
                    variant={isActive ? 'default' : 'secondary'}
                    className={isActive ? 'bg-green-600 hover:bg-green-700' : ''}
                >
                    {isActive ? 'Active' : 'Archived'}
                </Badge>
            )
        }
    },
    {
        id: 'actions',
        cell: ({ row }) => {
            const exhibition = row.original

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
                        <DropdownMenuItem
                            onClick={() => navigator.clipboard.writeText(exhibition.id?.toString() || '')}
                        >
                            Copy ID
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                            <Trash className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        }
    }
]
