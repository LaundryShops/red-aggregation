export enum DiskUse {
	DEFAULT = 'DEFAULT',
	ALLOW = 'ALLOW',
	DENY = 'DENY',
}

export namespace DiskUse {
	export function of(value: boolean | null | undefined): DiskUse;
	export function of(value: string | null | undefined): DiskUse;
	export function of(value: boolean | string | null | undefined) {
		if (typeof value === 'boolean') {
			return value ? DiskUse.ALLOW : DiskUse.DENY;
		}

		if (typeof value !== 'string' || value.trim().length === 0) {
			return DiskUse.DEFAULT;
		}

		const normalized = value.trim().toLowerCase();

		if (normalized === 'true') {
			return DiskUse.ALLOW;
		}
		if (normalized === 'false') {
			return DiskUse.DENY;
		}

		const upper = normalized.toUpperCase() as keyof typeof DiskUse;
		if (upper in DiskUse) {
			return DiskUse[upper];
		}

		throw new Error(`No DiskUse constant matches '${value}'.`);
	}
}
