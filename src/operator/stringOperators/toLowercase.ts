import { Fields } from "../../aggregate/field";
import { AggregationExpression } from "../../aggregationExpression";
import { Assert } from "../../utils";
import { AbstractOperatorExpression } from "../abstractOperatorExpression";

export class ToLower extends AbstractOperatorExpression {
    static valueOf(fieldReference: string): ToLower
    static valueOf(expression: AggregationExpression): ToLower
    static valueOf(expression: Record<string, any>): ToLower
    static valueOf(value: unknown) {
        Assert.notNull(value, 'Value must not be null');
        if (typeof value === 'string') {
            return new ToLower(Fields.field(value));
        }
        return new ToLower(value);
    }

    public static lower(value: string): ToLower {
        Assert.notNull(value, "Value must not be null");
        return new ToLower(value);
    }


    private constructor(input: unknown) {
        super(input);
    }
    protected override getMongoMethod(): string {
        return '$toLower';
    }
}
