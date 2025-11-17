import { Document } from "mongodb";
import { Field, Fields } from "../../aggregate/field";
import { AggregationExpression } from "../../aggregationExpression";
import { AggregationOperationContext } from "../../aggregate/aggregateOperationContext/aggregationOperationContext";
import { Assert, isMongoDocument } from "../../utils";

interface OrBuilder {
    orIfNull(fieldReference: string): ThenBuilder;
    orIfNull(expression: AggregationExpression): ThenBuilder;
    orIfNull(expression: Record<string, any>): ThenBuilder;
}
export interface ThenBuilder extends OrBuilder {
    then<T>(value: T): IfNull;

    thenValueOf(fieldReference: string): IfNull;
    thenValueOf(expression: AggregationExpression): IfNull;
    thenValueOf(expression: Record<string, any>): IfNull;
}
interface IfNullBuilder {
    ifNull(fieldReference: string): ThenBuilder;
    ifNull(expressino: AggregationExpression): ThenBuilder;
    ifNull(expression: Record<string, any>): ThenBuilder;
}

class IfNullOperationBuilder implements IfNullBuilder, ThenBuilder {
    private conditions: Array<any>;

    private constructor() {
        this.conditions = [];
    }

    static newBuilder() {
        return new IfNullOperationBuilder();
    }

    then<T>(value: T): IfNull {
        return new IfNull(this.conditions, value as object);
    }

    thenValueOf(fieldReference: string): IfNull;
    thenValueOf(expression: AggregationExpression): IfNull;
    thenValueOf(expression: Record<string, any>): IfNull;
    thenValueOf(input: unknown): IfNull {
        Assert.notNull(input, "Input must not be null");

        if (typeof input === 'string') {
            return new IfNull(this.conditions, Fields.field(input));
        }

        return new IfNull(this.conditions, input as object)
    }

    orIfNull(field: string): ThenBuilder;
    orIfNull(expressino: AggregationExpression): ThenBuilder;
    orIfNull(expression: Record<string, any>): ThenBuilder;
    orIfNull(input: unknown) {
        return this.ifNull(input as string);
    }

    ifNull(field: string): ThenBuilder;
    ifNull(expressino: AggregationExpression): ThenBuilder;
    ifNull(expression: Record<string, any>): ThenBuilder;
    ifNull(input: unknown) {
        Assert.notNull(input, 'Input must not be null');

        if (typeof input === 'string') {
            this.conditions.push(Fields.field(input));
            return this;
        }

        this.conditions.push(input);
        return this;
    }
}

export class IfNull extends AggregationExpression {
    private readonly condition: any;
    private readonly value: any;

    constructor(condition: any, value: any) {
        super()
        this.condition = condition;
        this.value = value;
    }

    static ifNull(fieldReference: string): ThenBuilder
    static ifNull(expression: AggregationExpression): ThenBuilder
    static ifNull(expression: Record<string, any>): ThenBuilder
    static ifNull(input: unknown) {
        return IfNullOperationBuilder.newBuilder().ifNull(input as string);
    }

    toDocument(context: AggregationOperationContext): Document {
        const list: Array<any> = [];

        if (Array.isArray(this.condition)) {
            for (const val of this.condition) {
                list.push(this.mapCondition(val, context));
            }
        } else {
            list.push(this.mapCondition(this.condition, context));
        }

        list.push(this.resolve(this.value, context));
        return {
            "$ifNull": list
        }
    }

    private mapCondition<T>(condition: T, context: AggregationOperationContext) {
        if (condition instanceof Field) {
            return context.getReference(condition).toString();
        } else if (condition instanceof AggregationExpression) {
            return condition.toDocument(context);
        } else {
            return condition;
        }
    }

    private resolve<T>(value: T, context: AggregationOperationContext) {
        if (value instanceof Field) {
            return context.getReference(value).toString();
        } else if (value instanceof AggregationExpression) {
            return value.toDocument(context);
        } else if (isMongoDocument(value)) {
            return value;
        }

        return context.getMappedObject({
            '$set': value
        })['$set'];
    }
}

