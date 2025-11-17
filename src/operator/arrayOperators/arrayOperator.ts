import { Document } from 'mongodb';
import { AggregationExpression } from '../../aggregationExpression';
import { ArrayOperatorFactory } from './arrayOperatorFactory';

export class ArrayOperator {
	static arrayOf(field: string): ArrayOperatorFactory;
	static arrayOf(expression: AggregationExpression): ArrayOperatorFactory;
	static arrayOf(expression: Document): ArrayOperatorFactory;
	static arrayOf(input: unknown) {
        return new ArrayOperatorFactory(input as string);
    }
}
