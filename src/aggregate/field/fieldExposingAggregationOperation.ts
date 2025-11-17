import { AggregateOperation } from "../../aggregateOperation";
import { ExposedFields } from "./exposeFields";

export abstract class FieldsExposingAggregationOperation extends AggregateOperation implements AggregateOperation {
    abstract getFields(): ExposedFields;

    inheritsFields() {
        return false;
    }
}

export abstract class InheritsFieldsAggregationOperation extends FieldsExposingAggregationOperation {
    inheritsFields() {
        return true;
    }
}
