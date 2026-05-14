export interface Pagination {
    current: number;
    page_size: number;
    total: number;
    has_next: boolean;
    next_page_token?: string;
}

export interface PageData<T> {
    list: T[];
    pagination: Pagination;
}
