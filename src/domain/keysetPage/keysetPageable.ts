import { Pageable } from "../pageable";
import { KeysetPage } from "./types";

export type KeysetDirection = 'NEXT' | 'PREVIOUS';

export interface KeysetPageable extends Pageable {
    /**
     * Returns the keyset page anchor to seek from, or {@code null} for the first page.
     */
    getKeysetPage(): KeysetPage | null;

    /**
     * Returns the direction in which this page seeks relative to its anchor.
     */
    getDirection(): KeysetDirection;
}
