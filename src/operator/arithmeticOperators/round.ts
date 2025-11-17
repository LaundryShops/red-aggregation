import { Fields } from "../../aggregate/field";
import { Assert } from "../../utils";
import { AbstractOperatorExpression } from "../abstractOperatorExpression";

export class Round extends AbstractOperatorExpression{
    static valueOf(fieldReference: `$${string}`): Round
    static valueOf(number: number): Round
    static valueOf(expression: Record<string, any>): Round
    static valueOf(input: unknown) {
        if (typeof input === 'string') {
            return new Round(Fields.field(input));
        }
        return new Round(input);
    }

    private constructor(input: unknown) {
        Assert.notNull(input, 'FieldReference must not be null');
        super(input);
    }

    protected override getMongoMethod(): string {
        return '$round';
    }

    place(number: number): Round {
        this.append(number);
        return this;
    }

    placeOf(fieldReference: `$${string}`): Round
    placeOf(expression: Record<string, any>): Round
    placeOf(place: unknown) {
        this.append(place);
        return this;
    }
}
