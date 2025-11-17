import { Fields } from "../../../aggregate/field";
import { IndexOfArray } from "../../../operator/arrayOperators/indexOfArray";
import { NoOpAggregationOperationContext } from "../../../aggregate/aggregateOperationContext/noOpAggregationOperationContext";

describe("IndexOfArray Operator", () => {
    let context: NoOpAggregationOperationContext;

    beforeEach(() => {
        context = new NoOpAggregationOperationContext();
    });

    it("should create $indexOfArray from string field reference", () => {
        jest.spyOn(Fields, "field").mockReturnValue("$tags" as any);

        const idxOp = IndexOfArray.arrayOf("tags").indexOf("sale");
        const doc = idxOp.toDocument(context);

        expect(doc).toEqual({
            $indexOfArray: ["$tags", "sale"]
        });
    });

    it("should create $indexOfArray from plain object", () => {
        const arr = { $map: { input: "$items", as: "i", in: "$$i.price" } };
        const idxOp = IndexOfArray.arrayOf(arr).indexOf(100);
        const doc = idxOp.toDocument(context);

        expect(doc).toEqual({
            $indexOfArray: [arr, 100]
        });
    });

    it("should create $indexOfArray with within(start) method", () => {
        const idxOp = IndexOfArray.arrayOf(["a", "b", "c"]).indexOf("b").within(1);
        const doc = idxOp.toDocument(context);

        expect(doc).toEqual({
            $indexOfArray: [["a", "b", "c"], "b", 1]
        });
    });

    it("should create $indexOfArray with within(start, end) method", () => {
        const idxOp = IndexOfArray.arrayOf(["x", "y", "z"]).indexOf("y").within(1, 2);
        const doc = idxOp.toDocument(context);

        expect(doc).toEqual({
            $indexOfArray: [["x", "y", "z"], "y", 1, 2]
        });
    });

    it("should throw error if arrayOf called with null", () => {
        expect(() => IndexOfArray.arrayOf(null as any)).toThrow("Value must not be null");
    });

    it("should throw error if indexOf called with null", () => {
        const builder = IndexOfArray.arrayOf(["a", "b"]);
        expect(() => builder.indexOf(null as any)).toThrow("Value must not be null");
    });
});