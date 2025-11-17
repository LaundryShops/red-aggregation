import { AggregationExpression } from "../../aggregationExpression";
import { StringOperatorFactory } from "./stringOperatorFactory";

export class StringOperators {
    static valueOf(fieldReference: string): StringOperatorFactory
    static valueOf(expression: AggregationExpression): StringOperatorFactory
    static valueOf(expression: Record<string, any>): StringOperatorFactory
    static valueOf(value: any) {
        return new StringOperatorFactory(value)
    }
}
