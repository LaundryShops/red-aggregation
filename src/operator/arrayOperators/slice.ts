import { Field } from "../../aggregate/field";
import { AggregationExpression } from "../../aggregationExpression";
import { Assert } from "../../utils";
import { AbstractOperatorExpression } from "../abstractOperatorExpression";

export class Slice extends AbstractOperatorExpression {
    static sliceArrayOf(values: Array<any>): Slice;
    static sliceArrayOf(fieldReference: string): Slice;
    static sliceArrayOf(expression: AggregationExpression): Slice;
    static sliceArrayOf(expression: Record<string, any>): Slice;
    static sliceArrayOf(value: unknown) {
        Assert.notNull(value, 'Value must not be null');

        if (typeof value === 'string') {
            const a = this.asFields(value)
            return new Slice(a);
        }

        return new Slice([value])
    }

    /**
     * WARN: Do not create instance by new keyword.
     * Used by SliceElementBuilder
     */
    constructor(value: Readonly<Field[]>)
    constructor(value: Array<AggregationExpression | Record<string, any> | any>)
    constructor(value: any) {
        super(value);
    }

    itemCount(count: number): Slice
    itemCount(count: AggregationExpression): Slice
    itemCount(count: Record<string, any>): Slice
    itemCount(count: number | AggregationExpression | Record<string, any>) {
        return new Slice(this.append(count));
    }

    offset(position: number): SliceElementBuilder;
    offset(position: AggregationExpression): SliceElementBuilder;
    offset(position: Record<string, any>): SliceElementBuilder;
    offset(position: unknown) {
        return new SliceElementBuilder(this.append(position));
    }

    protected getMongoMethod(): string {
        return '$slice';
    }

}

class SliceElementBuilder {
    constructor(private readonly position: any, ) { }

    itemCount(count: number): Slice
    itemCount(count: AggregationExpression): Slice
    itemCount(count: Record<string, any>): Slice
    itemCount(count: any) {
        return new Slice(this.position).itemCount(count);
    }
}