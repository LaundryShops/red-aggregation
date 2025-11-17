import { Document } from "mongodb";
import { AggregationExpression } from "../../aggregationExpression";
import { AggregationOperationContext } from "../../aggregate/aggregateOperationContext/aggregationOperationContext";
import { Field, Fields } from "../../aggregate/field";
import { Assert, isMongoDocument } from "../../utils";

export interface OtherwiseBuilder {
    otherwise(fieldReference: string): Cond;
    otherwise(fieldReference: Field): Cond;
    otherwise(expression: AggregationExpression): Cond;
    otherwise<T>(otherwiseValue: T): Cond;
}

export interface ThenBuilder {
    then<T>(value: T): OtherwiseBuilder;

    thenValueOf(fieldReference: string): OtherwiseBuilder;
    thenValueOf(fieldReference: Field): OtherwiseBuilder;
    thenValueOf(expression: AggregationExpression): OtherwiseBuilder;
    thenValueOf(expression: Record<string, any>): OtherwiseBuilder;
}

export interface WhenBuilder {
    when(booleanExpression: Document): ThenBuilder;
    when(booleanField: string): ThenBuilder;
    when(booleanField: Field): ThenBuilder;
    when(expression: AggregationExpression): ThenBuilder;
    when(expression: Record<string, any>): ThenBuilder;
}

class ConditionalExpressionBuilder implements WhenBuilder, ThenBuilder, OtherwiseBuilder {
    private condition: null | any;
    private thenValue: null | any;

    private constructor() { }

    static newBuilder(): ConditionalExpressionBuilder {
        return new ConditionalExpressionBuilder();
    }

    otherwise(fieldReference: string): Cond;
    otherwise(fieldReference: Field): Cond;
    otherwise(expression: AggregationExpression): Cond;
    otherwise<T>(otherwiseValue: T): Cond;
    otherwise(otherwiseValue: unknown): Cond {
        Assert.notNull(otherwiseValue, "Value must not be null");
        Assert.notNull(this.condition, "Condition value needs to be set first");
        Assert.notNull(this.thenValue, "Then value needs to be set first");

        // if (typeof otherwiseValue === 'string') {
        //     return Cond.newCond(this.condition, this.thenValue, Fields.field(otherwiseValue));
        // }

        return Cond.newCond(this.condition, this.thenValue, otherwiseValue);
    }

    then<T>(value: T): OtherwiseBuilder {
        Assert.notNull(value, 'ThenValue must not be null');

        this.thenValue = value;
        return this;
    }

    thenValueOf(fieldReference: string): OtherwiseBuilder;
    thenValueOf(fieldReference: Field): OtherwiseBuilder;
    thenValueOf(expression: AggregationExpression): OtherwiseBuilder;
    thenValueOf(expression: Record<string, any>): OtherwiseBuilder;
    thenValueOf(expression: unknown): OtherwiseBuilder {
        Assert.notNull(expression, 'ThenValueOf must not be null');
        // if (typeof expression === 'string') {
        //     this.thenValue = Fields.field(expression);
        //     return this;
        // }

        this.thenValue = expression;
        return this;
    }

    when(booleanExpression: Document): ThenBuilder;
    when(booleanField: string): ThenBuilder;
    when(booleanField: Field): ThenBuilder;
    when(expression: AggregationExpression): ThenBuilder;
    when(expression: Record<string, any>): ThenBuilder;
    when(expression: unknown): ThenBuilder {
        Assert.notNull(expression, 'Expression must not be null');

        // if (typeof expression === 'string') {
        //     this.condition = Fields.field(expression);
        //     return this;
        // }

        this.condition = expression;
        return this;
    }

}

export class Cond extends AggregationExpression {
    private readonly condition: any;
    private readonly thenValue: any;
    private readonly otherwiseValue: any;


    private constructor(condition: Field, thenValue: any, otherwiseValue: any)
    // private constructor(condition: CriteriaDefinition, thenValue: any, otherwiseValue: any)
    private constructor(condition: any, thenValue: any, otherwiseValue: any)
    private constructor(condition: any, thenValue: any, otherwiseValue: any) {
        super()
        Assert.notNull(condition, "Condition must not be null");
        Assert.notNull(thenValue, "Then value must not be null");
        Assert.notNull(otherwiseValue, "Otherwise value must not be null");

        this.assertNotBuilder(condition, 'Condition');
        this.assertNotBuilder(thenValue, 'Then Value');
        this.assertNotBuilder(otherwiseValue, 'Otherwise Value');

        this.condition = condition;
        this.thenValue = thenValue;
        this.otherwiseValue = otherwiseValue;
    }

