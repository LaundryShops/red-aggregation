import { First } from "../../../operator/arrayOperators/first";
import { ComparisonOperation } from "../../../operator/compareOperators/comparisonOperators";
import { NoOpAggregationOperationContext } from "../../../aggregate/aggregateOperationContext/noOpAggregationOperationContext";

describe("First Operator", () => {
    let context: NoOpAggregationOperationContext;

    beforeEach(() => {
        context = new NoOpAggregationOperationContext();
    });

    it("should create $first operation from array", () => {
        const doc = First.first([1, 2, 3]).toDocument(context);
        expect(doc).toEqual({ $first: [1, 2, 3] });
    });

    it("should create $first operation from field reference", () => {
        const doc = First.firstOf("price").toDocument(context);
        expect(doc).toEqual({ $first: "$price" });
    });

    it("should create $first operation from ComparisonOperation", () => {
        // Giả lập ComparisonOperation.gt sinh ra Mongo operator
        const expr = ComparisonOperation.gt("$$el").greaterThanValue(10);
        jest.spyOn(expr, "toDocument").mockReturnValue({ $gt: ["$$el", 10] });

        const doc = First.firstOf(expr).toDocument(context);
        expect(doc).toEqual({ $first: { $gt: ["$$el", 10] } });
    });

    it("should create $first operation from plain object", () => {
        const obj = { $concat: ["$name", " ", "$surname"] };
        const doc = First.firstOf(obj).toDocument(context);
        expect(doc).toEqual({ $first: { $concat: ["$name", " ", "$surname"] } });
    });

    it("should throw error when passing null value", () => {
        expect(() => First.firstOf(null as any)).toThrow("Value must not be null");
    });
});
