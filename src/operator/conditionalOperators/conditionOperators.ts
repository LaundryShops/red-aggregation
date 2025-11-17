import { AggregationExpression } from "../../aggregationExpression";
import { Assert } from "../../utils";
import { ConditionOperatorFactory } from "./conditionalOperatorFactory";
import { IfNull, ThenBuilder } from "./ifNull";
import { type CaseOperator, Switch } from "./switch";

export class ConditionOperator {
    static when(fieldReference: string): ConditionOperatorFactory
    static when(expression: AggregationExpression): ConditionOperatorFactory
    static when(expression: Record<string, any>): ConditionOperatorFactory
    static when(expression: unknown): ConditionOperatorFactory {
        return new ConditionOperatorFactory(expression as string);
    }

    static switchCases(conditions: CaseOperator[]): Switch;
    static switchCases(...conditions: CaseOperator[]): Switch;
    static switchCases(condition: CaseOperator | CaseOperator[], ...conditions: CaseOperator[]) {
        if (Array.isArray(condition)) {
            return Switch.switchCases(condition);
        }
        return Switch.switchCases(condition, ...conditions);
    }

    static ifNUll(fieldReference: string): ThenBuilder;
    static ifNUll(expression: AggregationExpression): ThenBuilder;
    static ifNUll(expression: Record<string, any>): ThenBuilder;
    static ifNUll(expression: unknown) {
        Assert.notNull(expression, 'Expression must not be null');

        return IfNull.ifNull(expression as string);
    }
}
