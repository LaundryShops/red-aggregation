import { Document } from 'mongodb';
import { Fields } from '../../aggregate/field';
import { AggregationExpression } from '../../aggregationExpression';
import { Assert } from '../../utils';
import { ReplaceRootDocumentOperation, ReplaceRootOperation } from './replaceRootOperation';

export class ReplaceRootOperationBuilder {
	withValueOf(fieldName: string): ReplaceRootOperation;
	withValueOf(aggregationExpression: AggregationExpression): ReplaceRootOperation;
	withValueOf(expression: Document): ReplaceRootOperation;
	withValueOf(fieldName: string | AggregationExpression | Document): ReplaceRootOperation {
		if (fieldName instanceof AggregationExpression) {
			return new ReplaceRootOperation(fieldName);
		}

		if (typeof fieldName === 'string') {
			return new ReplaceRootOperation(Fields.field(fieldName));
		}

		return new ReplaceRootOperation(fieldName);
	}

	/**
	 * Defines a root document replacement based on a composable document given {@literal document}. <br />
	 * {@link ReplaceRootOperation} can be populated with individual entries and derive its values from other, existing
	 * documents.
	 *
	 * @param document must not be {@literal null}.
	 * @return the final {@link ReplaceRootOperation}.
	 */
	withDocument(document: Document): ReplaceRootDocumentOperation;
	/**
	 * Defines a root document replacement based on a composable document that is empty initially. <br />
	 * {@link ReplaceRootOperation} can be populated with individual entries and derive its values from other, existing
	 * documents.
	 *
	 * @return the {@link ReplaceRootDocumentOperation}.
	 */
	withDocument(): ReplaceRootDocumentOperation;
	withDocument(document?: Document) {
		if (document === undefined) {
			return new ReplaceRootDocumentOperation();
		}

		Assert.notNull(document, 'Document must not be null');
		return new ReplaceRootDocumentOperation().andValuesOf(document);
	}
}
