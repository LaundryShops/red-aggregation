import type { Document, Filter } from "mongodb";

export interface SoftDeleteAware {
    isSoftDeleteEnabled(): boolean;
    getDeletedAtAttribute(): string | null;
}

export function excludeSoftDeleted(filter: Filter<Document>, metadata: SoftDeleteAware): Filter<Document> {
    if (!metadata.isSoftDeleteEnabled()) {
        return filter;
    }
    return { $and: [filter, { [metadata.getDeletedAtAttribute() as string]: null }] };
}

export function onlyDeleted(filter: Filter<Document>, metadata: SoftDeleteAware): Filter<Document> {
    if (!metadata.isSoftDeleteEnabled()) {
        return filter;
    }
    return { $and: [filter, { [metadata.getDeletedAtAttribute() as string]: { $ne: null } }] };
}

export function softDeleteMatchStage(metadata: SoftDeleteAware): Document | null {
    if (!metadata.isSoftDeleteEnabled()) {
        return null;
    }
    return { $match: { [metadata.getDeletedAtAttribute() as string]: null } };
}
