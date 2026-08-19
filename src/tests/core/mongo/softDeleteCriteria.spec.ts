import { excludeSoftDeleted, onlyDeleted, softDeleteMatchStage } from "../../../core/mongo/softDeleteCriteria";

function metadata(enabled: boolean) {
    return {
        isSoftDeleteEnabled: () => enabled,
        getDeletedAtAttribute: () => (enabled ? "deleted_at" : null),
    };
}

describe("excludeSoftDeleted", () => {
    it("merges in a { deleted_at: null } exclusion when soft delete is enabled", () => {
        expect(excludeSoftDeleted({}, metadata(true))).toEqual({ $and: [{}, { deleted_at: null }] });
    });

    it("returns the filter unchanged when soft delete is disabled", () => {
        expect(excludeSoftDeleted({}, metadata(false))).toEqual({});
    });

    it("preserves an existing filter alongside the exclusion", () => {
        expect(excludeSoftDeleted({ name: "Alice" }, metadata(true))).toEqual({
            $and: [{ name: "Alice" }, { deleted_at: null }],
        });
    });
});

describe("onlyDeleted", () => {
    it("merges in a { deleted_at: { $ne: null } } filter when soft delete is enabled", () => {
        expect(onlyDeleted({}, metadata(true))).toEqual({ $and: [{}, { deleted_at: { $ne: null } }] });
    });

    it("returns the filter unchanged when soft delete is disabled", () => {
        expect(onlyDeleted({}, metadata(false))).toEqual({});
    });
});

describe("softDeleteMatchStage", () => {
    it("returns a $match stage excluding soft-deleted docs when enabled", () => {
        expect(softDeleteMatchStage(metadata(true))).toEqual({ $match: { deleted_at: null } });
    });

    it("returns null when soft delete is disabled", () => {
        expect(softDeleteMatchStage(metadata(false))).toBeNull();
    });
});
