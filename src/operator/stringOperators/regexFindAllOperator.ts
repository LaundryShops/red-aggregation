import { Fields } from "../../aggregate/field";
import { AggregationExpression } from "../../aggregationExpression";
import { Assert } from "../../utils";
import { AbstractOperatorExpression } from "../abstractOperatorExpression";

export class RegexFindAllOperator extends AbstractOperatorExpression {
    static valueOf(fieldReference: string): RegexFindAllOperator
    static valueOf(expression: AggregationExpression): RegexFindAllOperator
    static valueOf(expression: Record<string, any>): RegexFindAllOperator
    static valueOf(input: unknown) {
        Assert.notNull(input, 'Input must not be null');

        if (typeof input === 'string') {
            return new RegexFindAllOperator(new Map().set('input', Fields.field(input)));
        }
        return new RegexFindAllOperator(new Map().set('input', input));
    }

    constructor(value: any) {
        super(value);
    }

    options(options: string) {
        Assert.notNull(options, 'Options must not be null.');

        return new RegexFindAllOperator(this.append('options', options));
    }

    optionsOf(fieldReference: string): RegexFindAllOperator
    optionsOf(expression: AggregationExpression): RegexFindAllOperator
    optionsOf(expression: Record<string, any>): RegexFindAllOperator
    optionsOf(input: unknown) {
        Assert.notNull(input, 'Input must not be null');
        if (typeof input === 'string') {
            return new RegexFindAllOperator(this.append('options', Fields.field(input)))
        }
        return new RegexFindAllOperator(this.append('options', input))
    }

    pattern(pattern: RegExp) {
        Assert.notNull(pattern, 'Pattern must not be null');

        const regexOperator = this.append('regex', pattern.source);
        regexOperator.set('options', pattern.flags);

        return new RegexFindAllOperator(regexOperator);
    }

    regex(regex: string) {
        Assert.notNull(regex, 'Regex must not be null');

        return new RegexFindAllOperator(this.append('regex', regex));
    }

    regexOf(fieldReference: string): RegexFindAllOperator;
    regexOf(expression: AggregationExpression): RegexFindAllOperator;
    regexOf(expression: Record<string, any>): RegexFindAllOperator;
    regexOf(input: unknown) {
        Assert.notNull(input, 'Input must not be null');

        if (typeof input === 'string') {
            return new RegexFindAllOperator(this.append('regex', Fields.field(input)));
        }
        return new RegexFindAllOperator(this.append('regex', input));
    }

    protected getMongoMethod(): string {
        return '$regexFindAll';
    }

}
