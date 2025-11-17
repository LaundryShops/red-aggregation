import { Pageable } from "./pageable";
import { Sort } from "./sort";

export interface Slice<T> {
    /**
   * Returns the number of the current slice. Always non-negative.
   */
    getNumber(): number;

    /**
     * Returns the size of the slice.
     */
    getSize(): number;

    /**
     * Returns the number of elements currently on this slice.
     */
    getNumberOfElements(): number;

    /**
     * Returns the page content as an array.
     */
    getContent(): T[];

    /**
     * Returns whether the slice has any content.
     */
    hasContent(): boolean;

    /**
     * Returns the sorting parameters for the slice.
     */
    getSort(): Sort;

    /**
     * Returns whether the current slice is the first one.
     */
    isFirst(): boolean;

    /**
     * Returns whether the current slice is the last one.
     */
    isLast(): boolean;

    /**
     * Returns whether there is a next slice.
     */
    hasNext(): boolean;

    /**
     * Returns whether there is a previous slice.
     */
    hasPrevious(): boolean;

    /**
     * Returns the pageable used to request the current slice.
     */
    getPageable(): Pageable;

    /**
     * Returns the pageable to request the next slice.
     * Clients should check `hasNext()` before calling this method.
     */
    nextPageable(): Pageable | null;

    /**
     * Returns the pageable to request the previous slice.
     * Clients should check `hasPrevious()` before calling this method.
     */
    previousPageable(): Pageable | null;

    /**
     * Returns a new slice with the content of the current one mapped by the given converter.
     */
    map<U>(converter: (item: T) => U): Slice<U>;

    /**
     * Returns the pageable describing the next slice or the current slice if it's the last one.
     */
    nextOrLastPageable(): Pageable;

    /**
     * Returns the pageable describing the previous slice or the current slice if it's the first one.
     */
    previousOrFirstPageable(): Pageable;
}
