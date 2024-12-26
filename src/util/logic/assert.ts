export function assert(condition: unknown, errorMessage?: string | Error): asserts condition {
	if (!condition) {
		throw errorMessage
	}
};