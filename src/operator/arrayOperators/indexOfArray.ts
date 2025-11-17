import { Fields } from "../../aggregate/field";
import { AggregationExpression } from "../../aggregationExpression";
import { Assert } from "../../utils";
import { AbstractOperatorExpression } from "../abstractOperatorExpression";

export class IndexOfArray extends AbstractOperatorExpression {
    static arrayOf(fieldReference: string): IndexOfArrayBuilder
    static arrayOf(expression: AggregationExpression): IndexOfArrayBuilder
    static arrayOf(expression: Record<string, any>): IndexOfArrayBuilder
    static arrayOf(value: unknown) {
        Assert.notNull(value, 'Value must not be null');

        if (typeof value === 'string') {
            return new IndexOfArrayBuilder(Fields.field(value));
        }
        return new IndexOfArrayBuilder(value);
    }
    
    constructor(value: Array<any>) {
        super(value);
    }

    within(start: number, end?: number) {
        const result = [start];
        if (end !== undefined) {
            result.push(end)
        }
        return new IndexOfArray(this.append(result))
    }

    protected getMongoMethod(): string {
        return '$indexOfArray';
    }

}

class IndexOfArrayBuilder {
    constructor(private readonly targetArray: any) { }

    indexOf<T = any>(value: T) {
        Assert.notNull(value, 'Value must not be null');

        return new IndexOfArray([this.targetArray, value]);
    }
}
