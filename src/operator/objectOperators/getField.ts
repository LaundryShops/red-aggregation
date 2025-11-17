import { Document } from 'mongodb';
import { Field, Fields } from "../../aggregate/field";
import { AggregationOperationContext } from "../../aggregate/aggregateOperationContext/aggregationOperationContext";
import { AbstractOperatorExpression } from "../abstractOperatorExpression";
import { AggregationExpression } from '../../aggregationExpression';

export class GetField extends AbstractOperatorExpression {
    constructor(value: any) {
        super(value);
    }

    static getField(fieldName: string): GetField
    static getField(fieldName: Field): GetField
    static getField(fieldName: string | Field) {
        return new GetField(new Map().set("field", fieldName));
    }

    protected isArgumentMap(): boolean {
        return this.values instanceof Map;
    }

    public of (expression: string): GetField
    public of (expression: Record<string, any>): GetField
    public of (expression: AggregationExpression): GetField
    public of (expression: unknown) {
        if (typeof expression === 'string') {
            return this._of(Fields.field(expression));
        }
        return this._of(expression);
    }

    private _of(fieldRef: unknown) {
        return new GetField(this.append("input", fieldRef));
    }

    toDocument(context: AggregationOperationContext): Document {
        if (this.isArgumentMap() && this.get('field') instanceof Field) {
            const appended = this.append('field', context.getReference((this.get('field') as Field)).getRaw())
            return new GetField(appended).toDocument(context)
        }
        return super.toDocument(context);
    }

    protected getMongoMethod(): string {
        return "$getField";
    }

}
