import { Fields } from "../../aggregate/field";
import { AggregationExpression } from "../../aggregationExpression";
import { Assert } from "../../utils";
import { AbstractOperatorExpression } from "../abstractOperatorExpression";

export class LTrim extends AbstractOperatorExpression {
    constructor(value: any) {
        super(value);
    }

    static valueOf(fieldReference: string): LTrim
    static valueOf(expression: AggregationExpression): LTrim
    static valueOf(expression: Record<string, any>): LTrim
    static valueOf(input: unknown) {
        Assert.notNull(input, 'FieldReference must not be null');

        if(typeof input === 'string') {
            return new LTrim(new Map().set('input', Fields.field(input)));
        }

        return new LTrim(new Map().set('input', input))
    }

    chars(chars: string) {
        Assert.notNull(chars, 'Chars must not be null');

        return new LTrim(this.append('chars', chars));
    }

    charsOf(fieldReference: string): LTrim
    charsOf(expression: AggregationExpression): LTrim
    charsOf(expression: Record<string, any>): LTrim
    charsOf(input: unknown) {
        if(typeof input === 'string') {
            return new LTrim(this.append('chars', Fields.field(input)))
        }
        return new LTrim(this.append('chars', input))
    }

    protected getMongoMethod(): string {
        return '$ltrim';
    }

}