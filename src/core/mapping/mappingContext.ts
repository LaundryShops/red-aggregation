import type { EntityClass } from "../support/entityMetadata";
import type { MongoPersistentEntity } from "../support/mongoPersistentEntity";
import { getDocumentMetadata, defaultCollectionName } from "./document";
import { BasicMongoPersistentEntity } from "./basicMongoPersistentEntity";
import { buildIdProperty } from "./id";

/**
 * Build + cache MongoPersistentEntity theo entity class.
 * Tự đọc `@Document` cho collection và `@Id` cho id property.
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
    const idProperty = buildIdProperty(type as unknown as Function);

    // Mode đơn giản: chưa parse collation string -> để null
    const entity = new BasicMongoPersistentEntity<T>(type, collection, {
      collation: null,
      idProperty,
    });

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
