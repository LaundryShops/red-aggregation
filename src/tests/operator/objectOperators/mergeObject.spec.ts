import { Fields } from "../../../aggregate/field";
import { MergeObject } from "../../../operator/objectOperators/mergeObject";
import { NoOpAggregationOperationContext } from "../../../aggregate/aggregateOperationContext/noOpAggregationOperationContext";

describe("MergeObject MongoDB $mergeObjects Integration Test", () => {

    it("merge() should produce $mergeObjects array from raw objects", () => {
        const mergeObj = MergeObject.merge({ a: 1 }, { b: 2 });
        const doc = mergeObj.toDocument(new NoOpAggregationOperationContext());

        expect(doc).toEqual({
            $mergeObjects: [{ a: 1 }, { b: 2 }]
        });
    });

    it("mergeValueOf() should produce $mergeObjects array from field names", () => {
        const mergeObj = MergeObject.mergeValueOf("price", "discount");
        const doc = mergeObj.toDocument(new NoOpAggregationOperationContext());

        expect(doc).toEqual({
            $mergeObjects: ["$price", "$discount"]
        });
    });

    it("mergeValueOf() should produce $mergeObjects array from expressions", () => {
        const expr1 = { $add: ["$price", 10] };
        const expr2 = { $abs: "$discount" };
        const mergeObj = MergeObject.mergeValueOf(expr1, expr2);
        const doc = mergeObj.toDocument(new NoOpAggregationOperationContext());

        expect(doc).toEqual({
            $mergeObjects: [expr1, expr2]
        });
    });

    it("mergeWithValueOf() should append field names to existing MergeObject", () => {
        const mergeObj = MergeObject.mergeValueOf("price").mergeWithValueOf("discount");
        const doc = mergeObj.toDocument(new NoOpAggregationOperationContext());

        expect(doc).toEqual({
            $mergeObjects: ["$price", "$discount"]
        });
    });

    it("mergeWithValueOf() should append expressions to existing MergeObject", () => {
        const expr = { $multiply: ["$qty", 2] };
        const mergeObj = MergeObject.mergeValueOf("price").mergeWithValueOf(expr);
        const doc = mergeObj.toDocument(new NoOpAggregationOperationContext());

        expect(doc).toEqual({
            $mergeObjects: ["$price", expr]
        });
    });

    it("mergeWith() should append raw objects", () => {
        const mergeObj = MergeObject.merge({ a: 1 }).mergeWith({ b: 2 }, { c: 3 });
        const doc = mergeObj.toDocument(new NoOpAggregationOperationContext());

        expect(doc).toEqual({
            $mergeObjects: [{ a: 1 }, { b: 2 }, { c: 3 }]
        });
    });

    it("should support chaining mergeValueOf, mergeWithValueOf, mergeWith", () => {
        const expr = { $add: ["$price", 5] };
        const mergeObj = MergeObject.mergeValueOf("field1")
            .mergeWithValueOf("field2")
            .mergeWith(expr);

        const doc = mergeObj.toDocument(new NoOpAggregationOperationContext());
        expect(doc).toEqual({
            $mergeObjects: ["$field1", "$field2", expr]
        });
    });

    it("should unwrap single Map value correctly in toDocument", () => {
        const singleMap = new Map().set("only", { x: 1 });
        const mergeObj = MergeObject.merge(singleMap);

        const doc = mergeObj.toDocument(new NoOpAggregationOperationContext(), singleMap);
        expect(doc).toEqual({
            $mergeObjects: { x: 1 }
        });
    });
});
