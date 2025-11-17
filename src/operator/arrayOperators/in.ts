import { Fields } from "../../aggregate/field";
import { AggregationExpression } from "../../aggregationExpression";
import { Assert } from "../../utils";
import { AbstractOperatorExpression } from "../abstractOperatorExpression";

export type InBuilder = {
    containsValue(value: unknown): In
}

export class In extends AbstractOperatorExpression {
    static arrayOf(fieldReference: string): InBuilder
    static arrayOf(expression: AggregationExpression): InBuilder
    static arrayOf(expression: Record<string, any>): InBuilder
    static arrayOf(value: unknown): InBuilder {
        Assert.notNull(value, 'Value must not be null');

        if (typeof value === 'string') {
            return {
                containsValue: v => {
                    Assert.notNull(v, 'Value must not be null');
                    return new In([v, Fields.field(value)])
                }
            }
        }
        return {
            containsValue: v => {
                Assert.notNull(v, 'Value must not be null');
                return new In([v, value])
            }
        }
    }

    private constructor(value: any) {
        super(value);
    }

    protected getMongoMethod(): string {
        return '$in';
    }

}
