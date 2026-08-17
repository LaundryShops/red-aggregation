import { AbstractPageRequest } from "../abstractPageRequest";
import { Pageable } from "../pageable";
import { Sort } from "../sort";
import { DefaultKeySetPage } from "./defaultKeySetPage";
import { decodeKeysetCursor } from "./keysetCursor";
import { KeysetDirection, KeysetPageable } from "./keysetPageable";
import { KeysetPage } from "./types";

export class KeysetPageRequest extends AbstractPageRequest implements KeysetPageable {
    private constructor(
        page: number,
        size: number,
        private readonly sort: Sort,
        private readonly keysetPage: KeysetPage | null,
        private readonly direction: KeysetDirection
    ) {
        super(page, size);
    }

    /**
     * First page — no anchor yet.
     */
    static of(size: number, sort: Sort): KeysetPageRequest {
        return new KeysetPageRequest(0, size, sort, null, 'NEXT');
    }

    /**
     * Builds the request for the page after `resultKeysetPage`, which must come from a previously
     * executed query's {@link KeysetPage} (e.g. `PagedList.getKeysetPage()`), not from the request itself.
     */
    static next(previous: KeysetPageable, resultKeysetPage: KeysetPage): KeysetPageRequest {
        return new KeysetPageRequest(previous.getPageNumber() + 1, previous.getPageSize(), previous.getSort(), resultKeysetPage, 'NEXT');
    }

    /**
     * Builds the request for the page before `resultKeysetPage`, which must come from a previously
     * executed query's {@link KeysetPage}.
     */
    static previous(previous: KeysetPageable, resultKeysetPage: KeysetPage): KeysetPageRequest {
        const page = Math.max(0, previous.getPageNumber() - 1);
        return new KeysetPageRequest(page, previous.getPageSize(), previous.getSort(), resultKeysetPage, 'PREVIOUS');
    }

    /**
     * Decodes an opaque cursor string into a single-point anchor and seeks forward from it.
     */
    static afterCursor(size: number, sort: Sort, cursor: string, page: number = 0): KeysetPageRequest {
        const anchor = decodeKeysetCursor(cursor);
        return new KeysetPageRequest(page, size, sort, new DefaultKeySetPage(page * size, size, anchor, anchor), 'NEXT');
    }

    /**
     * Decodes an opaque cursor string into a single-point anchor and seeks backward from it.
     */
    static beforeCursor(size: number, sort: Sort, cursor: string, page: number = 0): KeysetPageRequest {
        const anchor = decodeKeysetCursor(cursor);
        return new KeysetPageRequest(page, size, sort, new DefaultKeySetPage(page * size, size, anchor, anchor), 'PREVIOUS');
    }

    getSort(): Sort {
        return this.sort;
    }

    getKeysetPage(): KeysetPage | null {
        return this.keysetPage;
    }

    getDirection(): KeysetDirection {
        return this.direction;
    }

    next(): Pageable {
        return new KeysetPageRequest(this.page + 1, this.size, this.sort, this.keysetPage, this.direction);
    }

    previousOrFirst(): Pageable {
        return this.page === 0 ? this : new KeysetPageRequest(this.page - 1, this.size, this.sort, this.keysetPage, this.direction);
    }

    first(): Pageable {
        return this.page === 0 ? this : new KeysetPageRequest(0, this.size, this.sort, this.keysetPage, this.direction);
    }

    withPage(pageNumber: number): Pageable {
        return new KeysetPageRequest(pageNumber, this.size, this.sort, this.keysetPage, this.direction);
    }
}
