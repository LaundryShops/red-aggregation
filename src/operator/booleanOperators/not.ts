import { Fields } from "../../aggregate/field";
import { AggregationExpression } from "../../aggregationExpression";
import { AbstractOperatorExpression } from "../abstractOperatorExpression";

export class Not extends AbstractOperatorExpression {
    private constructor(values: any[]) {
        super(values);
    }

    protected getMongoMethod(): string {
        return '$not';
    }

    static not(...expression: any) {
        return new Not([...expression]);
    }

    notExpression(expression: AggregationExpression) {
        return new Not(this.append(expression));
    }

    notField(field: string) {
        return new Not(this.append(Fields.field(field)));
    }

    notValue(value: any) {
        return new Not(this.append(value));
    }
}