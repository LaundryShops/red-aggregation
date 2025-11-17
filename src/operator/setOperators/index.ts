import { AggregationExpression } from '../../aggregationExpression';
import { SetOperatorFactory } from './setOperatorFactory';

export class SetOperators {
	static arrayAsSet(fieldReference: string): SetOperatorFactory;
	static arrayAsSet(expression: AggregationExpression): SetOperatorFactory;
	static arrayAsSet(expression: Record<string, any>): SetOperatorFactory;
	static arrayAsSet(expression: unknown) {
        return new SetOperatorFactory(expression as string);
    }
}
