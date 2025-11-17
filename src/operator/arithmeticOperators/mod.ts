import { Fields } from "../../aggregate/field";
import { Assert } from "../../utils";
import { AbstractOperatorExpression } from "../abstractOperatorExpression";

export class Mod extends AbstractOperatorExpression {
    static valueOf(fieldReference: string): Mod
    static valueOf(number: number): Mod
    static valueOf(expression: Record<string, any>): Mod
    static valueOf(input: unknown) {
        if (typeof input === 'string') {
            return new Mod(Fields.field(input));
        }
        return new Mod(input);
    }

    private constructor(input: unknown) {
        Assert.notNull(input, 'FieldReference must not be null');
        super(input);

    }

    protected override getMongoMethod(): string {
        return '$mod';
    }
    
    mod(fieldReference: `$${string}`): Mod
    mod(number: number): Mod
    mod(expression: Record<string, any>): Mod
    mod(input: number | string | Record<string, any>) {
        this.append(input)
        return this;
    }
}
