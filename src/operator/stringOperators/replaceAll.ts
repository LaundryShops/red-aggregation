import { Fields } from "../../aggregate/field";
import { AggregationExpression } from "../../aggregationExpression";
import { Assert } from "../../utils";
import { AbstractOperatorExpression } from "../abstractOperatorExpression";

export class ReplaceAllOperator extends AbstractOperatorExpression {
    
    static valueOf(fieldReference: string): ReplaceAllOperator
    static valueOf(expression: AggregationExpression): ReplaceAllOperator
    static valueOf(expression: Record<string, any>): ReplaceAllOperator
    static valueOf(value: unknown) {
        Assert.notNull(value, 'Value must not be null');
        if (typeof value === 'string') {
            return new ReplaceAllOperator(new Map().set('input', Fields.field(value)));
        }
        return new ReplaceAllOperator(new Map().set('input', value));
    }

    static value(value: string) {
        Assert.notNull(value, 'Value must not be null');

        return new ReplaceAllOperator(new Map().set('input', value));
    }

    constructor(value: any) {
        super(value);
    }

    replacementOf(fieldReference: string): ReplaceAllOperator
    replacementOf(expression: AggregationExpression): ReplaceAllOperator
    replacementOf(expression: Record<string, any>): ReplaceAllOperator
    replacementOf(replacement: unknown) {
        Assert.notNull(replacement, 'Replacement must not be null');
        if (typeof replacement === 'string') {
            return new ReplaceAllOperator(this.append('replacement', Fields.field(replacement)));
        }
        return new ReplaceAllOperator(this.append('replacement', replacement));
    }

    replacement(replacement: string) {
        Assert.notNull(replacement, 'Replacement must not be null');

        return new ReplaceAllOperator(this.append('replacement', replacement));
    }

    findValueOf(fieldReference: string): ReplaceAllOperator
    findValueOf(expression: AggregationExpression): ReplaceAllOperator
    findValueOf(expression: Record<string, any>): ReplaceAllOperator
    findValueOf(input: unknown) {
        Assert.notNull(input, 'Input must not be null');
        if (typeof input === 'string') {
            return new ReplaceAllOperator(this.append('find', Fields.field(input)));
        }
        return new ReplaceAllOperator(this.append('find', input));
    }

    find(value: string) {
        Assert.notNull(value, 'Search string must not be null');
        return new ReplaceAllOperator(this.append('find', value));
    }

    protected getMongoMethod(): string {
        return `$replaceAll`;
    }

}
