import { Fields } from "../../aggregate/field";
import { AggregationExpression } from "../../aggregationExpression";
import { AbstractOperatorExpression } from "../abstractOperatorExpression";

export class ArrayToObject extends AbstractOperatorExpression {
    public static arrayToObject(value: any) {
        return new ArrayToObject([value])
    }

    public static arrayValueOfToObject(fieldReference: string): ArrayToObject;
    public static arrayValueOfToObject(expression: AggregationExpression): ArrayToObject;
    public static arrayValueOfToObject(expression: Record<string, any>): ArrayToObject;
    public static arrayValueOfToObject(value: unknown) {
        if(typeof value === 'string') {
            return new ArrayToObject(Fields.field(value));
        }
        return new ArrayToObject([value]);
    }

    private constructor(value: any) {
        super(value);
    }

    protected getMongoMethod(): string {
        return '$arrayToObject'
    }

}