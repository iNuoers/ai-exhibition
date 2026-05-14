const STORAGE_PREFIX = 'visitor_session_'

/**
 * 获取某个 agent 的 visitor session id
 */
export function getVisitorSessionId(shareToken: string): string | null {
  if (typeof window === 'undefined') return null
  try {
    return localStorage.getItem(`${STORAGE_PREFIX}${shareToken}`)
  } catch {
    return null
  }
}

/**
 * 保存 visitor session id
 */
export function setVisitorSessionId(shareToken: string, sessionId: string): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(`${STORAGE_PREFIX}${shareToken}`, sessionId)
  } catch {
    // localStorage 不可用时静默失败
  }
}
