import { AggregationExpression } from "../../aggregationExpression";
import { AggregateField } from "../../aggregate/field/aggregateField";
import { Assert } from "../../utils";
import { AbstractOperatorExpression } from "../abstractOperatorExpression";
import { Fields } from "../../aggregate/field";

export class Add<T = unknown> extends AbstractOperatorExpression{
    static valueOf(fieldReference: string): Add<AggregateField>
    static valueOf(number: number): Add<number>
    static valueOf(expression: AggregationExpression): Add<AggregationExpression>
    static valueOf<T>(input: T) {
        if (typeof input === 'string') {
            return new Add(Fields.field(input));
        }
        return new Add(input);
    }

    private constructor(input: T) {
        Assert.notNull(input, 'FieldReference must not be null');
        super(input);

    }

    protected override getMongoMethod(): string {
        return '$add';
    }

    add(number: number): Add<number>
    add(fieldReference: string): Add<AggregateField>
    add(expression: AggregationExpression): Add<AggregationExpression>
    add(expression: Document): Add<AggregationExpression>
    add(input: number | string | AggregationExpression | Document) {
        if (typeof input === 'string') {
            this.append(Fields.field(input))
        } else {
            this.append(input)
        }
        return this;
    }
}
