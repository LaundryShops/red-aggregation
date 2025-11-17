
import { Optional } from "../utils/optional";
import { Pageable } from "./pageable";
import { Sort } from "./sort";

export abstract class AbstractPageRequest implements Pageable {
    constructor(
        protected readonly page: number,
        protected readonly size: number
    ) {
        if (page < 0) {
            throw new Error("Page index must not be less than zero");
        }
        if (size < 1) {
            throw new Error("Page size must not be less than one");
        }
    }

    toOptional(): Optional<Pageable> {
        const optional = new Optional(this);
        return this.isUnpaged() ? Optional.empty<this>() : optional;
    }

    getPageNumber(): number {
        return this.page;
    }

    getPageSize(): number {
        return this.size;
    }

    getOffset(): number {
        return this.page * this.size;
    }

    hasPrevious(): boolean {
        return this.page > 0;
    }

    abstract getSort(): Sort;
    abstract next(): Pageable;
    abstract previousOrFirst(): Pageable;
    abstract first(): Pageable;
    abstract withPage(pageNumber: number): Pageable;

    isPaged(): boolean {
        return true;
    }

    isUnpaged(): boolean {
        return !this.isPaged();
    }
}