import type { Sort } from "../../domain/sort";
import type { Optional } from "../../utils/optional";

export interface CrudRepository<T, ID> {
    save<S extends T>(entity: S): Promise<S>;

    saveAll<S extends T>(entities: Iterable<S>): Promise<Iterable<S>>;

    findById(id: ID): Promise<Optional<T>>;

    existsById(id: ID): Promise<boolean>;

    /**
     * @param sort bỏ qua hoặc {@link Sort.unsorted} để không sort; không được {@code null}.
     */
    findAll(sort?: Sort): Promise<Iterable<T>>;

    findAllById(ids: Iterable<ID>): Promise<Iterable<T>>;

    count(): Promise<number>;

    deleteById(id: ID): Promise<void>;

    delete(entity: T): Promise<void>;

    deleteAllById(ids: Iterable<ID>): Promise<void>;

    deleteAll(entities: Iterable<T>): Promise<void>;

    deleteAll(): Promise<void>;
}
