import { Fields } from "../../aggregate/field";
import { AggregationExpression } from "../../aggregationExpression";
import { Assert } from "../../utils";
import { AbstractOperatorExpression } from "../abstractOperatorExpression";

export class Concat extends AbstractOperatorExpression {
    static valueOf(fieldReference: string): Concat
    static valueOf(expression: AggregationExpression): Concat
    static valueOf(expression: Record<string, any>): Concat
    static valueOf(input: unknown) {
        Assert.notNull(input, "FieldReference must not be null");

        if (typeof input === 'string') {
            return new Concat(AbstractOperatorExpression.asFields(input));
        }
        return new Concat(input);
    }

    static stringValue(input: string): Concat {
        Assert.notNull(input, 'Value must not be null');
        return new Concat(input);
    }

    private constructor(input: unknown) {
        Assert.notNull(input, 'FieldReference must not be null');
        super(input);
    }

    protected override getMongoMethod(): string {
        return '$concat';
    }

    concatValueof(string: string): Concat;
    concatValueof(expression: AggregationExpression): Concat;
    concatValueof(expression: Record<string, any>): Concat;
    concatValueof(value: unknown) {
        if (typeof value === 'string') {
            return new Concat(this.append(Fields.field(value)))
        }
        return new Concat(this.append(value));
    }

    concat(string: string) {
        return new Concat(this.append(string));
    }
}
