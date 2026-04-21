import type { CollationOptions } from "mongodb";
import type { PersistentEntity } from "./persistentEntity";
import { MongoPersistentProperty } from "./mongoPersistentRepository";

export interface MongoPersistentEntity<T> extends PersistentEntity<T, MongoPersistentProperty> {
    getCollection(): string;

    getCollation(): CollationOptions | null;
}
