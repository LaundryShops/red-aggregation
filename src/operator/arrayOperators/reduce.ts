import { Document } from "mongodb";
import { AggregationExpression } from "../../aggregationExpression";
import { AggregationOperationContext } from "../../aggregate/aggregateOperationContext/aggregationOperationContext";
import { Field, Fields } from "../../aggregate/field";
import { AggregationVariable } from "../../aggregationVariable";
import { Assert, isMongoDocument } from "../../utils";

export interface InitialValueBuilder {
    withInitialValue: (initialValue: any) => ReduceBuilder
};
export interface ReduceBuilder {
    reduce(expression: AggregationExpression): Reduce;
    reduce(expression: Record<string, any>): Reduce;
    reduce(...expressions: Array<AggregationExpression>): Reduce;
    reduce(...expressions: Array<Record<string, any>>): Reduce;
}

export class Reduce implements AggregationExpression {
    private readonly input: any;
    private readonly initialValue: any;
    private readonly reduceExpression: Array<PropertyExpression | AggregationExpression>;

    private constructor(input: any, initialValue: any, reduceExpression: any[]) {
        this.input = input;
        this.initialValue = initialValue;
        this.reduceExpression = reduceExpression;
    }

    static arrayOf(fieldReference: string): InitialValueBuilder
    static arrayOf(expression: AggregationExpression): InitialValueBuilder
    static arrayOf(expression: Record<string, any>): InitialValueBuilder
    static arrayOf(value: unknown) {
        Assert.notNull(value, 'Value must not be null');
        if (typeof value === 'string') {
            return new class implements InitialValueBuilder {
                withInitialValue(initialValue: any): ReduceBuilder {
                    Assert.notNull(initialValue, 'Initial value must not be null');
                    return new class implements ReduceBuilder {
                        reduce(...expressions: Array<AggregationExpression | Record<string, any>>): Reduce {
                            Assert.notNull(expressions, "AggregationExpression must not be null");
                            return new Reduce(Fields.field(value), initialValue, expressions);
                        }
                    }
                }
            }

        }
        return new class implements InitialValueBuilder {
            withInitialValue(initialValue: any): ReduceBuilder {
                return new class implements ReduceBuilder {
                    reduce(...expressions: Array<AggregationExpression | Record<string, any>>): Reduce {
                        Assert.notNull(expressions, "AggregationExpression must not be null");
                        return new Reduce(value, initialValue, expressions);
                    }
                }
            }
        }
    }

    toDocument(context: AggregationOperationContext): Document;
    toDocument(context: AggregationOperationContext, value: any): Document;
    toDocument(context: AggregationOperationContext, value?: unknown): Document {
        const document: Document = {};

        document['input'] = this.getMappedValue(this.input, context);
        document['initialValue'] = this.getMappedValue(this.initialValue, context);

        const firstExpr = this.reduceExpression[0];

        if (firstExpr instanceof PropertyExpression) {
            const properties: Document = {};

            for (const expr of this.reduceExpression) {
                const exprDoc = expr.toDocument(context);
                Object.assign(properties, exprDoc);
            }
            document['in'] = properties;
        } else {
            if (firstExpr instanceof AggregationExpression) {
                document['in'] = firstExpr.toDocument(context);
            } else {
                document['in'] = firstExpr;
            }
        }

        return { $reduce: document };
    }

    private getMappedValue(value: any, context: AggregationOperationContext) {
        if (isMongoDocument(value)) {
            return value;
        }
        if (value instanceof AggregationExpression) {
            return value.toDocument(context);
        } else if (value instanceof Field) {
            return context.getReference(value).toString();
        } else {
            const wrapped = context.getMappedObject({ "__val__": value });
            return wrapped["__val__"];
        }
    }
}

export class PropertyExpression implements AggregationExpression {
    private readonly propertyName: string;
    private readonly aggregationExpression: AggregationExpression;

    constructor(propertyName: string, aggregationExpression: AggregationExpression) {
        Assert.notNull(propertyName, 'Property name must not be null');
        Assert.notNull(aggregationExpression, 'Aggregation expression must not be null');

        this.propertyName = propertyName;
        this.aggregationExpression = aggregationExpression;
    }

    static property(name: string): AsBuilder {
        return new class {
            definedAs(expression: AggregationExpression): PropertyExpression {
                return new PropertyExpression(name, expression);
            }
        }
    }

    toDocument(context: AggregationOperationContext): Document {
        return {
            [this.propertyName]: this.aggregationExpression.toDocument(context)
        }
    }
}

interface AsBuilder {
    definedAs(expression: AggregationExpression): PropertyExpression;
}

export class VariableImpl extends AggregationVariable implements AggregationVariable {
    constructor(
        private name: string,
        private target: string
    ) {
        super()
    }

    getName(): string {
        return this.name;
    }

    getTarget(): string {
        return this.target;
    }

    isInternal(): boolean {
        return true;
    }

    toString(): string {
        return this.getName();
    }

    /**
     * Create a Field reference to a given property prefixed with the Variable identifier.
     * eg. $$value.product
     * 
     * @param property must not be null.
     * @return never null.
     */
    referringTo(property: string): Field {
        const self = this;

        return new class extends Field {
            getName(): string {
                return self.getName() + "." + property;
            }

            getTarget(): string {
                return self.getTarget() + "." + property;
            }

            isAliased(): boolean {
                return false;
            }

            toString(): string {
                return this.getName();
            }

        }
    }
}

export const Variable = {
    THIS: new VariableImpl("THIS", "$$this"),
    VALUE: new VariableImpl("VALUE", "$$value"),

    /**
     * Get all variable values
     */
    values(): VariableImpl[] {
        return [this.THIS, this.VALUE];
    },

    /**
     * Check if a field is a variable
     */
    isVariable(field: Field): boolean {
        for (const variable of this.values()) {
            if (field.getTarget().startsWith(variable.getTarget())) {
                return true;
            }
        }
        return false;
    }
} as const;

