import { AggregationOperationContext } from "../../aggregate/aggregateOperationContext/aggregationOperationContext";
import { Field } from "../../aggregate/field";
import { Assert } from "../../utils";
import { Replacement } from "./types";

export class FieldReplacement extends Replacement {
    private readonly field: Field;

    /**
     * Creates {@link FieldReplacement} given {@link Field}.
     */
    constructor(field: Field) {
        super();
        Assert.notNull(field, "Field must not be null");
        this.field = field;
    }

    public toDocumentExpression(context: AggregationOperationContext) {
        return context.getReference(this.field).toString();
    }
}
