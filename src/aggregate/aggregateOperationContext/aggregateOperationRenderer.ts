import { Document } from "mongodb";
import { Field } from "../field";
import { DirectFieldReference, FieldReference } from "../field/directFieldReference";
import { AggregationOperationContext, Type } from "./aggregationOperationContext";
import { ExposedField } from "../field/exposeField";
import { AggregateField } from "../field/aggregateField";
import { NoOpAggregationOperationContext } from "./noOpAggregationOperationContext";

import { FieldsExposingAggregationOperation, InheritsFieldsAggregationOperation } from "../field/fieldExposingAggregationOperation";
import { AggregateOperation } from "../../aggregateOperation";

class ConverterAwareNoOpContext extends AggregationOperationContext {
    ctx: AggregationOperationContext;

    static instance(ctx: AggregationOperationContext) {
        if (ctx instanceof ConverterAwareNoOpContext) {
            return ctx;
        }

        return new ConverterAwareNoOpContext(ctx);
    }

    constructor(ctx: AggregationOperationContext) {
        super();
        this.ctx = ctx;
    }

    getReference(field: Field): FieldReference;
    getReference(field: string): FieldReference;
    getReference(field: string | Field): FieldReference {
        if (typeof field === 'string') {
            return new DirectFieldReference(new ExposedField(new AggregateField(field), true))
        }

        return new DirectFieldReference(new ExposedField(field, true));
    }

    getMappedObject(document: Document): Document;
    getMappedObject(document: Document, type: Type | null): Document;
    getMappedObject(document: Document, type?: unknown): Document {
        return this.ctx.getMappedObject(document, null);
    }
}

export class AggregationOperationRenderer {
    static readonly DEFAULT_CONTEXT = new NoOpAggregationOperationContext();

    static toDocument(operations: AggregateOperation[], rootContext: AggregationOperationContext) {
        let operationDocuments: Document[] = [];
        let contextToUse = rootContext;

        for(const operation of operations) {
            operationDocuments = operationDocuments.concat(operation.toPipelineStages(contextToUse));
            
            if(operation instanceof FieldsExposingAggregationOperation) {
                const fields = operation.getFields();
                
                if (operation instanceof InheritsFieldsAggregationOperation || operation.inheritsFields()) {
                    contextToUse = contextToUse.inheritAndExpose(fields);
                } else {
                    contextToUse = fields.exposesNoFields()
                        ? ConverterAwareNoOpContext.instance(rootContext) 
                        : contextToUse.expose(fields)
                }
            }
        }

        return operationDocuments;
    }
}