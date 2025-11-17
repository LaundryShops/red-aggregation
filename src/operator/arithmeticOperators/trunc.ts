import { Fields } from "../../aggregate/field";
import { Assert } from "../../utils";
import { AbstractOperatorExpression } from "../abstractOperatorExpression";

export class Trunc extends AbstractOperatorExpression{
    static valueOf(fieldReference: string): Trunc
    static valueOf(number: number): Trunc
    static valueOf(expression: Record<string, any>): Trunc
    static valueOf(input: unknown) {
        if (typeof input === 'string') {
            return new Trunc(Fields.field(input));
        }
        return new Trunc(input);
    }

    private constructor(input: unknown) {
        Assert.notNull(input, 'FieldReference must not be null');
        super(input);

    }

    protected override getMongoMethod(): string {
        return '$trunc';
    }
}
