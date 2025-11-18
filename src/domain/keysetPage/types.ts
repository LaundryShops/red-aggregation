export type Serializable = Array<string | number>;

export interface Keyset {
    getTuple(): Array<string | number>;
    hashCode(): number;
}

export interface KeysetPage {

    /**
     * Returns the position of the first result, numbered from 0.
     * This is the position of the first element of this key set.
     *
     * @return The position of the first result
     */
    getFirstResult(): number;

    /**
     * Returns the maximum number of results.
     * This is the maximum number of results of this key set.
     *
     * @return The maximum number of results
     */
    getMaxResults(): number;

    /**
     * Returns the key set for the lowest entry of the corresponding {@link PagedList}.
     *
     * @return The key set for the lowest entry
     */
    getLowest(): Keyset;

    /**
     * Returns the key set for the highest entry of the corresponding {@link PagedList}.
     *
     * @return The key set for the highest entry
     */
    getHighest(): Keyset;

    /**
     * Returns the key set list of the corresponding {@link PagedList}.
     *
     * @return The key set list
     */
    getKeysets(): Keyset[];
}
