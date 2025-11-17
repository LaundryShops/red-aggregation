import { ObjectToArray } from "../../../operator/objectOperators/objectToArray";
import { NoOpAggregationOperationContext } from "../../../aggregate/aggregateOperationContext/noOpAggregationOperationContext";

describe("ObjectToArray MongoDB $objectToArray Integration Test", () => {

    it("should create ObjectToArray from field name", () => {
        const objToArr = ObjectToArray.valueOfToArray("price");
        const doc = objToArr.toDocument(new NoOpAggregationOperationContext());

        expect(doc).toEqual({
            $objectToArray: "$price"
        });
    });

    it("should create ObjectToArray from expression object", () => {
        const expr = { $add: ["$price", 10] };
        const objToArr = ObjectToArray.valueOfToArray(expr);
        const doc = objToArr.toDocument(new NoOpAggregationOperationContext());

        expect(doc).toEqual({
            $objectToArray: expr
        });
    });

    it("should create ObjectToArray from raw object", () => {
        const rawObj = { a: 1, b: 2 };
        const objToArr = ObjectToArray.valueOfToArray(rawObj);
        const doc = objToArr.toDocument(new NoOpAggregationOperationContext());

        expect(doc).toEqual({
            $objectToArray: rawObj
        });
    });

    it("should throw error when input is null or undefined", () => {
        expect(() => ObjectToArray.valueOfToArray(null as any)).toThrow();
        expect(() => ObjectToArray.valueOfToArray(undefined as any)).toThrow();
    });

});
