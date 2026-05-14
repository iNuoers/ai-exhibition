/** 展会相关 React Query Hooks */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { exhibitionApi } from '../endpoints/exhibition'
import { queryKeys } from '../core/query-keys'
import type { ExhibitionCreate, ExhibitionScrapeRequest } from '../models/exhibition'

/** 获取展会列表 */
export function useExhibitions() {
    return useQuery({
        queryKey: queryKeys.exhibitions.list(),
        queryFn: () => exhibitionApi.list(),
    })
}

/** 获取展会详情 */
export function useExhibition(id: number) {
    return useQuery({
        queryKey: queryKeys.exhibitions.detail(id),
        queryFn: () => exhibitionApi.get(id),
        enabled: id > 0,
    })
}

/** 爬取展会 */
export function useScrapeExhibition() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (data: ExhibitionScrapeRequest) => exhibitionApi.scrape(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.exhibitions.all })
        },
    })
}

/** 手动创建展会 */
export function useCreateExhibition() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (data: ExhibitionCreate) => exhibitionApi.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.exhibitions.all })
        },
    })
}

/** 删除展会 */
export function useDeleteExhibition() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (id: number) => exhibitionApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.exhibitions.all })
        },
    })
}
