import type { CrudRepository } from "./crudRepository";

export interface PagingAndSortingRepository<T, ID> extends CrudRepository<T, ID> {}
