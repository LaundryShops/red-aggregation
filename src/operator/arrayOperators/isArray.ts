import { Fields } from "../../aggregate/field";
import { AggregationExpression } from "../../aggregationExpression";
import { Assert } from "../../utils";
import { AbstractOperatorExpression } from "../abstractOperatorExpression";

export class IsArray extends AbstractOperatorExpression {
    static isArray(fieldReference: string): IsArray;
    static isArray(expression: AggregationExpression): IsArray;
    static isArray(expression: Record<string, any>): IsArray;
    static isArray(value: unknown) {
        Assert.notNull(value, 'Value must not be null');

        if (typeof value === 'string') {
            return new IsArray(Fields.field(value));
        }

        return new IsArray(value);
    }
    
    private constructor(value: any) {
        super(value);
    }

    protected getMongoMethod(): string {
        return '$isArray';
    }

}