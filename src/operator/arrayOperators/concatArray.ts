import { Fields } from "../../aggregate/field";
import { AggregationExpression } from "../../aggregationExpression";
import { Assert } from "../../utils";
import { AbstractOperatorExpression } from "../abstractOperatorExpression";

export class ConcatArrays extends AbstractOperatorExpression {
    static arrayOf(fieldReference: string): ConcatArrays;
    static arrayOf(expression: AggregationExpression): ConcatArrays;
    static arrayOf(expression: Record<string, any>): ConcatArrays;
    static arrayOf(value: unknown) {
        Assert.notNull(value, "Value must not be null");
        if (typeof value === 'string') {
            return new ConcatArrays(this.asFields(value));
        }
        return new ConcatArrays([value]);
    }

    private constructor(value: any) {
        super(value);
    }

    concat(arrayFieldReference: string): ConcatArrays
    concat(expression: AggregationExpression): ConcatArrays
    concat(expression: Record<string, any>): ConcatArrays
    concat(value: unknown) {
        Assert.notNull(value, "Value must not be null");
        if (typeof value === 'string') {
            return new ConcatArrays(this.append(Fields.field(value)));
        }
        return new ConcatArrays(this.append(value));
    }

    protected getMongoMethod(): string {
        return '$concatArrays';
    }

}
