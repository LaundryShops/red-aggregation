import type { IndexDescription } from 'mongodb';

export const SOFT_DELETE_METADATA = Symbol.for('mongodb.softDelete');

/**
 * Tên field cố định cho v1 — không cấu hình được (xem tasks/plan.md → Open Questions
 * nếu cần thêm `@SoftDelete({ deletedAtField, deletedByField })` sau này).
 */
export const SOFT_DELETE_DELETED_AT_FIELD = 'deleted_at';
export const SOFT_DELETE_DELETED_BY_FIELD = 'deleted_by';

export interface SoftDeleteMetadata {
  deletedAtField: string;
  deletedByField: string;
}

/**
 * Class decorator — đánh dấu entity dùng soft delete.
 *
 * Dùng cùng `@Document()`, thứ tự áp dụng không quan trọng:
 * ```ts
 * @Document({ collection: 'users' })
 * @SoftDelete()
 * class User {}
 * ```
 */
export function SoftDelete(): ClassDecorator {
  return (target: object) => {
    const meta: SoftDeleteMetadata = {
      deletedAtField: SOFT_DELETE_DELETED_AT_FIELD,
      deletedByField: SOFT_DELETE_DELETED_BY_FIELD,
    };
    Reflect.defineMetadata(SOFT_DELETE_METADATA, meta, target);
  };
}

export function getSoftDeleteMetadata(
  ctor: abstract new (...args: never[]) => unknown,
): SoftDeleteMetadata | null {
  if (typeof Reflect !== 'undefined' && Reflect.getMetadata) {
    return (Reflect.getMetadata(SOFT_DELETE_METADATA, ctor) as SoftDeleteMetadata | undefined) ?? null;
  }
  return (ctor as unknown as Record<symbol, SoftDeleteMetadata>)[SOFT_DELETE_METADATA] ?? null;
}

/**
 * Với mỗi index `unique: true` chưa tự khai báo `partialFilterExpression`, tự thêm
 * `{ [deletedAtField]: null }` — để unique index không tính các document đã soft-delete.
 * Index đã có `partialFilterExpression` riêng thì giữ nguyên (opt-out); index không unique
 * cũng giữ nguyên. `softDelete === null` (entity không dùng soft delete) trả về nguyên `indexes`.
 */
export function applySoftDeleteToIndexes(
  indexes: IndexDescription[],
  softDelete: SoftDeleteMetadata | null,
): IndexDescription[] {
  if (softDelete == null) {
    return indexes;
  }
  return indexes.map((index) => {
    if (!index.unique || index.partialFilterExpression !== undefined) {
      return index;
    }
    return { ...index, partialFilterExpression: { [softDelete.deletedAtField]: null } };
  });
}
