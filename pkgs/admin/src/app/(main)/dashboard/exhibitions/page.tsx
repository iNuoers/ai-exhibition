'use client'

import { useEffect, useState } from 'react'

import { toast } from 'sonner'

import { ApiClient } from '@/lib/api-client'

import { ExhibitionsTable } from './_components/exhibitions-table'
import type { ExhibitionRow } from './_components/schema'

export default function ExhibitionsPage() {
    const [exhibitions, setExhibitions] = useState<ExhibitionRow[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchData() {
            try {
                const data = await ApiClient.get<any[]>('/exhibitions')
                if (Array.isArray(data)) {
                    setExhibitions(data)
                } else if (data && typeof data === 'object' && 'data' in data && Array.isArray((data as any).data)) {
                    setExhibitions((data as any).data)
                }
            } catch (error) {
                console.error('Failed to fetch exhibitions:', error)
                toast.error('Failed to load exhibitions')
            } finally {
                setLoading(false)
            }
        }

        void fetchData()
    }, [])

    return (
        <div className="flex flex-col gap-6 p-6">
            <div>
                <h1 className="font-bold text-3xl tracking-tight">Exhibitions</h1>
                <p className="text-muted-foreground">Manage exhibitions and crawling sources.</p>
            </div>
            {loading ? (
                <div className="flex items-center justify-center py-10">
                    <div className="h-8 w-8 animate-spin rounded-full border-primary border-b-2" />
                </div>
            ) : (
                <ExhibitionsTable data={exhibitions} />
            )}
        </div>
    )
}
