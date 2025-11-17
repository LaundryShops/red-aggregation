import { Fields } from "../../../aggregate/field";
import { IsArray } from "../../../operator/arrayOperators/isArray";
import { NoOpAggregationOperationContext } from "../../../aggregate/aggregateOperationContext/noOpAggregationOperationContext";

describe("IsArray Operator", () => {
    let context: NoOpAggregationOperationContext;

    beforeEach(() => {
        context = new NoOpAggregationOperationContext();
    });

    it("should create $isArray operation from string field reference", () => {
        jest.spyOn(Fields, "field").mockReturnValue("$tags" as any);

        const isArrayOp = IsArray.isArray("tags");
        const doc = isArrayOp.toDocument(context);

        expect(doc).toEqual({
            $isArray: "$tags",
        });
    });

    it("should create $isArray operation from plain object", () => {
        const obj = { $map: { input: "$items", as: "i", in: "$$i.price" } };
        const isArrayOp = IsArray.isArray(obj);
        const doc = isArrayOp.toDocument(context);

        expect(doc).toEqual({
            $isArray: obj,
        });
    });

    it("should create $isArray operation from array", () => {
        const arr = [1, 2, 3];
        const isArrayOp = IsArray.isArray(arr);
        const doc = isArrayOp.toDocument(context);

        expect(doc).toEqual({
            $isArray: [1, 2, 3],
        });
    });

    it("should throw error if isArray called with null", () => {
        expect(() => IsArray.isArray(null as any)).toThrow("Value must not be null");
    });
});