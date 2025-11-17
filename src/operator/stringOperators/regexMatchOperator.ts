import { Fields } from "../../aggregate/field";
import { AggregationExpression } from "../../aggregationExpression";
import { Assert } from "../../utils";
import { AbstractOperatorExpression } from "../abstractOperatorExpression";

export class RegexMatchOperator extends AbstractOperatorExpression {
    static valueOf(fieldReference: string): RegexMatchOperator
    static valueOf(expression: AggregationExpression): RegexMatchOperator
    static valueOf(expression: Record<string, any>): RegexMatchOperator
    static valueOf(input: unknown) {
        Assert.notNull(input, 'Input must not be null');

        if (typeof input === 'string') {
            return new RegexMatchOperator(new Map().set('input', Fields.field(input)));
        }
        return new RegexMatchOperator(new Map().set('input', input));
    }

    constructor(value: any) {
        super(value);    
    }

    regexOf(fieldReference: string): RegexMatchOperator;
    regexOf(expression: AggregationExpression): RegexMatchOperator;
    regexOf(expression: Record<string, any>): RegexMatchOperator;
    regexOf(input: unknown) {
        Assert.notNull(input, 'Input must not be null');

        if (typeof input === 'string') {
            return new RegexMatchOperator(this.append('regex', Fields.field(input)));
        }
        return new RegexMatchOperator(this.append('regex', input));
    }

    regex(regex: string) {
        Assert.notNull(regex, 'Pattern must not be null');

        return new RegexMatchOperator(this.append('regex', regex));
    }

    pattern(pattern: RegExp) {
        Assert.notNull(pattern, 'Pattern must not be null');

        const regexOperator = this.append('regex', pattern.source);
        regexOperator.set('options', pattern.flags);

        return new RegexMatchOperator(regexOperator);
    }

    optionsOf(fieldReference: string): RegexMatchOperator
    optionsOf(expression: AggregationExpression): RegexMatchOperator
    optionsOf(expression: Record<string, any>): RegexMatchOperator
    optionsOf(input: unknown) {
        Assert.notNull(input, 'Input must not be null');

        if (typeof input === 'string') {
            return new RegexMatchOperator(this.append('options', Fields.field(input)));
        }
        return new RegexMatchOperator(this.append('options', input));
    }

    options(options: string) {
        Assert.notNull(options, 'Options must not be null');
        return new RegexMatchOperator(this.append('options', options));
    }    

    protected getMongoMethod(): string {
        return '$regexMatch';
    }

}
