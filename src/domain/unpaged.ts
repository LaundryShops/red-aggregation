import { Optional } from "../utils/optional";
import { Pageable } from "./pageable";
import { Sort } from "./sort";

export class Unpaged implements Pageable {
    private static readonly UNSORTED: Pageable = new Unpaged(Sort.unsorted());

    constructor(private readonly sort: Sort) {}

    toOptional(): Optional<Pageable> {
        const optional = new Optional(this);
        return this.isUnpaged() ? Optional.empty<this>() : optional;
    }

    isUnpaged(): boolean {
        return !this.isPaged();
    }

    static sorted(sort: Sort): Pageable {
        return sort.isSorted() ? new Unpaged(sort) : Unpaged.UNSORTED;
    }

    isPaged(): boolean {
        return false;
    }

    previousOrFirst(): Pageable {
        return this;
    }

    next(): Pageable {
        return this;
    }

    hasPrevious(): boolean {
        return false;
    }

    getSort(): Sort {
        return this.sort;
    }

    getPageSize(): number {
        throw new Error("UnsupportedOperationException");
    }

    getPageNumber(): number {
        throw new Error("UnsupportedOperationException");
    }

    getOffset(): number {
        throw new Error("UnsupportedOperationException");
    }

    first(): Pageable {
        return this;
    }

    withPage(pageNumber: number): Pageable {
        if (pageNumber === 0) {
            return this;
        }

        throw new Error("UnsupportedOperationException");
    }
}
