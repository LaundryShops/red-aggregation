import { AggregationExpression } from "../../aggregationExpression";
import { AccumulatorOperatorFactory } from "./accumulatorOperatorFactory";

export class AccumulatorOperators {
    static valueOf(fieldReference: string): AccumulatorOperatorFactory
    static valueOf(expression: AggregationExpression): AccumulatorOperatorFactory
    static valueOf(input: string | AggregationExpression) {
        if (typeof input === 'string') {
            return new AccumulatorOperatorFactory(input);
        }
        if (input instanceof AggregationExpression) {
            return new AccumulatorOperatorFactory(input);
        }
        throw new Error('Invalid input');
    }
}
