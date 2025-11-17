import { Document } from 'mongodb';
import { AggregationOperationContext } from '../../aggregate/aggregateOperationContext/aggregationOperationContext';
import { Fields } from '../../aggregate/field';
import { AggregationExpression } from '../../aggregationExpression';
import { Assert } from '../../utils';
import { DocumentContributor } from './documentContributor';
import { ExpressionFieldContributor } from './expressionFieldContributor';
import { Replacement, ReplacementContributor } from './types';
import { ValueFieldContributor } from './valueFieldContributor';

export class ReplacementDocument extends Replacement {
	private readonly replacements: ReplacementContributor[];

	constructor(contributor?: ReplacementContributor | ReplacementContributor[]) {
		super();

		if (contributor === undefined) {
			this.replacements = [];
			return;
		}

		if (Array.isArray(contributor)) {
			this.replacements = contributor;
			return;
		}

		Assert.notNull(contributor, 'ReplacementContributor must not be null');
		this.replacements = [contributor];
	}

	static valueOf<T>(value: T) {
		return new ReplacementDocument(new DocumentContributor(value));
	}

	static forExpression(field: string, aggregationExpression: AggregationExpression) {
		return new ReplacementDocument(new ExpressionFieldContributor(Fields.field(field), aggregationExpression));
	}

	static forSingleValue(field: string, value: any) {
		return new ReplacementDocument(new ValueFieldContributor(Fields.field(field), value));
	}

	toDocumentExpression(context: AggregationOperationContext) {
		let doc: Document = {};

		for (const replacement of this.replacements) {
			doc = Object.assign(doc, replacement.toDocument(context));
		}

		return doc;
	}

	extendWith(extension: ReplacementDocument) {
		Assert.notNull(extension, 'ReplacementDocument must not be null');

		let replacements: ReplacementContributor[] = [];
		replacements = replacements.concat(this.replacements);
		replacements = replacements.concat(extension.replacements);

		return new ReplacementDocument(replacements);
	}
}
