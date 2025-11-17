import { Fields } from "../../aggregate/field";
import { AggregationExpression } from "../../aggregationExpression";
import { Assert } from "../../utils";
import { AbstractOperatorExpression } from "../abstractOperatorExpression";

export class ReverseArray extends AbstractOperatorExpression {
    static reverseArray(array: any[]) {
        return new ReverseArray(array);
    }

    static reverseArrayOf(fieldReference: string): ReverseArray;
    static reverseArrayOf(expression: AggregationExpression): ReverseArray;
    static reverseArrayOf(expression: Record<string, any>): ReverseArray;
    static reverseArrayOf(value: unknown) {
        Assert.notNull(value, 'Value must not be null');

        if (typeof value === 'string') {
            return new ReverseArray(Fields.field(value));
        }

        return new ReverseArray(value);
    }
    
    private constructor(value: any) {
        super(value);
    }

    protected getMongoMethod(): string {
        return '$reverseArray';
    }

}