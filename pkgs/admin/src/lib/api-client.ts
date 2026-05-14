import { getLocalStorageValue } from "./local-storage.client";

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

interface RequestOptions extends RequestInit {
    params?: Record<string, string | number | boolean | undefined>;
}

export const ApiClient = {
    async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
        const { params, headers, ...restOptions } = options;

        const url = new URL(`${API_BASE_URL}${endpoint}`);
        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined) {
                    url.searchParams.append(key, String(value));
                }
            });
        }

        const defaultHeaders: Record<string, string> = {
            "Content-Type": "application/json",
        };

        // Use the provided local-storage.client.ts utility
        const token = getLocalStorageValue("token") || getLocalStorageValue("access_token");
        if (token) {
            defaultHeaders.Authorization = `Bearer ${token}`;
        }

        try {
            const response = await fetch(url.toString(), {
                headers: { ...defaultHeaders, ...headers },
                ...restOptions,
            });

            if (!response.ok) {
                let errorData: unknown;
                try {
                    errorData = await response.json();
                } catch {
                    errorData = { detail: response.statusText };
                }

                const errorMessage =
                    typeof errorData === "object" && errorData !== null && "detail" in errorData
                        ? String((errorData as { detail: unknown }).detail)
                        : `API Request failed with status ${response.status}`;

                throw new Error(errorMessage);
            }

            const text = await response.text();
            return text ? JSON.parse(text) : ({} as T);
        } catch (error) {
            console.error(`[API Error] ${endpoint}:`, error);
            throw error;
        }
    },

    get<T>(endpoint: string, options?: RequestOptions) {
        return this.request<T>(endpoint, { ...options, method: "GET" });
    },

    post<T>(endpoint: string, data?: unknown, options?: RequestOptions) {
        return this.request<T>(endpoint, {
            ...options,
            method: "POST",
            body: JSON.stringify(data),
        });
    },

    put<T>(endpoint: string, data?: unknown, options?: RequestOptions) {
        return this.request<T>(endpoint, {
            ...options,
            method: "PUT",
            body: JSON.stringify(data),
        });
    },

    delete<T>(endpoint: string, options?: RequestOptions) {
        return this.request<T>(endpoint, { ...options, method: "DELETE" });
    },
};
