import { Fields } from "../../aggregate/field";
import { AggregationExpression } from "../../aggregationExpression";
import { AbstractOperatorExpression } from "../abstractOperatorExpression";

export class Or extends AbstractOperatorExpression {
    private constructor(values: any[]) {
        super(values);
    }

    protected getMongoMethod(): string {
        return '$or';
    }

    static or(...expression: any) {
        return new Or([...expression]);
    }

    orExpression(expression: AggregationExpression) {
        return new Or(this.append(expression));
    }

    orField(field: string) {
        return new Or(this.append(Fields.field(field)));
    }

    orValue(value: any) {
        return new Or(this.append(value));
    }
}