import { Fields } from "../../aggregate/field";
import { Assert } from "../../utils";
import { AbstractOperatorExpression } from "../abstractOperatorExpression";

export class Log10 extends AbstractOperatorExpression{
    static valueOf(number: number): Log10
    static valueOf(fieldReference: string): Log10
    static valueOf(expression: Record<string, any>): Log10
    static valueOf(input: unknown) {
        if (typeof input === 'string') {
            return new Log10(Fields.field(input));
        }
        return new Log10(input);
    }

    private constructor(input: unknown) {
        Assert.notNull(input, 'FieldReference must not be null');
        super(input);
    }

    protected override getMongoMethod(): string {
        return '$log10';
    }
}
