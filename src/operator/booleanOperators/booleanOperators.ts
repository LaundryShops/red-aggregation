import { AggregationExpression } from "../../aggregationExpression";
import { And } from "./and";
import { BooleanOperatorsFactory } from "./booleanOperatorsFactory";
import { Not } from "./not";
import { Or } from "./or";

export class BooleanOperators {
    static valueOf(field: string): BooleanOperatorsFactory
    static valueOf(expression: AggregationExpression): BooleanOperatorsFactory
    static valueOf(fieldOrExpression: any) {
        return new BooleanOperatorsFactory(fieldOrExpression)
    }

    static and(...expression: any) {
        return And.and(...expression);
    }

    static not(...expression: any) {
        return Not.not(...expression);
    }

    static or(...expression: any) {
        return Or.or(...expression);
    }
}

