import { PagedList } from './pagedList';
import { KeysetPage } from './types';

export class KeysetArrayList<T> extends PagedList<T> {
	private readonly keyset: KeysetPage;
	private readonly totalSize: number;
	private readonly page: number;
	private readonly totalPages: number;
	private readonly firstResult: number;
	private readonly maxResults: number;

	constructor(data: T[], keyset: KeysetPage, totalSize: number, firstResult: number, maxResults: number) {
		super(data);
		this.keyset = keyset;
		this.totalSize = totalSize;
		this.page = Math.floor((firstResult === -1 ? 0 : firstResult) / maxResults) + 1;
		this.totalPages = totalSize < 1 ? 0 : Math.ceil(totalSize / maxResults);
		this.firstResult = firstResult;
		this.maxResults = maxResults;
	}

	getSize(): number {
		return this.length;
	}

	getTotalSize(): number {
		return this.totalSize;
	}

	getPage(): number {
		return this.page;
	}

	getTotalPages(): number {
		return this.totalPages;
	}

	getFirstResult(): number {
		return this.firstResult;
	}

	getMaxResults(): number {
		return this.maxResults;
	}

	getKeysetPage(): KeysetPage {
		return this.keyset;
	}
}
