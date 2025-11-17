import { Document } from "mongodb";
import { AggregationOperationContext } from "../../aggregate/aggregateOperationContext/aggregationOperationContext";
import { AbstractProjection } from "./abstractProjection";
import { Field, Fields } from "../../aggregate/field";
import { AggregationExpression } from "../../aggregationExpression";
import { FieldProjection } from "./fieldProjection";
import { ProjectionOperation } from "./projectionOperation";

export class ArrayProjection extends AbstractProjection {
    private readonly target: Field;
    private readonly projections: any[];

    constructor(target: Field, projections: any[]) {
        super(target);
        this.target = target;
        this.projections = projections;
    }

    toDocument(context: AggregationOperationContext): Document {
        const targetName = this.target.getName();
        const arrayProjection = this.projections.map(projection => this.buildArrayProjection(projection, context));

        return { [targetName]: arrayProjection }
    }

    private buildArrayProjection<T>(projection: T, context: AggregationOperationContext) {
        if (projection instanceof Field) {
            return context.getReference(projection).toString();
        }

        if (projection instanceof AggregationExpression) {
            return projection.toDocument(context);
        }

        if (projection instanceof FieldProjection) {
            return context.getReference(projection.getExposedField().getTarget()).toString();
        }

        return projection;
    }
}

export class ArrayProjectionBuilder {
    private readonly projections: any[] = [];
    private target: ProjectionOperation;

    constructor(target: ProjectionOperation) {
        this.target = target;
    }

    and(field: Field): ArrayProjectionBuilder;
    and(expression: AggregationExpression): ArrayProjectionBuilder;
    and(expression: Document): ArrayProjectionBuilder;
    and(expression: unknown) {
        this.projections.push(expression);
        return this;
    }

    as(name: string) {
        const arrayProjection = new ArrayProjection(
            Fields.field(name),
            this.projections
        );

        return new ProjectionOperation(
            this.target.projections,
            [arrayProjection]
        );
    }
}
