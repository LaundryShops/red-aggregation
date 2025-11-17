import { Document } from "mongodb";
import { Field, Fields } from "../../aggregate/field";
import { AggregationExpression } from "../../aggregationExpression";
import { AggregationOperationContext } from "../../aggregate/aggregateOperationContext/aggregationOperationContext";
import { Assert } from "../../utils";
import { NestedDelegatingExpressionAggregationOperationContext } from "../../aggregate/aggregateOperationContext/nestedDelegatingExpressionAggregationOperationContext";
import { ExposedFields } from "../../aggregate/field/exposeFields";

export interface LetBuilder {
    andApply(expression: AggregationExpression): Let;
    andApply(expression: Record<string, any>): Let;
}

export class ExpressionVariable {
    private readonly variableName: string | null;
    private readonly expression: any | null;

    static newVariable(variableName: string) {
        Assert.notNull(variableName, "Variable name must not be null");
        return new ExpressionVariable(variableName, null);
    }

    private constructor(variableName: string | null, expression: any | null) {
        this.variableName = variableName;
        this.expression = expression;
    }

    forField(field: string) {
        return new ExpressionVariable(this.variableName, Fields.field(field));
    }

    forExpression(expression: AggregationExpression): ExpressionVariable
    forExpression(expression: Record<string, any>): ExpressionVariable
    forExpression(expression: unknown) {
        return new ExpressionVariable(this.variableName, expression);
    }

    get _variableName() {
        return this.variableName;
    }

    get _expression() {
        return this.expression;
    }
}

export class Let extends AggregationExpression {
    private readonly vars: ExpressionVariable[];
    private readonly expression: AggregationExpression | Record<string, any> | null;

    private constructor(vars: ExpressionVariable[], expression: AggregationExpression | null)
    private constructor(vars: ExpressionVariable[], expression: Record<string, any> | null)
    private constructor(vars: ExpressionVariable[], expression: Record<string, any> | AggregationExpression | null) {
        super();
        this.vars = vars;
        this.expression = expression;
    }

    static just(...variables: ExpressionVariable[]) {
        return new Let([...variables], null);
    }

    static define(variables: ExpressionVariable[]): LetBuilder;
    static define(...variables: ExpressionVariable[]): LetBuilder;
    static define(variable: ExpressionVariable | ExpressionVariable[], ...variables: ExpressionVariable[]) {
        if (!Array.isArray(variable)) {
            return this.define([variable, ...variables]);
        }

        Assert.notNull(variables, "Variables must not be null");

        return new class implements LetBuilder {
            andApply(expression: AggregationExpression): Let;
            andApply(expression: Record<string, any>): Let;
            andApply(expression: AggregationExpression | Record<string, any>): Let {
                Assert.notNull(expression, "Expression must not be null");
                return new Let(variable, expression);
            }

        }
    }

    toDocument(context: AggregationOperationContext): import("bson").Document {
        const exposedFields = ExposedFields.synthetic(Fields.fields(...this.getVariableNames()));
        return this.toLet(exposedFields, context);
    }

    getVariableNames(): string[] {
        const varNames: string[] = [];

        for (let i = 0; i < this.vars.length; i++) {
            varNames[i] = this.vars[i]._variableName!;
        }

        return varNames;
    }

    private toLet(exposedFields: ExposedFields, context: AggregationOperationContext) {
        let letExpression: Document = {};
        let mappedVars: Document = {};

        for (const v of this.vars) {
            const mapped = this.getMappedVariable(v, context);
            mappedVars = Object.assign(mappedVars, mapped);
        }

        letExpression['vars'] = mappedVars;
        if (this.expression !== null) {
            const operationContext = context.inheritAndExpose(exposedFields);
            letExpression['in'] = this.getMappedIn(operationContext);
        }

        return {
            '$let': letExpression
        }
    }

    private getMappedVariable(vars: ExpressionVariable, context: AggregationOperationContext) {
        if (vars._expression instanceof AggregationExpression) {
            return {
                [vars._variableName!]: vars._expression?.toDocument(context)
            }
        }

        if (vars._expression instanceof Field) {
            return {
                [vars._variableName!]: context.getReference(vars._expression).toString(),
            }
        }

        return { [vars._variableName!]: vars._expression }
    }

    private getMappedIn(context: AggregationOperationContext) {
        if (this.expression instanceof AggregationExpression) {
            return this.expression.toDocument(new NestedDelegatingExpressionAggregationOperationContext(context,
                this.vars.map(elm => Fields.field(elm._variableName!))
            ))
        }

        return this.expression;
    }
}