import { Fields } from "../../aggregate/field";
import { Assert } from "../../utils";
import { AbstractOperatorExpression } from "../abstractOperatorExpression";

export class Ln extends AbstractOperatorExpression{
    static valueOf(fieldReference: string): Ln
    static valueOf(number: number): Ln
    static valueOf(expression: Record<string, any>): Ln
    static valueOf(input: unknown) {
        if (typeof input === 'string') {
            return new Ln(Fields.field(input));
        }
        return new Ln(input);
    }

    private constructor(input: unknown) {
        Assert.notNull(input, 'FieldReference must not be null');
        super(input);
    }

    protected override getMongoMethod(): string {
        return '$ln';
    }
}
