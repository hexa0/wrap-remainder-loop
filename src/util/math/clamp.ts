export function Clamp(number: number, min: number, max: number) {
	if (number > min) {
		if (number < max) {
			return number;
		} else {
			return max;
		}
	} else {
		return min
	}
}
