export function truncateText(text: string, charLimit: number = 70): string {
    if (text.length <= charLimit) {
        return text;
    }
    return text.slice(0, charLimit) + ' ...';
}
