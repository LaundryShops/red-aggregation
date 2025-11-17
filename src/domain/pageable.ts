import { Optional } from "../utils/optional";
import { Sort } from "./sort";

export interface Pageable {
    isPaged(): boolean;
    isUnpaged(): boolean;
    getPageNumber(): number;
    getPageSize(): number;
    getOffset(): number;
    getSort(): Sort;
    next(): Pageable;
    previousOrFirst(): Pageable;
    first(): Pageable;
    withPage(pageNumber: number): Pageable;
    hasPrevious(): boolean;
    toOptional(): Optional<Pageable>;
}
