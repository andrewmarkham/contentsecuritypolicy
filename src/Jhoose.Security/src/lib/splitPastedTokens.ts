export function splitPastedTokens(text: string): string[] {
    return text
        .split(/[\s,]+/)
        .map((token) => token.trim())
        .filter((token) => token.length > 0);
}
