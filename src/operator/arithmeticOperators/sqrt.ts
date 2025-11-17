import { Fields } from "../../aggregate/field";
import { Assert } from "../../utils";
import { AbstractOperatorExpression } from "../abstractOperatorExpression";

export class Sqrt extends AbstractOperatorExpression{
    static valueOf(fieldReference: string): Sqrt
    static valueOf(number: number): Sqrt
    static valueOf(expression: Record<string, any>): Sqrt
    static valueOf(input: unknown) {
        if (typeof input === 'string') {
            return new Sqrt(Fields.field(input));
        }
        return new Sqrt(input);
    }

    private constructor(input: unknown) {
        Assert.notNull(input, 'FieldReference must not be null');
        super(input);
    }

    protected override getMongoMethod(): string {
        return '$sqrt';
    }
}
