import { Page } from "./page";
import { Pageable } from "./pageable";
import { Sort } from "./sort";

export class PageImpl<T> implements Page<T> {
    private readonly total: number;

    /**
     * Constructor of PageImpl.
     * @param content the content of this page, must not be null.
     * @param pageable the paging information, must not be null.
     * @param total the total amount of items available. The total might be adapted considering the length of the content
     *        given, if it is going to be the content of the last page. This is in place to mitigate inconsistencies.
     */
    constructor(
        private readonly content: T[],
        private readonly pageable: Pageable,
        total?: number
    ) {
        if (total === undefined) {
            this.total = content ? content.length : 0;
        } else {
            this.total = pageable.toOptional()
                .filter(it => content.length > 0)
                .filter(it => it.getOffset() + it.getPageSize() > total)
                .map(it => it.getOffset() + content.length)
                .orElse(total);
        }
    }

    map<U>(converter: (item: T) => U): Page<U> {
        const mappedContent = this.getContent().map(converter);
        return new PageImpl<U>(
            mappedContent,
            this.getPageable(),
            this.total
        );
    }

    getNumber(): number {
    return this.pageable.getPageNumber();
    }

    getSize(): number {
        return this.pageable.getPageSize();
    }

    getNumberOfElements(): number {
        return this.content.length;
    }

    getContent(): T[] {
        return this.content;
    }

    hasContent(): boolean {
        return this.content.length > 0;
    }

    getSort(): Sort {
        return this.pageable.getSort();
    }
    
    isFirst(): boolean {
        return this.pageable.getPageNumber() === 0;
    }

    hasPrevious(): boolean {
        return this.pageable.getPageNumber() > 0;
    }

    getPageable(): Pageable {
        return this.pageable;
    }

    nextPageable(): Pageable | null {
        if (this.hasNext()) {
            return this.pageable.next();
        }
        return null;
    }

    previousPageable(): Pageable | null {
        if (this.pageable.hasPrevious()) {
            return this.pageable.previousOrFirst();
        }
        return null;
    }

    nextOrLastPageable(): Pageable {
        return this.hasNext() ? this.pageable.next() : this.pageable;
    }

    previousOrFirstPageable(): Pageable {
        return this.hasPrevious() ? this.pageable.previousOrFirst() : this.pageable;
    }

    /**
     * Creates a new PageImpl with the given content. This will result in the created Page being identical
     * to the entire List.
     * @param content must not be null.
     */
    // static of<T>(content: T[]): PageImpl<T> {
    //     return new PageImpl<T>(content, Pageable.unpaged(), content ? content.length : 0);
    // }

    getTotalPages(): number {
        return this.getSize() === 0 ? 1 : Math.ceil(this.total / this.getSize());
    }

    getTotalElements(): number {
        return this.total;
    }

    hasNext(): boolean {
        return this.getNumber() + 1 < this.getTotalPages();
    }

    isLast(): boolean {
        return !this.hasNext();
    }
}
