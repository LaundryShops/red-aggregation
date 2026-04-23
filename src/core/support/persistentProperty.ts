import { EntityClass } from "./entityMetadata";

/**
 * Thuộc tính được map (tối thiểu: kiểu runtime cho property, ví dụ id).
 */
export interface PersistentProperty<P = unknown> {
    getType(): EntityClass<P>;
}
