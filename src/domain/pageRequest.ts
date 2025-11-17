import { AbstractPageRequest } from "./abstractPageRequest";
import { Sort } from "./sort";

export class PageRequest extends AbstractPageRequest {
    private constructor(
        page: number,
        size: number,
        private readonly sort: Sort = Sort.unsorted()
    ) {
        super(page, size);
    }

    /**
     * 
     * @param page - Current of page, page must be start with 0
     * @param size - Limit result, can be 10, 20, 30,...
     * @param sort - Optional, sort by field and direction
     * @returns PageRequest instance
     */
    static of(page: number, size: number, sort?: Sort): PageRequest {
        return new PageRequest(page, size, sort);
    }

    static ofSize(size: number): PageRequest {
        return new PageRequest(0, size);
    }

    getSort(): Sort {
        return this.sort;
    }

    next(): PageRequest {
        return new PageRequest(this.page + 1, this.size, this.sort);
    }

    previousOrFirst(): PageRequest {
        return this.page === 0 ? this : new PageRequest(this.page - 1, this.size, this.sort);
    }

    first(): PageRequest {
        return this.page === 0 ? this : new PageRequest(0, this.size, this.sort);
    }

    withPage(pageNumber: number): PageRequest {
        return new PageRequest(pageNumber, this.size, this.sort);
    }

    withSort(sort: Sort): PageRequest {
        return new PageRequest(this.page, this.size, sort);
    }
}
