import type { CrudRepository } from "./crudRepository";

/**
 * Overload các method xóa của {@link CrudRepository} để nhận thêm `deletedBy` (tùy chọn) —
 * dùng cho soft delete khi entity dùng `@SoftDelete()`. `deletedBy` không có tác dụng nếu
 * entity không dùng soft delete — vẫn xóa vật lý như `CrudRepository` gốc.
 *
 * Tách riêng khỏi `CrudRepository` để `MongoRepository` (`mongoRepository.ts`) không phải tự
 * khai báo lại các method xóa này.
 */
export interface SoftDeleteCrudRepository<T, ID> extends CrudRepository<T, ID> {
    deleteById(id: ID): Promise<void>;
    deleteById(id: ID, deletedBy: unknown): Promise<void>;

    delete(entity: T): Promise<void>;
    delete(entity: T, deletedBy: unknown): Promise<void>;

    deleteAllById(ids: Iterable<ID>): Promise<void>;
    deleteAllById(ids: Iterable<ID>, deletedBy: unknown): Promise<void>;

    deleteAll(entities: Iterable<T>): Promise<void>;
    deleteAll(entities: Iterable<T>, deletedBy: unknown): Promise<void>;
    deleteAll(entities: undefined, deletedBy: unknown): Promise<void>;
    deleteAll(): Promise<void>;
}
