import { Fields } from "../../aggregate/field";
import { AggregationExpression } from "../../aggregationExpression";
import { And } from "./and";
import { Not } from "./not";
import { Or } from "./or";

export class BooleanOperatorsFactory {
    private readonly field: string | null;
    private readonly expression: AggregationExpression | null;

    constructor(field: string) 
    constructor(expression: AggregationExpression) 
    constructor(fieldOrExpression: AggregationExpression | string) {
        if (typeof fieldOrExpression === 'string') {
            this.field = fieldOrExpression;
            this.expression = null;
            return;
        }
        this.field = null;
        this.expression = fieldOrExpression;
    }

    and(field: string): And;
    and(expression: AggregationExpression): And;
    and(field: string | AggregationExpression) {
        if (typeof field === 'string') {
            return this.createAnd().andField(field);
        }
        return this.createAnd().andExpression(field);
    }

    private createAnd() {
        return this.usesFieldRef()
            ? And.and(Fields.field(this.field!))
            : And.and(this.expression)
    }

    or(field: string): Or
    or(expression: AggregationExpression): Or
    or(field: string | AggregationExpression) {
        if (typeof field === 'string') {
            return this.createOr().orField(field);
        }
        return this.createOr().orExpression(field);
    }

    private createOr() {
        return this.usesFieldRef()
            ? Or.or(Fields.field(this.field!))
            : Or.or(this.expression)
    }

    not(field: string): Not
    not(expression: AggregationExpression): Not
    not(field: string | AggregationExpression) {
        if (typeof field === 'string') {
            return this.createNot().notField(field);
        }
        return this.createNot().notExpression(field);
    }

    private createNot() {
        return this.usesFieldRef()
            ? Not.not(Fields.field(this.field!))
            : Not.not(this.expression)
    }

    private usesFieldRef() {
        return this.field !== null;
    }
}
