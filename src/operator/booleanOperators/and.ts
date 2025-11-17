import { Fields } from "../../aggregate/field";
import { AggregationExpression } from "../../aggregationExpression";
import { AbstractOperatorExpression } from "../abstractOperatorExpression";

export class And extends AbstractOperatorExpression {
    private constructor(values: any[]) {
        super(values);
    }

    protected getMongoMethod(): string {
        return '$and';
    }

    static and(...expression: any) {
        return new And([...expression]);
    }

    andExpression(expression: AggregationExpression) {
        return new And(this.append(expression));
    }

    andField(field: string) {
        return new And(this.append(Fields.field(field)));
    }

    andValue(value: any) {
        return new And(this.append(value));
    }
}