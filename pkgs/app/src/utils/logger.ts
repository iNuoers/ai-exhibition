export function loggerLog(...args: Parameters<typeof console.log>) {
    // eslint-disable-next-line no-console
    console.log('[logger]', ...args);
}

export function loggerDebug(...args: Parameters<typeof console.debug>) {
    // eslint-disable-next-line no-console
    console.debug('[logger]', ...args);
}
