import { Fields } from "../../aggregate/field";
import { AggregationExpression } from "../../aggregationExpression";
import { Assert } from "../../utils";
import { AbstractOperatorExpression } from "../abstractOperatorExpression";

export class ReplaceOneOperator extends AbstractOperatorExpression {
    
    static valueOf(fieldReference: string): ReplaceOneOperator
    static valueOf(expression: AggregationExpression): ReplaceOneOperator
    static valueOf(expression: Record<string, any>): ReplaceOneOperator
    static valueOf(value: unknown) {
        Assert.notNull(value, 'Value must not be null');
        if (typeof value === 'string') {
            return new ReplaceOneOperator(new Map().set('input', Fields.field(value)));
        }
        return new ReplaceOneOperator(new Map().set('input', value));
    }

    static value(value: string) {
        Assert.notNull(value, 'Value must not be null');

        return new ReplaceOneOperator(new Map().set('input', value));
    }

    constructor(value: any) {
        super(value);
    }

    replacementOf(fieldReference: string): ReplaceOneOperator
    replacementOf(expression: AggregationExpression): ReplaceOneOperator
    replacementOf(expression: Record<string, any>): ReplaceOneOperator
    replacementOf(replacement: unknown) {
        Assert.notNull(replacement, 'Replacement must not be null');
        if (typeof replacement === 'string') {
            return new ReplaceOneOperator(this.append('replacement', Fields.field(replacement)));
        }
        return new ReplaceOneOperator(this.append('replacement', replacement));
    }

    replacement(replacement: string) {
        Assert.notNull(replacement, 'Replacement must not be null');

        return new ReplaceOneOperator(this.append('replacement', replacement));
    }

    findValueOf(fieldReference: string): ReplaceOneOperator
    findValueOf(expression: AggregationExpression): ReplaceOneOperator
    findValueOf(expression: Record<string, any>): ReplaceOneOperator
    findValueOf(input: unknown) {
        Assert.notNull(input, 'Input must not be null');
        if (typeof input === 'string') {
            return new ReplaceOneOperator(this.append('find', Fields.field(input)));
        }
        return new ReplaceOneOperator(this.append('find', input));
    }

    find(value: string) {
        Assert.notNull(value, 'Search string must not be null');
        return new ReplaceOneOperator(this.append('find', value));
    }

    protected getMongoMethod(): string {
        return `$replaceOne`;
    }

}
