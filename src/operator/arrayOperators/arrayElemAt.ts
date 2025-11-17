import { Fields } from "../../aggregate/field";
import { AggregationExpression } from "../../aggregationExpression";
import { Assert } from "../../utils";
import { AbstractOperatorExpression } from "../abstractOperatorExpression";

export class ArrayElemAt extends AbstractOperatorExpression {
    public static arrayOf(fieldReference: string): ArrayElemAt;
    public static arrayOf(expression: AggregationExpression): ArrayElemAt;
    public static arrayOf(expression: Record<string, any>): ArrayElemAt;
    public static arrayOf(value: unknown) {
        Assert.notNull(value, 'Value must not be null');
        if (typeof value === 'string') {
            return new ArrayElemAt(this.asFields(value))
        }
        return new ArrayElemAt([value])
    }
    
    private constructor(value: any) {
        super(value);
    }

    elementAt(index: number): ArrayElemAt;
    elementAt(arrayFieldReference: string): ArrayElemAt;
    elementAt(expression: AggregationExpression): ArrayElemAt;
    elementAt(expression: Record<string, any>): ArrayElemAt;
    elementAt(value: unknown) {
        if (typeof value === 'number') {
            return new ArrayElemAt(this.append(value));
        }
        if (typeof value === 'string') {
            return new ArrayElemAt(this.append(Fields.field(value)));
        }
        return new ArrayElemAt(this.append(value));
    }

    protected getMongoMethod(): string {
        return '$arrayElemAt';
    }
    
}
