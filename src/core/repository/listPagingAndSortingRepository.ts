import type { ListCrudRepository } from "./listCrudRepository";

export interface ListPagingAndSortingRepository<T, ID> extends ListCrudRepository<T, ID> {}
