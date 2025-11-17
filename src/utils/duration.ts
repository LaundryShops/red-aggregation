export interface DurationLike {
	seconds: number;
	nanos?: number;
}

export function toMillis(duration: DurationLike | number): number {
	if (typeof duration === 'number') {
		return duration;
	}

	const { seconds, nanos = 0 } = duration;
	return seconds * 1_000 + Math.floor(nanos / 1_000_000);
}
