import { AggregationExpression } from "../../aggregationExpression";
import { Assert } from "../../utils";
import { AbstractOperatorExpression } from "../abstractOperatorExpression";

export class SetUnion extends AbstractOperatorExpression {
    private constructor(value: any) {
        super(value);
    }

    static arrayAsSet(arrayReference: string): SetUnion
    static arrayAsSet(expression: AggregationExpression): SetUnion
    static arrayAsSet(expression: Record<string, any>): SetUnion
    static arrayAsSet(expression: unknown) {
        Assert.notNull(expression, 'Expression must not be null');

        if (typeof expression === 'string') {
            return new SetUnion(this.asFields(expression));
        }

        return new SetUnion([expression]);
    }

    union(...arrayReference: string[]): SetUnion
    union(...arrayExpression: AggregationExpression[]): SetUnion
    union(...arrayExpression: Record<string, any>[]): SetUnion
    union(...expressions: unknown[]) {
        Assert.notNull(expressions, 'Expressions must not be null');
        
        if (expressions.some(elm => typeof elm === 'string')) {
            const fields = SetUnion.asFields(...expressions as string[]);
            return new SetUnion(this.append(fields));
        }

        return new SetUnion(this.append([...expressions]));
    }

    protected getMongoMethod(): string {
        return '$setUnion';
    }

}
