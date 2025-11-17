import { Fields } from "../../aggregate/field";
import { Assert } from "../../utils";
import { AbstractOperatorExpression } from "../abstractOperatorExpression";

export class Ceil extends AbstractOperatorExpression {
    static valueOf(fieldReference: string): Ceil
    static valueOf(number: number): Ceil
    static valueOf(expression: Record<string, any>): Ceil
    static valueOf(input: unknown) {
        if (typeof input === 'string') {
            return new Ceil(Fields.field(input));
        }
        return new Ceil(input);
    }

    private constructor(input: unknown) {
        Assert.notNull(input, 'FieldReference must not be null');
        super(input);

    }

    protected override getMongoMethod(): string {
        return '$ceil';
    }
}
