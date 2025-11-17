import { AggregationExpression } from '../../aggregationExpression';
import { Assert } from '../../utils';
import { ReplacementDocument } from './replacementDocument';
import { ReplaceRootDocumentOperation } from './replaceRootOperation';

export class ReplaceRootDocumentOperationBuilder {
	private readonly currentOperation: ReplaceRootDocumentOperation;
	private readonly value: any;

	constructor(currentOperation: ReplaceRootDocumentOperation, value: any) {
		Assert.notNull(currentOperation, 'Current ReplaceRootDocumentOperation must not be null');
		Assert.notNull(value, 'Value must not be null');

		this.currentOperation = currentOperation;
		this.value = value;
	}

	as(fieldName: string) {
		if (this.value instanceof AggregationExpression) {
			return new ReplaceRootDocumentOperation(this.currentOperation, ReplacementDocument.forExpression(fieldName, this.value));
		}

		return new ReplaceRootDocumentOperation(this.currentOperation, ReplacementDocument.forSingleValue(fieldName, this.value));
	}
}
