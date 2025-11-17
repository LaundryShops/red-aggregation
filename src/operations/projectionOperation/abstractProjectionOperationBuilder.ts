import { Document } from "mongodb";
import { AggregationOperationContext } from "../../aggregate/aggregateOperationContext/aggregationOperationContext";
import { AggregateOperation } from "../../aggregateOperation";
import { ProjectionOperation } from "./projectionOperation";
import { Assert } from "../../utils";
import { Cond } from "../../operator/conditionalOperators/cond";
import { IfNull } from "../../operator/conditionalOperators/ifNull";

export abstract class AbstractProjectionOperationBuilder extends AggregateOperation {
    private readonly _value: any;
    private readonly _operation: ProjectionOperation;

    abstract as(alias: string): ProjectionOperation;

    abstract applyCondition(cond: Cond): ProjectionOperation;
    abstract applyCondition(ifNull: IfNull): ProjectionOperation;

    constructor(value: any, operation: ProjectionOperation) {
        super();

        Assert.notNull(value, 'Value must not be null or empty');
        Assert.notNull(operation, 'Projection operation must not be null');

        this._value = value;
        this._operation = operation;
    }

    get operation() {
        return this._operation;
    }

    get value(): any {
        return this._value
    }

    toDocument(context: AggregationOperationContext): Document {
        return this.operation.toDocument(context);
    }

    getOperator(): string { return ''; }

}