import { AggregationOperationContext, type Type } from './aggregationOperationContext';
import type { Field } from '../field';
import { DirectFieldReference, FieldReference } from '../field/directFieldReference';
import { ExposedField } from '../field/exposeField';
import { ExposedFields } from '../field/exposeFields';
import type { Document } from 'mongodb';
import type { InheritingExposedFieldsAggregationOperationContext } from './inheritingExposedFieldAggregationOperationContext';

export class ExposedFieldsAggregationOperationContext extends AggregationOperationContext {
	constructor(private readonly exposedFields: ExposedFields, private readonly rootContext: AggregationOperationContext) // private readonly lookupPolicy: any,
	{
		super();
	}

	getRootContext() {
		return this.rootContext;
	}

	getMappedObject(document: Document): Document;
	getMappedObject(document: Document, type: Type | null): Document;
	getMappedObject(document: Document, type?: Type | null): Document {
		if (type === undefined) {
			return this.getMappedObject(document, null);
		}

		return this.rootContext.getMappedObject(document, type);
	}

	expose(fields: ExposedFields): AggregationOperationContext {
		return new ExposedFieldsAggregationOperationContext(fields, this);
	}

	inheritAndExpose(field: ExposedFields): InheritingExposedFieldsAggregationOperationContext {
		const InheritingExposedFieldsAggregationOperationContext = require('./inheritingExposedFieldAggregationOperationContext');
		return new InheritingExposedFieldsAggregationOperationContext(field, this);
	}

	getReference(field: Field): FieldReference;
	getReference(field: string): FieldReference;
	getReference(fieldOrName: string | Field): FieldReference {
		if (typeof fieldOrName === 'string') {
			return this._getReference(null, fieldOrName);
		}

		if (fieldOrName.isInternal()) {
			return new DirectFieldReference(new ExposedField(fieldOrName, true));
		}

		return this._getReference(fieldOrName, fieldOrName.getTarget());
	}

	private _getReference(field: Field | null, name: string) {
		const exposedField = this.resolveExposedField(field, name);

		if (exposedField) {
			return exposedField;
		}

		if (field) {
			return new DirectFieldReference(new ExposedField(field, true));
		}
		return new DirectFieldReference(new ExposedField(name, true));
	}

	protected resolveExposedField(field: Field | null, name: string): FieldReference | null {
		const exposedField = this.exposedFields.getField(name);

		if (exposedField) {
			if (field) {
				return new DirectFieldReference(new ExposedField(field, exposedField.isSynthetic()));
			}

			return new DirectFieldReference(exposedField);
		}

		if (name.includes('.')) {
			const rootField = this.exposedFields.getField(name.split('.')[0]);

			if (rootField) {
				return new DirectFieldReference(new ExposedField(name, true));
			}
		}

		return null;
	}
}

export default ExposedFieldsAggregationOperationContext;
