import { Fields } from "../../aggregate/field";
import { Assert } from "../../utils";
import { AbstractOperatorExpression } from "../abstractOperatorExpression";

export class Divide extends AbstractOperatorExpression {
    static valueOf(fieldReference: string): Divide
    static valueOf(number: number): Divide
    static valueOf(expression: Record<string, any>): Divide
    static valueOf(input: unknown) {
        if (typeof input === 'string') {
            return new Divide(Fields.field(input));
        }
        return new Divide(input);
    }

    private constructor(input: unknown) {
        Assert.notNull(input, 'FieldReference must not be null');
        super(input);

    }

    protected override getMongoMethod(): string {
        return '$divide';
    }
    
    divideBy(fieldReference: string): Divide
    divideBy(number: number): Divide
    divideBy(expression: Record<string, any>): Divide
    divideBy(input: number | string | Record<string, any>) {
        if (typeof input === 'string') {
            this.append(Fields.field(input))
        } else {
            this.append(input)
        }
        return this;
    }
}
