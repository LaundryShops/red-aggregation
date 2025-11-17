import { ReplaceRootOperation, ReplaceRootDocumentOperation } from '../../../operations/replaceRootOperation/replaceRootOperation';
import { ReplaceRootOperationBuilder } from '../../../operations/replaceRootOperation/replaceRootOperationBuilder';
import { ReplacementDocument } from '../../../operations/replaceRootOperation/replacementDocument';
import { AggregationExpression } from '../../../aggregationExpression';
import { NoOpAggregationOperationContext } from '../../../aggregate/aggregateOperationContext/noOpAggregationOperationContext';
import { Fields } from '../../../aggregate/field';
import { ArithmeticOperators } from '../../../operator/arithmeticOperators/arithmeticOperators';

class StubAggregationExpression extends AggregationExpression {
	override toDocument() {
		return { $literal: 'value' };
	}
}

describe('ReplaceRootOperation MongoDB $replaceRoot operator', () => {
	let context: NoOpAggregationOperationContext;

	beforeEach(() => {
		context = new NoOpAggregationOperationContext();
	});

	it('should replace root with field reference', () => {
		const operation = new ReplaceRootOperation(Fields.field('item'));
		const doc = operation.toDocument(context);

		expect(doc).toEqual({
			$replaceRoot: {
				newRoot: '$item',
			},
		});
	});

	it('should replace root with aggregation expression', () => {
		const expression = ArithmeticOperators.add('price').add('tax');
		const operation = new ReplaceRootOperation(expression);

		const doc = operation.toDocument(context);
		expect(doc).toEqual({
			$replaceRoot: {
				newRoot: {
					$add: ['$price', '$tax'],
				},
			},
		});
	});

	it('should replace root with raw document', () => {
		const operation = new ReplaceRootOperation({ firstName: '$name', location: '$city' });
		const doc = operation.toDocument(context);

		expect(doc).toEqual({
			$replaceRoot: {
				newRoot: {
					firstName: '$name',
					location: '$city',
				},
			},
		});
	});

	it('should create replaceRoot using builder with field name', () => {
		const builder = ReplaceRootOperation.builder();
		const operation = builder.withValueOf('profile');

		expect(builder).toBeInstanceOf(ReplaceRootOperationBuilder);
		expect(operation).toBeInstanceOf(ReplaceRootOperation);
		expect(operation.toDocument(context)).toEqual({
			$replaceRoot: {
				newRoot: '$profile',
			},
		});
	});

	it('should create replaceRoot using builder with aggregation expression', () => {
		const expression = new StubAggregationExpression();
		const operation = ReplaceRootOperation.builder().withValueOf(expression);

		expect(operation.toDocument(context)).toEqual({
			$replaceRoot: {
				newRoot: { $literal: 'value' },
			},
		});
	});

	it('should build replaceRoot composition document via builder', () => {
		const expression = ArithmeticOperators.add('$price').add('$tax');

		const operation = ReplaceRootOperation.builder().withDocument().and(expression).as('total').andValue('$name').as('name');

		expect(operation).toBeInstanceOf(ReplaceRootDocumentOperation);
		expect(operation.toDocument(context)).toEqual({
			$replaceRoot: {
				newRoot: {
					total: { $add: ['$price', '$tax'] },
					name: '$name',
				},
			},
		});
	});

	it('should build replaceRoot document starting from existing document', () => {
		const operation = ReplaceRootOperation.builder()
			.withDocument()
			.andValue('$userProfile')
			.as('profile')
			.andValuesOf({ profile: '$userProfile' })
			.andValue('$settings')
			.as('settings');

		expect(operation.toDocument(context)).toEqual({
			$replaceRoot: {
				newRoot: {
					profile: '$userProfile',
					settings: '$settings',
				},
			},
		});
	});

	it('should extend replaceRoot document with ReplacementDocument', () => {
		const base = ReplacementDocument.valueOf({ baseField: '$root' });
		const extension = ReplacementDocument.forSingleValue('extra', 42);

		const operation = new ReplaceRootDocumentOperation(base).andValue(10).as('score');
		const extended = new ReplaceRootDocumentOperation(operation, extension);

		expect(extended.toDocument(context)).toEqual({
			$replaceRoot: {
				newRoot: {
					baseField: '$root',
					score: 10,
					extra: 42,
				},
			},
		});
	});

	it('should return empty exposed fields', () => {
		const operation = new ReplaceRootOperation({ field: '$value' });
		const fields = operation.getFields();

		expect(fields.exposesNoFields()).toBe(true);
	});
});
