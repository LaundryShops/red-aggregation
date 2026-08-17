import type { KeysetPageable } from "../../domain/keysetPage/keysetPageable";
import type { PagedList } from "../../domain/keysetPage/pagedList";
import type { MongoCriteria } from "../mongo/mongoQuery";
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

    /**
     * Phân trang bằng keyset (cursor): truy vấn tiến/lùi từ điểm mốc trong {@link KeysetPageable}
     * thay vì `skip`, kết hợp thêm điều kiện lọc `criteria`.
     */
    findAllByKeyset(criteria: MongoCriteria, keysetPageable: KeysetPageable): Promise<PagedList<T>>;
};
