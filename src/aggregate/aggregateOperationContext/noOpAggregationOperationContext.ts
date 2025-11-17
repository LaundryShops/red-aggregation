import { Document } from "mongodb";
import { Field, Fields } from "../field";
import { DirectFieldReference, FieldReference } from "../field/directFieldReference";
import { ExposedField } from "../field/exposeField";
import { AggregationOperationContext, Type } from "./aggregationOperationContext";

export class NoOpAggregationOperationContext extends AggregationOperationContext implements AggregationOperationContext {
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

    protected getReferenceFor(field: Field) {
        return this.doGetFieldReference(field)
    }

    private doGetFieldReference(field: Field) {
        return new DirectFieldReference(new ExposedField(field, true))
    }
}
