import "reflect-metadata";
import { Document } from "../../../core/mapping/document";
import {
    applySoftDeleteToIndexes,
    getSoftDeleteMetadata,
    SoftDelete,
    SOFT_DELETE_DELETED_AT_FIELD,
    SOFT_DELETE_DELETED_BY_FIELD,
} from "../../../core/mapping/softDelete";

describe("@SoftDelete mapping", () => {
    it("exports the fixed field-name constants", () => {
        expect(SOFT_DELETE_DELETED_AT_FIELD).toBe("deleted_at");
        expect(SOFT_DELETE_DELETED_BY_FIELD).toBe("deleted_by");
    });

    it("records deletedAtField/deletedByField metadata when applied", () => {
        @SoftDelete()
        class User {}

        expect(getSoftDeleteMetadata(User)).toEqual({
            deletedAtField: "deleted_at",
            deletedByField: "deleted_by",
        });
    });

    it("returns null for a class without @SoftDelete()", () => {
        class Plain {}

        expect(getSoftDeleteMetadata(Plain)).toBeNull();
    });

    it("works stacked with @Document(), decorator order independent (SoftDelete then Document)", () => {
        @Document({ collection: "users" })
        @SoftDelete()
        class UserA {}

        expect(getSoftDeleteMetadata(UserA)).toEqual({
            deletedAtField: "deleted_at",
            deletedByField: "deleted_by",
        });
    });

    it("works stacked with @Document(), decorator order independent (Document then SoftDelete)", () => {
        @SoftDelete()
        @Document({ collection: "users" })
        class UserB {}

        expect(getSoftDeleteMetadata(UserB)).toEqual({
            deletedAtField: "deleted_at",
            deletedByField: "deleted_by",
        });
    });
});

describe("applySoftDeleteToIndexes", () => {
    const softDelete = { deletedAtField: "deleted_at", deletedByField: "deleted_by" };

    it("injects partialFilterExpression into a unique index that doesn't have one", () => {
        const result = applySoftDeleteToIndexes([{ key: { email: 1 }, unique: true }], softDelete);

        expect(result).toEqual([
            { key: { email: 1 }, unique: true, partialFilterExpression: { deleted_at: null } },
        ]);
    });

    it("leaves a unique index with its own partialFilterExpression untouched (opt-out)", () => {
        const original = [
            { key: { email: 1 }, unique: true, partialFilterExpression: { status: "active" } },
        ];

        const result = applySoftDeleteToIndexes(original, softDelete);

        expect(result).toEqual(original);
    });

    it("leaves a non-unique index untouched", () => {
        const original = [{ key: { createdAt: 1 } }];

        const result = applySoftDeleteToIndexes(original, softDelete);

        expect(result).toEqual(original);
    });

    it("returns the input array unchanged when softDelete is null", () => {
        const original = [{ key: { email: 1 }, unique: true }];

        const result = applySoftDeleteToIndexes(original, null);

        expect(result).toEqual(original);
    });
});
