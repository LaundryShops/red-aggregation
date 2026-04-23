import type { List } from "./list";
import type { ListPagingAndSortingRepository } from "./listPagingAndSortingRepository";

export type MongoRepository<T, ID> = ListPagingAndSortingRepository<T, ID> & {
    /**
     * Chèn entity mới (tối ưu insert). Dùng {@link save} nếu muốn API insert store.
     */
    insert<S extends T>(entity: S): Promise<S>;

    /**
     * Chèn nhiều entity mới. Dùng {@link saveAll} nếu muốn API insert store.
     */
    insert<S extends T>(entities: Iterable<S>): Promise<List<S>>;
};
