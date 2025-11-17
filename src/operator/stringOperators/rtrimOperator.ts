import { Fields } from "../../aggregate/field";
import { AggregationExpression } from "../../aggregationExpression";
import { Assert } from "../../utils";
import { AbstractOperatorExpression } from "../abstractOperatorExpression";

export class RTrim extends AbstractOperatorExpression {
    constructor(value: any) {
        super(value)
    }

    protected getMongoMethod(): string {
        return '$rtrim';
    }

    static valueOf(fieldReference: string): RTrim
    static valueOf(expression: AggregationExpression): RTrim
    static valueOf(expression: Record<string, any>): RTrim
    static valueOf(input: unknown) {
        Assert.notNull(input, 'FieldReference must not be null');

        if (typeof input === 'string') {
            return new RTrim(new Map().set('input', Fields.field(input)));
        }

        return new RTrim(new Map().set('input', input))
    }

    chars(chars: string) {
        Assert.notNull(chars, 'Chars must not be null');

        return new RTrim(this.append('chars', chars));
    }

    charsOf(fieldReference: string): RTrim
    charsOf(expression: AggregationExpression): RTrim
    charsOf(expression: Record<string, any>): RTrim
    charsOf(input: unknown) {
        if (typeof input === 'string') {
            return new RTrim(this.append('chars', Fields.field(input)))
        }
        return new RTrim(this.append('chars', input))
    }

}
