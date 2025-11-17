import { Document } from "mongodb";
import { AggregationExpression } from "../../aggregationExpression";
import { AggregationOperationContext } from "../../aggregate/aggregateOperationContext/aggregationOperationContext";
import { Assert } from "../../utils";
import { Field } from "../../aggregate/field";
import { AbstractOperatorExpression } from "../abstractOperatorExpression";

export class Switch extends AbstractOperatorExpression {
    private constructor(values: Map<string, any>) {
        super(values);
    }

    static switchCases(conditions: Array<CaseOperator>): Switch;
    static switchCases(...conditions: Array<CaseOperator>): Switch;
    static switchCases(input: Array<CaseOperator> | CaseOperator, ...inputs: Array<CaseOperator>) {
        if (Array.isArray(input)) {
            return new Switch(new Map().set('branches', input))
        }
        return this.switchCases([input, ...inputs])
    }
    
    protected getMongoMethod(): string {
        return '$switch';
    }

    defaultTo<T>(value: T) {
        return new Switch(this.append('default', value));
    }
}

interface ThenBuilder {
    then<T = object>(value: T): CaseOperator;
}

export class CaseOperator extends AggregationExpression {
    private readonly when: AggregationExpression;
    private readonly then: Record<string, any>;

    private constructor(when: AggregationExpression, then: Record<string, any>) {
        super();
        this.when = when;
        this.then = then;
    }

    static thenBuilder(condition: AggregationExpression): ThenBuilder;
    static thenBuilder(condition: Document): ThenBuilder;
    static thenBuilder(condition: AggregationExpression) {
        Assert.notNull(condition, 'Condition must not be null');
        return new class implements ThenBuilder {
            then<T = object>(value: T): CaseOperator {
                Assert.notNull(value, 'Value must not be null');
                return new CaseOperator(condition, value as object); 
            }
        };
    }

    toDocument(context: AggregationOperationContext): Document {
        const when = this.when.toDocument(context);
        const document: Document = {'case': when };

        if (this.then instanceof AggregationExpression) {
            document['then'] = this.then.toDocument(context);
        } else if (this.then instanceof Field) {
            document['then'] = context.getReference(this.then).toString()
        } else {
            document['then'] = this.then;
        }

        return document;
    }

}


