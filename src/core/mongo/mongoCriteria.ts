import type { Document, Filter } from "mongodb";
import { ClauseDefinition } from "../../query/standardDefinition";
import type { MongoCriteria } from "./mongoQuery";

export function criteriaToFilter(criteria: MongoCriteria): Filter<Document> {
    if (criteria instanceof ClauseDefinition) {
        return criteria.getCriteriaObject() as Filter<Document>;
    }
    return criteria as Filter<Document>;
}
