import { Fields } from "../../aggregate/field";
import { AggregationExpression } from "../../aggregationExpression";
import { Assert } from "../../utils";
import { AbstractOperatorExpression } from "../abstractOperatorExpression";

export class First extends AbstractOperatorExpression {
    static first<T>(array: Array<T>) {
        return new First(array);
    }

    static firstOf(fieldReference: string): First;
    static firstOf(expression: AggregationExpression): First;
    static firstOf(expression: Record<string, any>): First;
    static firstOf(value: unknown) {
        Assert.notNull(value, 'Value must not be null');
        if (typeof value === 'string') {
            return new First(Fields.field(value))
        }
        return new First(value);
    }
    
    private constructor(value: any) {
        super(value);
    }    

    protected getMongoMethod(): string {
        return '$first';
    }

}
