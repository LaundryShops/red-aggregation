import { Fields } from "../../aggregate/field";
import { AggregationExpression } from "../../aggregationExpression";
import { Assert } from "../../utils";
import { AbstractOperatorExpression } from "../abstractOperatorExpression";

export class ObjectToArray extends AbstractOperatorExpression {
    private constructor(value: any) {
        super(value);
    }

    static valueOfToArray(fieldReference: string): ObjectToArray;
    static valueOfToArray(expression: AggregationExpression): ObjectToArray;
    static valueOfToArray(expression: Record<string, any>): ObjectToArray;
    static valueOfToArray(fieldNameOrExpression: unknown) {
        if (!fieldNameOrExpression) {
            Assert.notNull(fieldNameOrExpression, 'Field name or expression must not be null');
        }
        if (typeof fieldNameOrExpression === 'string') {
            return ObjectToArray.toArray(Fields.field(fieldNameOrExpression));
        }
        return ObjectToArray.toArray(fieldNameOrExpression);
    }

    static toArray(value: any) {
        return new ObjectToArray(value);
    }
    
    protected getMongoMethod(): string {
        return "$objectToArray";
    }
}
