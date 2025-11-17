import { Fields } from "../../aggregate/field";
import { AggregationExpression } from "../../aggregationExpression";
import { Assert } from "../../utils";
import { AbstractOperatorExpression } from "../abstractOperatorExpression";

export class Size extends AbstractOperatorExpression {
    static lengthOfArray(fieldReference: string): Size;
    static lengthOfArray(expression: AggregationExpression): Size;
    static lengthOfArray(expression: Record<string, any>): Size;
    static lengthOfArray(values: any[]): Size;
    static lengthOfArray(value: unknown) {
        Assert.notNull(value, 'Value must not be null');

        if (typeof value === 'string') {
            return new Size(Fields.field(value));
        }

        return new Size(value);
    }

    private constructor(value: any) {
        super(value);
    }

    protected getMongoMethod(): string {
        return '$size';
    }

}