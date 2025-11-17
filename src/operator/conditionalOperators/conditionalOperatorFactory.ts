import { AggregationExpression } from "../../aggregationExpression";
import { Assert } from "../../utils";
import { Cond, OtherwiseBuilder, ThenBuilder } from "./cond";

export class ConditionOperatorFactory {
    private readonly fieldReference: string | null;
    private readonly expression: AggregationExpression | Record<string, any> | null;
    // private readonly CriteriaDefinition criteriaDefinition: | null;

    constructor(fieldReference: string)
    constructor(expression: AggregationExpression)
    constructor(expression: Record<string, any>)
    constructor(expression: unknown) {
        Assert.notNull(expression, 'Expression must not be null');

        if (typeof expression === 'string') {
            this.fieldReference = expression
            this.expression = null;
            return;
        }

        this.fieldReference = null;
        this.expression = expression as AggregationExpression;
    }

    thenValueOf(fieldReference: string): OtherwiseBuilder;
    thenValueOf(expression: AggregationExpression): OtherwiseBuilder;
    thenValueOf(expression: Record<string, any>): OtherwiseBuilder;
    thenValueOf(expression: unknown) {
        Assert.notNull(expression, 'Expression must not be null');

        return this.createThenBuilder().then(expression);
    }

    then<T>(value: T): OtherwiseBuilder {
        Assert.notNull(value, 'ThenValue must not be null');

        return this.createThenBuilder().then(value);
    }

    private createThenBuilder(): ThenBuilder {
        if (this.usesFieldRef()) {
            return Cond.newBuilder().when(this.fieldReference!);
        }

        return Cond.newBuilder().when(this.expression!);
    }

    private usesFieldRef() {
        return this.fieldReference != null;
    }
}
