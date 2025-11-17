import { Fields } from "../../aggregate/field";
import { AggregationExpression } from "../../aggregationExpression";
import { Assert } from "../../utils";
import { AbstractOperatorExpression } from "../abstractOperatorExpression";

export class ToUpper extends AbstractOperatorExpression {
    static valueOf(fieldReference: string): ToUpper
    static valueOf(expression: AggregationExpression): ToUpper
    static valueOf(expression: Record<string, any>): ToUpper
    static valueOf(value: unknown) {
        Assert.notNull(value, 'Value must not be null');
        if (typeof value === 'string') {
            return new ToUpper(Fields.field(value));
        }
        return new ToUpper(value);
    }

    public static lower(value: string): ToUpper {
        Assert.notNull(value, "Value must not be null");
        return new ToUpper(value);
    }


    private constructor(input: unknown) {
        super(input);
    }
    protected override getMongoMethod(): string {
        return '$toUpper';
    }
}
