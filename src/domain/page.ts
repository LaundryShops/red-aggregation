import { Slice } from "./slice";

export interface Page<T> extends Slice<T> {
    /**
     * Returns the number of total pages.
     */
    getTotalPages(): number;

    /**
     * Returns the total amount of elements.
     */
    getTotalElements(): number;

    /**
     * Returns a new Page with the content of the current one mapped by the given converter function.
     */
    map<U>(converter: (item: T) => U): Page<U>;
}
