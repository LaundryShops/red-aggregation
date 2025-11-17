import { Fields } from "../../aggregate/field";
import { AggregationExpression } from "../../aggregationExpression";
import { Assert } from "../../utils";
import { AbstractOperatorExpression } from "../abstractOperatorExpression";

export class RegexFindOperator extends AbstractOperatorExpression {
    static valueOf(fieldReference: string): RegexFindOperator
    static valueOf(expression: AggregationExpression): RegexFindOperator
    static valueOf(expression: Record<string, any>): RegexFindOperator
    static valueOf(input: unknown) {
        Assert.notNull(input, 'Input must not be null');

        if (typeof input === 'string') {
            return new RegexFindOperator(new Map().set('input', Fields.field(input)));
        }
        return new RegexFindOperator(new Map().set('input', input));
    }

    constructor(value: any) {
        super(value);
    }

    options(options: string) {
        Assert.notNull(options, 'Options must not be null.');

        return new RegexFindOperator(this.append('options', options));
    }

    optionsOf(fieldReference: string): RegexFindOperator
    optionsOf(expression: AggregationExpression): RegexFindOperator
    optionsOf(expression: Record<string, any>): RegexFindOperator
    optionsOf(input: unknown) {
        Assert.notNull(input, 'Input must not be null');
        if (typeof input === 'string') {
            return new RegexFindOperator(this.append('options', Fields.field(input)))
        }
        return new RegexFindOperator(this.append('options', input))
    }

    pattern(pattern: RegExp) {
        Assert.notNull(pattern, 'Pattern must not be null');

        const regexOperator = this.append('regex', pattern.source);
        regexOperator.set('options', pattern.flags);

        return new RegexFindOperator(regexOperator);
    }

    regex(regex: string) {
        Assert.notNull(regex, 'Regex must not be null');
        return new RegexFindOperator(this.append('regex', regex));
    }

    regexOf(fieldReference: string): RegexFindOperator;
    regexOf(expression: AggregationExpression): RegexFindOperator;
    regexOf(expression: Record<string, any>): RegexFindOperator;
    regexOf(input: unknown) {
        Assert.notNull(input, 'Input must not be null');

        if (typeof input === 'string') {
            return new RegexFindOperator(this.append('regex', Fields.field(input)));
        }
        return new RegexFindOperator(this.append('regex', input));
    }

    protected getMongoMethod(): string {
        return '$regexFind';
    }

}