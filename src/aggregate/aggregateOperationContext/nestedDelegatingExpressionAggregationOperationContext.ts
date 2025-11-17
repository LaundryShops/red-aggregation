import { Document } from 'mongodb';
import { Field } from "../field";
import { FieldReference } from "../field/directFieldReference";
import { ExposedFields, ExpressionFieldReference } from "../field/exposeFields";
import { AggregationOperationContext, Type } from "./aggregationOperationContext";
import { Assert } from "../../utils";
import { InheritingExposedFieldsAggregationOperationContext } from './inheritingExposedFieldAggregationOperationContext';

export class NestedDelegatingExpressionAggregationOperationContext implements AggregationOperationContext {
    private readonly delegate: AggregationOperationContext;
    // TODO: có thể tạo 1 interface Collection<T> extends Iterable<T>
    private readonly inners: Array<Field>;
    constructor(
        referenceContext: AggregationOperationContext,
        inners: Array<Field>,
    ) {
        Assert.notNull(referenceContext, 'Reference context must not be null');
        this.delegate = referenceContext;
        this.inners = inners;
    }
    
    getMappedObject(document: Document): Document;
    getMappedObject(document: Document, type: Type | null): Document;
    getMappedObject(document: Document, type?: Type | null): Document {
        return this.delegate.getMappedObject(document);
    }

    getMapObject(document: Document): Document
    getMapObject(document: Document, type: Type | null): Document
    getMapObject(document: Document, type?: Type | null) {
        if (type === undefined) {
            return this.delegate.getMappedObject(document);
        }

        return this.delegate.getMappedObject(document, type);
    }

    expose(fields: ExposedFields): AggregationOperationContext {
        throw new Error("Method not implemented.");
    }

    inheritAndExpose(field: ExposedFields): InheritingExposedFieldsAggregationOperationContext {
        throw new Error("Method not implemented.");
    }

    getReference(field: Field): FieldReference;
    getReference(field: string): FieldReference;
    getReference(field: string | Field) {
        if (typeof field === 'string') {
            return new ExpressionFieldReference(this.delegate.getReference(field))
        }
        const reference = this.delegate.getReference(field);
        return this.isInnerVariableReference(field) 
            ? new ExpressionFieldReference(this.delegate.getReference(field))
            : reference;
    }

    private isInnerVariableReference(field: Field) {
        if (this.inners.length === 0) {
            return false;
        }

        for (let inner of this.inners) {
            if (
                inner.getName() === field.getName()
                || (field.getTarget().includes('.') && field.getTarget().startsWith(inner.getName()))
            ) {
                return true;
            }
        }

        return false;
    }

}