import type { Document, Filter, UpdateFilter } from "mongodb";
import type { ClauseDefinition } from "../../query/standardDefinition";

/**
 * Điều kiện truy vấn CRUD: filter BSON chuẩn driver hoặc {@link ClauseDefinition} / {@link Clause}
 * (suy ra BSON qua {@link ClauseDefinition.getCriteriaObject}).
 */
export type MongoCriteria = Filter<Document> | ClauseDefinition;

/**
 * Cập nhật BSON (operators / pipeline document) — tương thích {@link UpdateFilter} driver.
 */
export type MongoUpdateDefinition = UpdateFilter<Document> | Document;
