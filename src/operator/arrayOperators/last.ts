import { Fields } from "../../aggregate/field";
import { AggregationExpression } from "../../aggregationExpression";
import { Assert } from "../../utils";
import { AbstractOperatorExpression } from "../abstractOperatorExpression";

export class Last extends AbstractOperatorExpression {
    static last(array: any) {
        return new Last(array);
    }

    static lastOf(fieldReference: string): Last;
    static lastOf(expression: AggregationExpression): Last;
    static lastOf(expression: Record<string, any>): Last;
    static lastOf(value: unknown) {
        Assert.notNull(value, 'Value must not be null');

        if (typeof value === 'string') {
            return new Last(Fields.field(value));
        }

        return new Last(value);
    }
    
    private constructor(value: any) {
        super(value);
    }

    protected getMongoMethod(): string {
        return '$last';
    }

}