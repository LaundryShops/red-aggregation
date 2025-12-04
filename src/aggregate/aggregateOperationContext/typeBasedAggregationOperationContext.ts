import { Document } from "mongodb";
import { AggregationOperationContext, Type } from "./aggregationOperationContext";
import { DirectFieldReference, FieldReference } from "../field/directFieldReference";
import { Field, Fields } from "../field";
import { ExposedField } from "../field/exposeField";
import { InheritingExposedFieldsAggregationOperationContext } from "./inheritingExposedFieldAggregationOperationContext";
import { ExposedFields } from "../field/exposeFields";
import ExposedFieldsAggregationOperationContext from "./exposedFieldsAggregationOperationContext";
import { Assert } from "../../utils";

export class TypeBasedAggregationOperationContext extends AggregationOperationContext implements AggregationOperationContext {
    getMappedObject(document: Document): Document;
    getMappedObject(document: Document, type: Type | null): Document;
    getMappedObject(document: Document, type?: Type | null): Document {
        return document;
    }

    getReference(field: Field): FieldReference;
    getReference(field: string): FieldReference;
    getReference(field: Field | string): any {
        if (typeof field === 'string') {
            field = Fields.field(field);
        }
        return this.getReferenceFor(field);
    }

    inheritAndExpose(fields: ExposedFields) {
        return new InheritingExposedFieldsAggregationOperationContext(fields, this);
    }

    expose(fields: ExposedFields): AggregationOperationContext {
        return new ExposedFieldsAggregationOperationContext(fields, this);
    }

    protected getReferenceFor(field: Field) {
        return this.doGetFieldReference(field)
    }

    private doGetFieldReference(field: Field) {
        return new DirectFieldReference(new ExposedField(field, true))
    }
}
