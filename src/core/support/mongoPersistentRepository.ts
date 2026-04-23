import { PersistentProperty } from "./persistentProperty";

export interface MongoPersistentProperty<P = unknown> extends PersistentProperty<P> {
    getName(): string;
}
