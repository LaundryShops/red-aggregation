import { Document } from "mongodb";
import { AggregationOperationContext } from "../../aggregate/aggregateOperationContext/aggregationOperationContext";
import { AggregationExpression } from "../../aggregationExpression";
import { Assert } from "../../utils";
import { ExposedField } from "../../aggregate/field/exposeField";
import { Field, Fields } from "../../aggregate/field";
import { ExposedFields } from "../../aggregate/field/exposeFields";
import { NestedDelegatingExpressionAggregationOperationContext } from "../../aggregate/aggregateOperationContext/nestedDelegatingExpressionAggregationOperationContext";

export namespace ArrayFilter {
    export interface AsBuilder {
        as(variableName: string): ConditionBuilder;
    }

    export interface ConditionBuilder {
        by(expression: string): Filter;
        by(expression: AggregationExpression): Filter;
        by(expression: Record<string, any>): Filter;
    }

    export interface InputBuilder {
        filter(field: Field): AsBuilder;
        filter(expression: AggregationExpression): AsBuilder;
        filter(expression: Record<string, any>): AsBuilder;
        filter<T>(array: Array<T>): AsBuilder;
    }
}

export class Filter extends AggregationExpression {
    private input: any | null = null;
    private _as: ExposedField | null = null;
    private condition: any | null = null;

    static filter(field: string): ArrayFilter.AsBuilder;
    static filter(field: Field): ArrayFilter.AsBuilder;
    static filter(expression: AggregationExpression): ArrayFilter.AsBuilder;
    static filter(expression: Record<string, any>): ArrayFilter.AsBuilder;
    static filter(field: string | Field | AggregationExpression | Record<string, any>) {
        Assert.notNull(field, 'Field must not be null');
        if (typeof field === 'string') {
            return this.filter(Fields.field(field))
        }
        
        return new FilterExpressionBuilder().filter(field);
    }

    /**
     * WARN: Do not create instance by new keyword.
     * Used by FilterExpressionBuilder
     */
    constructor() {
        super()
    }

    toDocument(context: AggregationOperationContext): Document {
        Assert.notNull(this._as, 'As must be set first');
        return this.toFilter(ExposedFields.from(this._as!), context)
    }

    private toFilter(exposedField: ExposedFields, context: AggregationOperationContext): Document {
        let filterExpression: Document = {};
        const operationContext = context.inheritAndExpose(exposedField);
        const mappedInput = this.getMappedInput(context);
        const mappedCondition = this.getMappedCondition(operationContext);
        filterExpression = Object.assign(filterExpression, { 'input': mappedInput });
        filterExpression['as'] = this._as?.getTarget();
        filterExpression = Object.assign(filterExpression, { 'cond': mappedCondition });

        return {
            '$filter': filterExpression
        }
    }

    private getMappedCondition(context: AggregationOperationContext) {
        if (!(this.condition instanceof AggregationExpression)) {
            return this.condition;
        }
        const nea = new NestedDelegatingExpressionAggregationOperationContext(context, [this._as!])
        return this.condition.toDocument(nea);
    }

    private getMappedInput(context: AggregationOperationContext) {
        if (this.input instanceof Field) {
            return context.getReference(this.input).toString();
        }

        if (this.input instanceof AggregationExpression) {
            return this.input.toDocument(context);
        }

        return this.input;
    }
}

export class FilterExpressionBuilder implements ArrayFilter.AsBuilder, ArrayFilter.ConditionBuilder, ArrayFilter.InputBuilder {
    private readonly _filter: Filter;

    static newBuilder() {
        return new FilterExpressionBuilder();
    }

    constructor() {
        this._filter = new Filter();
    }

    filter(field: Field): ArrayFilter.AsBuilder;
    filter(expression: AggregationExpression): ArrayFilter.AsBuilder;
    filter(expression: Record<string, any>): ArrayFilter.AsBuilder;
    filter<T>(array: Array<T>): ArrayFilter.AsBuilder;
    filter(value: unknown): ArrayFilter.AsBuilder {
        Assert.notNull(value, 'Argument must not be null');
        if (Array.isArray(value)) {
            this._filter['input'] = [...value];
            return this;
        }
        this._filter['input'] = value;
        return this;
    }

    by(expression: string): Filter;
    by(expression: AggregationExpression): Filter;
    by(expression: Record<string, any>): Filter;
    by(value: unknown): Filter {
        Assert.notNull(value, 'Argument must not be null');
        this._filter['condition'] = value
        return this._filter;
    }

    as(variableName: string): ArrayFilter.ConditionBuilder {
        Assert.notNull(variableName, 'VariableName must not be null');
        this._filter['_as'] = new ExposedField(variableName, true);
        return this;
    }
}
