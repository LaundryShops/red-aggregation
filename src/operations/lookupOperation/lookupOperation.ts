import { Document } from 'mongodb';
import { AggregationOperationContext } from '../../aggregate/aggregateOperationContext/aggregationOperationContext';
import { ExposedFields } from '../../aggregate/field/exposeFields';
import { InheritsFieldsAggregationOperation } from '../../aggregate/field/fieldExposingAggregationOperation';
import { Field } from '../../aggregate/field';
import { Let } from '../../operator/variableOperators/let';
import { AggregationPipeline } from '../../aggregationPipeline';
import { ExposedField } from '../../aggregate/field/exposeField';
import { Assert } from '../../utils';

/**
 * Khuyến nghị sử dụng builder được cung cấp thông qua {@link newLookup()}
 * thay vì tự tạo instance của class này trực tiếp
 */
export class LookupOperation extends InheritsFieldsAggregationOperation {
	private readonly _from: string;
	private readonly _localField: Field | null;
	private readonly _foreignField: Field | null;
	private readonly _lets: Let | null;
	private readonly _pipeline: AggregationPipeline | null;
	private readonly _as: ExposedField;

	constructor(from: Field, localField: Field, foreignField: Field, as: Field);
	constructor(from: string, lets: Let | null, pipeline: AggregationPipeline | null, as: Field);
	constructor(from: string, localField: Field | null, foreignField: Field | null, lets: Let | null, pipeline: AggregationPipeline | null, as: Field);
	constructor(from: string | Field, localField: Field | Let | null, foreignField: Field | AggregationPipeline | null, lets: Field | Let | null, pipeline?: AggregationPipeline | null, asField?: Field) {
		super();
		Assert.notNull(from, 'From must not be null');
		if (from instanceof Field && localField instanceof Field && foreignField instanceof Field && lets instanceof Field) {
			const asField = lets;
			Assert.notNull(asField, 'As must not be null');
			
			this._from = from.getTarget();
			this._localField = localField;
			this._foreignField = foreignField;
			this._as = new ExposedField(asField as Field, true);

			this._pipeline = null;
			this._lets = null;
			return;
		}

		if (typeof from === 'string' && localField instanceof Let && foreignField instanceof AggregationPipeline && lets instanceof Field) {
			const asField = lets;
			const _lets = localField;
			const pipeline = foreignField;
			Assert.notNull(pipeline, 'Pipeline must not be null');
			
			this._from = from;
			this._pipeline = pipeline;
			this._lets = _lets;
			this._as = new ExposedField(asField, true);

			this._localField = null;
			this._foreignField = null;
			return;
			// return new LookupOperation(from, null, null, lets, pipeline, asField);
		}

		Assert.notNull(asField, 'As must not be null');
		if (pipeline === null) {
			Assert.notNull(localField, 'LocalField must not be null');
			Assert.notNull(foreignField, 'ForeignField must not be null');
		} else if (localField === null && foreignField == null) {
			Assert.notNull(pipeline, 'Pipeline must not be null');
		}

		this._from = from as string;
		this._localField = localField as Field;
		this._foreignField = foreignField as Field;
		this._as = new ExposedField(asField as Field, true);
		this._lets = lets as Let;
		this._pipeline = pipeline as AggregationPipeline;
	}

	getFields(): ExposedFields {
		return ExposedFields.from(this._as);
	}

	toDocument(context: AggregationOperationContext): Document {
		const lookupObject: Document = {};
		lookupObject['from'] = this._from;
		lookupObject['as'] = this._as.getTarget();

		if (this._localField !== null) {
			lookupObject['localField'] = this._localField.getTarget();
		}
		if (this._foreignField !== null) {
			lookupObject['foreignField'] = this._foreignField.getTarget();
		}
		if (this._lets !== null) {
			lookupObject['let'] = this._lets.toDocument(context)['$let']['vars'];
		}
		if (this._pipeline !== null) {
			lookupObject['pipeline'] = this._pipeline.toDocuments(context);
		}

		return { [this.getOperator()]: lookupObject };
	}

	getOperator(): string {
		return '$lookup';
	}
}
