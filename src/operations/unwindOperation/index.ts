import { Document } from 'mongodb';
import { ExposedFields } from '../../aggregate/field/exposeFields';
import { InheritsFieldsAggregationOperation } from '../../aggregate/field/fieldExposingAggregationOperation';
import { AggregationOperationContext } from '../../aggregate/aggregateOperationContext/aggregationOperationContext';
import { AggregateOperation } from '../../aggregateOperation';
import { ExposedField } from '../../aggregate/field/exposeField';
import { Field } from '../../aggregate/field';
import { Assert } from '../../utils';
import { UnwindOperationBuilder } from './unwindOperationBuilder';

export class UnwindOperation
	extends InheritsFieldsAggregationOperation
	implements AggregateOperation
{
	private readonly field: ExposedField;
	private readonly arrayIndex: ExposedField | null;
	private readonly preserveNullAndEmptyArrays: boolean;

	constructor(field: Field);
	constructor(field: Field, preserveNullAndEmptyArrays: boolean);
	constructor(
		field: Field,
		arrayIndex: Field,
		preserveNullAndEmptyArrays: boolean
	);
	constructor(
		field: Field,
		arrayIndex?: Field | boolean,
		preserveNullAndEmptyArrays?: boolean
	) {
		Assert.notNull(field, 'Field must not be null');
		super();
		if (arrayIndex instanceof Field) {
			Assert.notNull(arrayIndex, 'ArrayIndex must not be null');

			this.field = new ExposedField(field, true);
			this.arrayIndex = new ExposedField(arrayIndex, true);
			this.preserveNullAndEmptyArrays = !!preserveNullAndEmptyArrays;
			return;
		}

		if (typeof arrayIndex === 'boolean') {
			const preserveNullAndEmptyArrays = arrayIndex;
			this.field = new ExposedField(field, true);
			this.arrayIndex = null;
			this.preserveNullAndEmptyArrays = preserveNullAndEmptyArrays;
			return;
		}

		this.field = new ExposedField(field, true);
		this.arrayIndex = null;
		this.preserveNullAndEmptyArrays = false;
	}

	static newUnwind() {
		return UnwindOperationBuilder.newBuilder();
	}

	getFields(): ExposedFields {
		return this.arrayIndex !== null
			? ExposedFields.from(this.arrayIndex)
			: ExposedFields.from();
	}

	toDocument(context: AggregationOperationContext): Document {
		const path = context.getReference(this.field).toString();

		if (!this.preserveNullAndEmptyArrays && this.arrayIndex === null) {
			return {
				[this.getOperator()]: path,
			};
		}

		const unwindArgs: Document = {};
        unwindArgs['path'] = path;
        unwindArgs['preserveNullAndEmptyArrays'] = this.preserveNullAndEmptyArrays;

        if (this.arrayIndex !== null) {
            unwindArgs['includeArrayIndex'] = this.arrayIndex.getName();
        }
        
		return {
			[this.getOperator()]: unwindArgs,
		};
	}

	getOperator(): string {
		return '$unwind';
	}
}
