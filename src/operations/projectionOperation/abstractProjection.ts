import { Document } from 'mongodb';
import { Field } from "../../aggregate/field";
import { ExposedField } from "../../aggregate/field/exposeField";
import { Assert } from "../../utils";
import { AggregationOperationContext } from '../../aggregate/aggregateOperationContext/aggregationOperationContext';

export abstract class AbstractProjection {
    private readonly field: ExposedField;
    abstract toDocument(context: AggregationOperationContext): Document;

    constructor(field: Field) {
        Assert.notNull(field, 'Field must not be null');
        this.field = new ExposedField(field, true);
    }

    getExposedField(): ExposedField {
        return this.field;
    }

}