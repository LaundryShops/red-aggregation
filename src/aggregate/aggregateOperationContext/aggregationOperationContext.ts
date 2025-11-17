import type { Document } from 'mongodb';
import type { ExposedFieldsAggregationOperationContext } from "./exposedFieldsAggregationOperationContext";
import { type Field } from "../field";
import type { FieldReference } from "../field/directFieldReference";
import type { ExposedFields } from "../field/exposeFields";

export type Type = (new (...args: any[]) => any);
// export interface PropertyDescriptor {
//     name: string;
//     getter?: Function;
//     setter?: Function;
//     type?: any;
//     writable?: boolean;
//     readable?: boolean;
// }

// export interface ExtendedPropertyDescriptor extends PropertyDescriptor {
//     name: string;
//     readable?: boolean;
// }

export abstract class AggregationOperationContext {
    abstract getReference(field: Field): FieldReference;
    abstract getReference(field: string): FieldReference;

    abstract getMappedObject(document: Document): Document
    abstract getMappedObject(document: Document, type: Type | null): Document

    // abstract getMappedObject(): any 

    expose(fields: ExposedFields): AggregationOperationContext {
        const { ExposedFieldsAggregationOperationContext } = require('./exposedFieldsAggregationOperationContext');
        return new ExposedFieldsAggregationOperationContext(fields, this);
    }

    inheritAndExpose(field: ExposedFields) {
        const { InheritingExposedFieldsAggregationOperationContext } = require('./inheritingExposedFieldAggregationOperationContext');
        return new InheritingExposedFieldsAggregationOperationContext(field, this)
    }

    // getFields(type: Type) {
    //     Assert.notNull(type, 'Type must not be null');

    //     const a = this.getPropertyDescriptors(type)
    //     return Fields.fields(
    //         a.filter(it => {
    //             const method = it.getter && it.getter();
    //             if (method === null) {
    //                 return false;
    //             }
    //             if (Reflect.)
    //             return false;
    //         }).
    //     )

    // }

    // private getPropertyDescriptors(type: Type): ExtendedPropertyDescriptor[] {
    //     const descriptors: ExtendedPropertyDescriptor[] = [];
    //     const prototype = type.prototype;

    //     // Lấy tất cả keys của object
    //     const keys = Reflect.ownKeys(prototype);

    //     for (const key of keys) {
    //         if (key === 'constructor') continue;

    //         const descriptor = Reflect.getOwnPropertyDescriptor(prototype, key);
    //         if (descriptor) {
    //             descriptors.push({
    //                 name: key.toString(),
    //                 getter: descriptor.get,
    //                 setter: descriptor.set,
    //                 writable: descriptor.writable,
    //                 readable: descriptor.get !== undefined
    //             });
    //         }
    //     }

    //     return descriptors;
    // }
}
