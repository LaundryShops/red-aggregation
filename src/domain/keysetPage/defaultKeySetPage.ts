import { DefaultKeyset } from './defaultKeySet';
import { Keyset, Serializable } from './types';

export class DefaultKeySetPage {
	private readonly firstResult!: number;
	private readonly maxResults!: number;
	private readonly lowest!: Keyset;
	private readonly highest!: Keyset;
	private readonly keysets!: Keyset[];

	constructor(firstResult: number, maxResults: number, lowest: Serializable, highest: Serializable, keysets: Serializable[]);
	/**
	 * Creates a new {@link KeysetPage}.
	 *
	 * @param firstResult The first result
	 * @param maxResults The max results
	 * @param lowest The lowest keyset
	 * @param highest The highest keyset
	 */
	constructor(firstResult: number, maxResults: number, lowest: Keyset, highest: Keyset);
	/**
	 * Creates a new {@link KeysetPage}.
	 *
	 * @param firstResult The first result
	 * @param maxResults The max results
	 * @param lowest The lowest keyset
	 * @param highest The highest keyset
	 * @param keysets All extracted keysets
	 */
	constructor(firstResult: number, maxResults: number, lowest: Keyset, highest: Keyset, keysets: Keyset[]);
	constructor(firstResult: number, maxResults: number, lowest: Keyset | Serializable, highest: Keyset | Serializable, keysets?: Keyset[] | Serializable[]) {
		if (!Array.isArray(keysets) && lowest instanceof DefaultKeyset && highest instanceof DefaultKeyset) {
			return new DefaultKeySetPage(firstResult, maxResults, lowest, highest, [lowest, highest]);
		}

		if (Array.isArray(keysets) && Array.isArray(lowest) && Array.isArray(highest)) {
			return new DefaultKeySetPage(
				firstResult,
				maxResults,
				new DefaultKeyset(lowest),
				new DefaultKeyset(highest),
				DefaultKeySetPage.keysets(keysets as Serializable[])
			);
		}

		this.firstResult = firstResult;
		this.maxResults = maxResults;
		this.lowest = lowest as Keyset;
		this.highest = highest as Keyset;
		this.keysets = keysets as Keyset[];
	}

	private static keysets(keysets: Serializable[]): Keyset[] {
		if (keysets == null || keysets.length == 0) {
			return [];
		}
		const list: Keyset[] = [];
		for (const keyset of keysets) {
			list.push(new DefaultKeyset(keyset));
		}

		return list;
	}

	getFirstResult(): number {
		return this.firstResult;
	}

	getMaxResults(): number {
		return this.maxResults;
	}

	getLowest(): Keyset {
		return this.lowest;
	}

	getHighest(): Keyset {
		return this.highest;
	}

	getKeysets(): Keyset[] {
		return this.keysets;
	}
}
