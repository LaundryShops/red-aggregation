import { Fields } from "../../aggregate/field";
import { Assert } from "../../utils";
import { AbstractOperatorExpression } from "../abstractOperatorExpression";

export class Floor extends AbstractOperatorExpression{
    static valueOf(fieldReference: string): Floor
    static valueOf(number: number): Floor
    static valueOf(expression: Record<string, any>): Floor
    static valueOf(input: unknown) {
        if (typeof input === 'string') {
            return new Floor(Fields.field(input));
        } else {
            return new Floor(input);
        }
    }

    private constructor(input: unknown) {
        Assert.notNull(input, 'FieldReference must not be null');
        super(input);
    }

    protected override getMongoMethod(): string {
        return '$floor';
    }
}
