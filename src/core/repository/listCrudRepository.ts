import type { Page } from "../../domain/page";
import type { Pageable } from "../../domain/pageable";
import type { Sort } from "../../domain/sort";
import type { CrudRepository } from "./crudRepository";
import type { List } from "./list";

export interface ListCrudRepository<T, ID> extends CrudRepository<T, ID> {
    saveAll<S extends T>(entities: Iterable<S>): Promise<List<S>>;

    findAll(): Promise<List<T>>;

    findAll(sort: Sort): Promise<List<T>>;

    /**
     * @param pageable không được {@code null} — kiểu từ {@code src/domain/pageable}.
     */
    findAll(pageable: Pageable): Promise<Page<T>>;

    findAllById(ids: Iterable<ID>): Promise<List<T>>;
}