    static newCond(condition: any, thenValue: any, otherwiseValue: any) {
        return new Cond(condition, thenValue, otherwiseValue);
    }

    static newBuilder(): WhenBuilder {
        return ConditionalExpressionBuilder.newBuilder();
    }

    static when(booleanExpression: Document): ThenBuilder;
    static when(booleanField: string): ThenBuilder;
    static when(expression: AggregationExpression): ThenBuilder;
    static when(expression: Record<string, any>): ThenBuilder;
    static when(expression: unknown) {
        return ConditionalExpressionBuilder.newBuilder().when(expression as string);
    }

    private resolve(context: AggregationOperationContext, value: any) {
        if (isMongoDocument(value)) {
            return context.getMappedObject(value);
        }

        return context.getReference(value as Field).toString();
    }

    // private resolveCriteria() {}

    private resolveValue(context: AggregationOperationContext, value: any) {
        if (value instanceof Field || isMongoDocument(value)) {
            return this.resolve(context, value);
        }

        if (value instanceof AggregationExpression) {
            return value.toDocument(context);
        }

        if (value instanceof Cond) {
            return value.toDocument(context)
        }

        return context.getMappedObject({ '$set': value })['$set'];
    }

    private resolveCriteria(context: AggregationOperationContext, value: any) {

        if (isMongoDocument(value) || value instanceof Field) {
            return this.resolve(context, value);
        }

        if (value instanceof AggregationExpression) {
            return value.toDocument(context);
        }

        // if (value instanceof CriteriaDefinition) {}
        throw new Error(`Invalid value in condition; Supported: Document, Field references, got: ${value}`)
    }

    toDocument(context: AggregationOperationContext): Document;
    toDocument(context: AggregationOperationContext, value: any): Document;
    toDocument(context: AggregationOperationContext, value?: unknown) {
        const condObject: Document = {};

        condObject['if'] = this.resolveCriteria(context, this.condition);
        condObject['then'] = this.resolveValue(context, this.thenValue);
        condObject['else'] = this.resolveValue(context, this.otherwiseValue);

        return { '$cond': condObject }
    }

    // private getClauses(context: AggregationOperationContext, key: string, predicate: any): Array<any>;
    // private getClauses(context: AggregationOperationContext, mappedObject: Document): Array<any>;
    // private getClauses(context: AggregationOperationContext, mappedObject: Document | string, predicate?: any) {
    //     if (typeof mappedObject === 'object') {
    //         const clause: any[] = [];
    //         for (const key of Object.keys(mappedObject)) {
    //             const predicate = mappedObject[key];
    //             clause.concat(...this.getClauses(context, key, predicate));
    //         }

    //         return clause;
    //     }

    //     const key = mappedObject;
    //     const clauses: any[] = [];

    //     if (Array.isArray(predicate)) {
    //         const args: any[] = [];
    //         for (const clause of predicate) {
    //             if (isMongoDocument(clause)) {
    //                 const clauses = this.getClauses(context, clause);
    //                 args.concat(...clauses)
    //             }
    //         }
    //         clauses.push({ [key]: args })
    //     } else if (isMongoDocument(predicate)) {
    //         const nested = predicate as Document;
    //         for (const s of Object.keys(nested)) {
    //             if (!this.isKeyword(s)) {
    //                 continue;
    //             }

    //             const args: any[] = [];
    //             args.push(`$${key}`);
    //             args.push(nested[s]);
    //             clauses.push({ [s]: args });
    //         }
    //     } else if (!this.isKeyword(key)) {
    //         const args: any[] = [];
    //         args.push(`$${key}`);
    //         args.push(predicate);
    //         clauses.push({ '$eq': args });
    //     }

    //     return clauses;
    // }

    // private isKeyword(candidate: string) {
    //     return candidate.startsWith('$');
    // }

    private assertNotBuilder(toCheck: any, name: string) {
        Assert.isTrue(
            !(toCheck instanceof ConditionalExpressionBuilder),
            `${name} must not be of type ${ConditionalExpressionBuilder.name}`
        );
    }
}
