import { Assert } from "../../utils";
import { MergeObject } from "./mergeObject";
import { AggregationExpression } from "../../aggregationExpression";
import { ObjectToArray } from "./objectToArray";
import { GetField } from "./getField";
import { SetField } from "./setField";
import { Fields } from "../../aggregate/field";

export class ObjectOperatorFactory {
    private readonly value: any;

    constructor(value: any) {
        Assert.notNull(value, 'Value must not be null');
        this.value = value;
    }

    merge() {
        return MergeObject.merge(this.value);
    }

    mergeWith(...values: any[]) {
        return this.merge().mergeWith(...values)
    }

    mergeWithValuesOf(...fieldReference: any[]): MergeObject
    mergeWithValuesOf(...expression: AggregationExpression[]): MergeObject
    mergeWithValuesOf(...fieldReferenceOrExpression: any[]) {
        return this.merge().mergeWithValueOf(...fieldReferenceOrExpression);
    }

    toArray() {
        return ObjectToArray.toArray(this.value);
    }

    getField(fieldName: string) {
        return GetField.getField(fieldName);
    }

    setField(fieldName: string) {
        return SetField
            .field(Fields.field(fieldName))
            .input(this.value);
    }

    removeField(fieldName: string) {
        return SetField
            .field(fieldName)
            .input(this.value)
            .toValue('$$REMOVE')
    }
}
