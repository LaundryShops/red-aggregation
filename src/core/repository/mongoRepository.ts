import type { KeysetPageable } from "../../domain/keysetPage/keysetPageable";
import type { PagedList } from "../../domain/keysetPage/pagedList";
import type { MongoCriteria } from "../mongo/mongoQuery";
import type { List } from "./list";
import type { ListPagingAndSortingRepository } from "./listPagingAndSortingRepository";
import type { SoftDeleteCrudRepository } from "./softDeleteCrudRepository";
import type { SoftDeleteRepository } from "./softDeleteRepository";

/**
 * Method xóa (`deleteById`/`delete`/`deleteAllById`/`deleteAll`) đến từ {@link SoftDeleteCrudRepository}
 * (overload thêm `deletedBy` so với {@link CrudRepository} gốc) — `MongoRepository` không tự khai
 * báo lại, chỉ thêm những gì thật sự riêng của Mongo (`insert`, `findAllByKeyset`).
 */
export type MongoRepository<T, ID> = ListPagingAndSortingRepository<T, ID> & SoftDeleteCrudRepository<T, ID> & {
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

/**
 * Các method chỉ có ý nghĩa khi entity dùng `@SoftDelete()` — tách riêng khỏi {@link MongoRepository}
 * (xem {@link SoftDeleteRepository}) để `getRepository()` (type thường) không "gợi ý" nhầm các
 * method này cho entity không dùng soft delete; chỉ lấy được qua
 * `RepositoryFactory.getSoftDeleteRepository()`.
 */
export type SoftDeleteMongoRepository<T, ID> = MongoRepository<T, ID> & SoftDeleteRepository<T, ID>;
