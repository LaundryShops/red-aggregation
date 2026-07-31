import type { CollationOptions } from "mongodb";
import type { PersistentEntity } from "./persistentEntity";
import { MongoPersistentProperty } from "./mongoPersistentRepository";

export interface MongoPersistentEntity<T> extends PersistentEntity<T, MongoPersistentProperty> {
    getCollection(): string;

    getCollation(): CollationOptions | null;

    /** `@Document({ stripUnknownFields: true })` đã bật chưa (mặc định `false`). */
    shouldStripUnknownFields(): boolean;

    /** Id property (nếu có) hợp với mọi field có type decorator (`@String`/`@Number`/...), đã dedupe. */
    getKnownFieldNames(): string[];

    /**
     * Điền default cho field đang `undefined` (field `null` được coi là giá trị cố ý, không bị ghi đè).
     * Mutate `doc` tại chỗ.
     */
    applyDefaults(doc: Record<string, unknown>): void;

    /** Trả về danh sách message lỗi (rỗng = hợp lệ) — không tự throw. */
    validateForWrite(doc: Record<string, unknown>): string[];

    /**
     * Trả về bản sao của `doc` chỉ gồm field thuộc whitelist khi {@link shouldStripUnknownFields} là `true`;
     * ngược lại trả về bản sao y nguyên (không loại field nào).
     */
    stripUnknownFields(doc: Record<string, unknown>): Record<string, unknown>;
}
