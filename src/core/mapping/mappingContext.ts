import type { EntityClass } from "../support/entityMetadata";
import type { MongoPersistentEntity } from "../support/mongoPersistentEntity";
import { getDocumentMetadata, defaultCollectionName } from "./document";
import { BasicMongoPersistentEntity } from "./basicMongoPersistentEntity";

/**
 * Build + cache MongoPersistentEntity theo entity class.
 * Mode đơn giản: id = "_id", không version/collation.
 */
export class MappingContext {
  private readonly entities = new Map<Function, MongoPersistentEntity<unknown>>();

  getPersistentEntity<T>(type: EntityClass<T>): MongoPersistentEntity<T> {
    const cached = this.entities.get(type);
    if (cached) {
      return cached as MongoPersistentEntity<T>;
    }

    const meta = getDocumentMetadata(type as unknown as abstract new (...args: never[]) => unknown);
    const collection = meta?.collection || defaultCollectionName(type.name);

    // Mode đơn giản: chưa parse collation string -> để null
    const entity = new BasicMongoPersistentEntity<T>(type, collection, { collation: null });

    this.entities.set(type, entity as MongoPersistentEntity<unknown>);
    return entity;
  }

  hasPersistentEntity<T>(type: EntityClass<T>): boolean {
    return this.entities.has(type);
  }

  clear(): void {
    this.entities.clear();
  }
}
