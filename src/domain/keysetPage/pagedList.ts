import { KeysetPage } from "./types";

export abstract class PagedList<T> extends Array<T> {
    constructor(data: T[]) {
        super(...data)
    }
    /**
     * Returns the actual size of this page.
     */
    abstract getSize(): number;

    /**
     * Returns the total size of the list or <code>-1</code> if the count query was disabled.
     *
     * @return The total size or <code>-1</code> if the count query was disabled
     */
    abstract getTotalSize(): number;

    /**
     * Returns the number of this page, numbered from 1.
     * 
     * @return The number of this page
     */
    abstract getPage(): number;

    /**
     * Returns the number of total pages.
     * 
     * @return The number of total pages
     */
    abstract getTotalPages(): number;

    /**
     * Returns the position of the first result, numbered from 0.
     * This is the position which was actually queried. This value might be different from {@link KeysetPage#getFirstResult()}.
     * 
     * If this list was queried with an entity id which does not exist, this will return <code>-1</code>;
     *
     * @return The position of the first result or <code>-1</code> if the queried entity id does not exist
     */
    abstract getFirstResult(): number;

    /**
     * Returns the maximum number of results.
     * This is the maximum number which was actually queried. This value might be different from
     * {@link KeysetPage#getFirstResult()}.
     *
     * @return The maximum number of results
     */
    abstract getMaxResults(): number;

    /**
     * Returns the key set page for this paged list which can be used for key set pagination.
     * The key set page may be null if key set pagination wasn't used.
     *
     * @return The key set
     */

    abstract getKeysetPage(): KeysetPage;
}
