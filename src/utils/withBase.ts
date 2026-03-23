export function withBase(path: string): string {
	const rawBase = import.meta.env.BASE_URL || '/';
	const normalizedBase = rawBase.endsWith('/') ? rawBase : `${rawBase}/`;
	const normalizedPath = path.replace(/^\/+/, '');
	return `${normalizedBase}${normalizedPath}`;
}
