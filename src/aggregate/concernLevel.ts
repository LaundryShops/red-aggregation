import { Assert } from '../utils';

export enum ReadConcernLevel {
	LOCAL = 'local',
	MAJORITY = 'majority',
	LINEARIZABLE = 'linearizable',
	SNAPSHOT = 'snapshot',
	AVAILABLE = 'available',
}

export namespace ReadConcernLevel {
	export function getValue(level: ReadConcernLevel): string {
		return level;
	}

	export function fromString(readConcernLevel: string): ReadConcernLevel {
		Assert.notNull(readConcernLevel, 'readConcernLevel must not be null');

		const normalized = readConcernLevel.trim().toLowerCase();

		switch (normalized) {
			case ReadConcernLevel.LOCAL:
				return ReadConcernLevel.LOCAL;
			case ReadConcernLevel.MAJORITY:
				return ReadConcernLevel.MAJORITY;
			case ReadConcernLevel.LINEARIZABLE:
				return ReadConcernLevel.LINEARIZABLE;
			case ReadConcernLevel.SNAPSHOT:
				return ReadConcernLevel.SNAPSHOT;
			case ReadConcernLevel.AVAILABLE:
				return ReadConcernLevel.AVAILABLE;
			default:
				throw new Error(`'${readConcernLevel}' is not a valid readConcernLevel`);
		}
	}
}
