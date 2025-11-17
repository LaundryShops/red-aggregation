import { Document } from 'mongodb';
import { Fields } from "../../aggregate/field";
import { AggregationExpression } from "../../aggregationExpression";
import { AbstractOperatorExpression } from "../abstractOperatorExpression";
import { AggregationOperationContext } from '../../aggregate/aggregateOperationContext/aggregationOperationContext';

export class MergeObject extends AbstractOperatorExpression {
    private constructor(value: any[]) {
        super(value);
    }

    static merge<T>(...values: T[]) {
        return new MergeObject(values);
    }

    static mergeValueOf(...fieldName: string[]): MergeObject
    static mergeValueOf(...expression: AggregationExpression[]): MergeObject
    static mergeValueOf(...expression: Array<Record<string, any>>): MergeObject
    static mergeValueOf(...fieldNameOrExpression: string[] | AggregationExpression[] | Array<Record<string, any>>) {
        if (fieldNameOrExpression.some(elm => typeof elm === 'string')) {
            return MergeObject.merge(...fieldNameOrExpression.map(reference => Fields.field(reference as string)))
        }
        return MergeObject.merge(...fieldNameOrExpression)
    }

    mergeWithValueOf(...fieldName: string[]): MergeObject;
    mergeWithValueOf(...expression: AggregationExpression[]): MergeObject;
    mergeWithValueOf(...expression: Array<Record<string, any>>): MergeObject;
    mergeWithValueOf(...fieldNameOrExpression: unknown[]) {
        if(fieldNameOrExpression.some(elm => typeof elm === 'string')) {
            return this.mergeWith(...fieldNameOrExpression.map(elm => Fields.field(elm as string)))
        }
        return this.mergeWith(...fieldNameOrExpression);
    }

    mergeWith(...values: any[]) {
        return new MergeObject(this.append([...values]))
    }

    override toDocument(context: AggregationOperationContext): Document
    override toDocument(context: AggregationOperationContext, value: any): Document
    override toDocument(context: AggregationOperationContext, _value?: any,) {
        const value = this.potentiallyExtractSingleValue(_value)
        return super.toDocument(context, value);
    }

    private potentiallyExtractSingleValue(value: any) {
        if (value instanceof Map && value.size === 1) {
            return value.values().next().value;
        }
        return value;
    }

    protected getMongoMethod(): string {
        return "$mergeObjects";
    }
}
