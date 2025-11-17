import { AggregationOperationRenderer } from "../../aggregate/aggregateOperationContext/aggregateOperationRenderer";
import { AggregationOperationContext } from "../../aggregate/aggregateOperationContext/aggregationOperationContext";
import { ExposedField } from "../../aggregate/field/exposeField";
import { AggregateOperation } from "../../aggregateOperation";
import { Assert } from "../../utils";

export class Facet {
    private readonly exposedField: ExposedField;
    private readonly operations: AggregateOperation[];

    constructor(exposedField: ExposedField, operations: AggregateOperation[]) {
        Assert.notNull(exposedField, 'ExposedField must not be null');
        Assert.notNull(operations, 'Operations must not be null');
        
        this.exposedField = exposedField;
        this.operations = operations;
    }

    getExposedField() {
        return this.exposedField;
    }

    toDocuments(context: AggregationOperationContext) {
        return AggregationOperationRenderer.toDocument(this.operations, context)
    }
}
