/** 展会相关 API */
import { http } from '~/services/request'
import type {
    ExhibitionCreate,
    ExhibitionResponse,
    ExhibitionScrapeRequest,
} from '../models/exhibition'

const PREFIX = '/api/v1/exhibitions'

export const exhibitionApi = {
    /** 爬取展会信息 */
    scrape: (data: ExhibitionScrapeRequest) =>
        http.post<ExhibitionResponse>(`${PREFIX}/scrape`, data),

    /** 手动创建展会 */
    create: (data: ExhibitionCreate) =>
        http.post<ExhibitionResponse>(PREFIX, data),

    /** 列出当前用户的展会 */
    list: () =>
        http.get<ExhibitionResponse[]>(PREFIX),

    /** 获取展会详情 */
    get: (id: number) =>
        http.get<ExhibitionResponse>(`${PREFIX}/${id}`),

    /** 删除展会 */
    delete: (id: number) =>
        http.delete<{ message: string }>(`${PREFIX}/${id}`),
}
