import type { Optional } from "../../utils/optional";
import type { List } from "./list";

/**
 * Các method chỉ có ý nghĩa khi entity dùng `@SoftDelete()`. Tách riêng khỏi các interface
 * repository "thường" (như `CrudRepository`) để không ghi đè/gộp lẫn vào đó — chỉ compose thêm
 * vào type nào thực sự cần (xem `SoftDeleteMongoRepository` trong `mongoRepository.ts`).
 */
export interface SoftDeleteRepository<T, ID> {
    /**
     * Khôi phục 1 entity đã soft-delete (set `deletedAt`/`deletedBy` về `null`).
     * Throw nếu entity không dùng `@SoftDelete()`.
     */
    restore(id: ID): Promise<void>;

    /**
     * Xóa vật lý theo id, bỏ qua soft delete hoàn toàn — dùng khi cần xóa thật một entity
     * đang dùng `@SoftDelete()`.
     */
    hardDeleteById(id: ID): Promise<void>;

    /**
     * Như {@link findAll} nhưng bỏ qua filter loại trừ soft-delete — trả về cả document đã xóa.
     */
    findAllIncludingSoftDeleted(): Promise<List<T>>;

    /**
     * Như {@link findById} nhưng bỏ qua filter loại trừ soft-delete — trả về cả document đã xóa.
     */
    findByIdIncludingSoftDeleted(id: ID): Promise<Optional<T>>;

    /**
     * View "thùng rác" — chỉ trả về document đã soft-delete. Throw nếu entity không dùng `@SoftDelete()`.
     */
    findAllSoftDeleted(): Promise<List<T>>;
}
