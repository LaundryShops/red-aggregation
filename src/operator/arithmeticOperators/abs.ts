import { AggregateField } from "../../aggregate/field/aggregateField";
import { Fields } from "../../aggregate/field";
import { AggregationExpression } from "../../aggregationExpression";
import { Assert } from "../../utils";
import { AbstractOperatorExpression } from "../abstractOperatorExpression";

export class Abs extends AbstractOperatorExpression{
    static valueOf(fieldReference: string): Abs
    static valueOf(number: number): Abs
    static valueOf(expression: AggregationExpression): Abs
    static valueOf(input: unknown) {
        if (typeof input === 'string') {
            return new Abs(Fields.field(input));
        }
        return new Abs(input);
    }

    private constructor(input: unknown) {
        Assert.notNull(input, 'FieldReference must not be null');
        super(input);
    }

    protected override getMongoMethod(): string {
        return '$abs';
    }
}
