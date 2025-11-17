import { Field } from "../field";
import { FieldReference } from "../field/directFieldReference";
import { ExposedFields } from "../field/exposeFields";
import { AggregationOperationContext } from "./aggregationOperationContext";
import ExposedFieldsAggregationOperationContext from "./exposedFieldsAggregationOperationContext";

export class InheritingExposedFieldsAggregationOperationContext extends ExposedFieldsAggregationOperationContext {
    private readonly previousContext: AggregationOperationContext;

    constructor(
        exposedFields: ExposedFields,
        previousContext: AggregationOperationContext,
    ) {
        super(exposedFields, previousContext);
        this.previousContext = previousContext;
    }

    getMappedObject(document: Document) {
        return this.previousContext.getMappedObject(document);
    }

    protected resolveExposedField(field: Field | null, name: string): FieldReference {

        const fieldReference = super.resolveExposedField(field, name);
        if (fieldReference != null) {
            return fieldReference;
        }

        if (field != null) {
            return this.previousContext.getReference(field);
        }

        return this.previousContext.getReference(name);
    }
}