import { Field, Fields } from "../../aggregate/field";
import { AggregationExpression } from "../../aggregationExpression";
import { Assert } from "../../utils";
import { AbstractOperatorExpression } from "../abstractOperatorExpression";

export class SplitOperator extends AbstractOperatorExpression {
    static valueOf(fieldReference: string): SplitOperator
    static valueOf(expression: AggregationExpression): SplitOperator
    static valueOf(expression: Record<string, any>): SplitOperator
    static valueOf(value: unknown) {
        Assert.notNull(value, 'Value must not be null');
        if (typeof value === 'string') {
            return new SplitOperator(this.asFields(value));
        }
        return new SplitOperator([value]);
    }

    constructor(value: any) {
        super(value);
    }

    split(delimiter: string): SplitOperator;
    split(fieldReference: Field): SplitOperator;
    split(expression: AggregationExpression): SplitOperator;
    split(expression: Record<string, any>): SplitOperator;
    split(value: unknown) {
        Assert.notNull(value, 'Value must not be null');
        return new SplitOperator(this.append(value))
    }

    protected getMongoMethod(): string {
        return '$split';
    }

}
