import { Fields } from "../../aggregate/field";
import { AggregationExpression } from "../../aggregationExpression";
import { SystemVariables, SystemVariablesImpl } from "../../systemVariables";
import { MergeObject } from "./mergeObject";
import { ObjectOperatorFactory } from "./objectOperatorFactory";

export class ObjectOperators {
    static valueOf(variable: keyof typeof SystemVariables): ObjectOperatorFactory
    static valueOf(fieldRef: string): ObjectOperatorFactory
    static valueOf(fieldRef: string | SystemVariables) {
        if (typeof fieldRef === 'string' && this.isSystemVariable(fieldRef)) {
            const systemVariables = new SystemVariablesImpl(fieldRef as SystemVariables)
            return new ObjectOperatorFactory(
                Fields.field(systemVariables.getName(), systemVariables.getTarget())
            )
        }
        return new ObjectOperatorFactory(Fields.field(fieldRef))
    }

    static setValueTo(fieldName: string, value: any) {
        return new ObjectOperatorFactory(SystemVariables.CURRENT).setField(fieldName).toValue(value)
    }

    private static isSystemVariable(name: string): boolean {
        return Object.values(SystemVariables).includes(name as SystemVariables);
    }

    static mergeObject(value: any) {
        return MergeObject.merge(value)
    }

    static mergeValueOf(...fieldName: string[]): MergeObject
    static mergeValueOf(...expression: AggregationExpression[]): MergeObject
    static mergeValueOf(value: any) {
        return MergeObject.mergeValueOf(value)
    }
}
