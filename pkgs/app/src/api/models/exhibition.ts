/** 展会相关类型 — 对齐后端 app/schemas/agent.py */

export interface ExhibitionCreate {
    name: string
    start_date?: string
    end_date?: string
    venue?: string
    city?: string
    address?: string
    industry?: string
    ticket_type?: string
    cycle?: string
    visitor_count?: string
    exhibitor_count?: string
    exhibition_area?: string
    organizer?: string
    description?: string
    highlights?: string[]
    exhibit_scope?: Record<string, any>
    co_located_events?: string[]
    source_url?: string
}

export interface ExhibitionResponse {
    request_id: string
    id: number
    name: string
    start_date?: string
    end_date?: string
    venue?: string
    city?: string
    address?: string
    industry?: string
    ticket_type?: string
    cycle?: string
    visitor_count?: string
    exhibitor_count?: string
    exhibition_area?: string
    organizer?: string
    description?: string
    highlights?: string[]
    exhibit_scope?: Record<string, any>
    co_located_events?: string[]
    source_url?: string
    owner_id: number
}

export interface ExhibitionScrapeRequest {
    url: string
}
