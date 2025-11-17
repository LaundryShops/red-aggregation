import { Document } from "mongodb";
import { AggregationOperationContext } from "../../aggregate/aggregateOperationContext/aggregationOperationContext";
import { AbstractProjection } from "./abstractProjection";
import { AggregationExpression } from "../../aggregationExpression";
import { Field } from "../../aggregate/field";

export class ExpressionProjection extends AbstractProjection {
    private readonly expression: AggregationExpression | Document;
    private readonly _field: Field;

    constructor(field: Field, expression: AggregationExpression | Document) {
        super(field);
        this._field = field;
        this.expression = expression;
    }

    toDocument(context: AggregationOperationContext): Document {
        let expr = this.expression;

        if (this.expression instanceof AggregationExpression) {
            expr = this.expression.toDocument(context)
        }

        return {
            [this._field.getName()]: expr
        }
    }

}
