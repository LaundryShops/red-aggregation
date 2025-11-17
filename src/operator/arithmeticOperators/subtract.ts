import { Fields } from "../../aggregate/field";
import { Assert } from "../../utils";
import { AbstractOperatorExpression } from "../abstractOperatorExpression";

export class Subtract extends AbstractOperatorExpression{
    static valueOf(fieldReference: string): Subtract
    static valueOf(number: number): Subtract
    static valueOf(expression: Record<string, any>): Subtract
    static valueOf(input: unknown) {
        if (typeof input === 'string') {
            return new Subtract(Fields.field(input));
        }
        return new Subtract(input);
    }

    private constructor(input: unknown) {
        Assert.notNull(input, 'FieldReference must not be null');
        super(input);

    }

    protected override getMongoMethod(): string {
        return '$subtract';
    }

    subtract(number: number): Subtract
    subtract(fieldReference: string): Subtract
    subtract(expression: Record<string, any>): Subtract
    subtract(input: number | string | Record<string, any>) {
        if (typeof input === 'string') {
            this.append(Fields.field(input))
        } else {
            this.append(input)
        }
        return this;
    }
}
