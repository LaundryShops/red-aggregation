
import { Field, Fields } from "../../aggregate/field";
import { AggregationExpression } from "../../aggregationExpression";
import { Assert } from "../../utils";
import { AbstractOperatorExpression } from "../abstractOperatorExpression";

export class IndexOfBytes<T = unknown> extends AbstractOperatorExpression {
    constructor(input: T) {
        super(input);
    }

    protected getMongoMethod(): string {
        return `$indexOfBytes`;
    }

    static valueOf(fieldReference: string): SubstringBuilder;
    static valueOf(expression: AggregationExpression): SubstringBuilder;
    static valueOf(expression: Record<string, any>): SubstringBuilder;
    static valueOf(input: unknown) {
        Assert.notNull(input, 'FieldReference must not be null');
        if (typeof input === 'string') {
            return new SubstringBuilder(Fields.field(input));
        }
        return new SubstringBuilder(input);
    }

    within(): IndexOfBytes {
        throw new Error('Method is not implement.');
    }
}

class SubstringBuilder {
    private readonly stringExpression: any;

    constructor(stringExpression: any) {
        this.stringExpression = stringExpression;
    }

    indexOf(substring: string): IndexOfBytes
    indexOf(fieldReference: Field): IndexOfBytes
    indexOf(expression: AggregationExpression): IndexOfBytes
    indexOf(expression: Record<string, any>): IndexOfBytes
    indexOf(substring: unknown) {
        return new IndexOfBytes([this.stringExpression, substring]);
    }
    
}