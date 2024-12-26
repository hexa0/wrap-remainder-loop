export function lastIndexOf(string: string, search: string, position?: number): number | null {
	const index = string.lastIndexOf(search, position)
	if (index !== -1) {
		return index
	}
	else {
		return null
	}
}