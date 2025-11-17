import { AggregationExpression } from "../../aggregationExpression";
import { ComparisonOperationFactory } from "./comparisonOperatorFactory";
import { Eq } from "./eq";
import { Gt } from "./gt";
import { Gte } from "./gte";
import { Lte } from "./lte";
import { Ne } from "./ne";

export class ComparisonOperation {
    static valueOf(fieldReference: string): ComparisonOperationFactory
    static valueOf(expression: AggregationExpression): ComparisonOperationFactory
    static valueOf(fieldOrExpression: string | AggregationExpression) {
        return new ComparisonOperationFactory(fieldOrExpression as any)
    }

    static eq(field: string): Eq
    static eq(expression: AggregationExpression): Eq
    static eq(expression: Record<string, any>): Eq
    static eq(fieldOrExpression: unknown) {
        return Eq.valueOf(fieldOrExpression!)
    }

    static gt(field: string): Gt
    static gt(expression: AggregationExpression): Gt
    static gt(expression: Record<string, any>): Gt
    static gt(fieldOrExpression: unknown) {
        return Gt.valueOf(fieldOrExpression!)
    }

    static gte(field: string): Gte
    static gte(expression: AggregationExpression): Gte
    static gte(expression: Record<string, any>): Gte
    static gte(fieldOrExpression: unknown) {
        return Gte.valueOf(fieldOrExpression!)
    }

    static lt(field: string): Lte
    static lt(expression: AggregationExpression): Lte
    static lt(expression: Record<string, any>): Lte
    static lt(fieldOrExpression: unknown) {
        return Lte.valueOf(fieldOrExpression!)
    }

    static lte(field: string): Lte
    static lte(expression: AggregationExpression): Lte
    static lte(expression: Record<string, any>): Lte
    static lte(fieldOrExpression: unknown) {
        return Lte.valueOf(fieldOrExpression!)
    }

    static ne(field: string): Ne
    static ne(expression: AggregationExpression): Ne
    static ne(expression: Record<string, any>): Ne
    static ne(fieldOrExpression: unknown) {
        return Ne.valueOf(fieldOrExpression!)
    }
}
