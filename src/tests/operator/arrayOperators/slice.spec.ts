import { ArithmeticOperators } from "../../../operator/arithmeticOperators/arithmeticOperators";
import { Slice } from "../../../operator/arrayOperators/slice";
import { NoOpAggregationOperationContext } from "../../../aggregate/aggregateOperationContext/noOpAggregationOperationContext";

describe("Slice Operator", () => {
    let context: NoOpAggregationOperationContext;

    beforeEach(() => {
        context = new NoOpAggregationOperationContext();
    });

    it("should create slice from literal array and item count", () => {
        const op = Slice.sliceArrayOf([1, 2, 3]).itemCount(2);
        const doc = op.toDocument(context);
        expect(doc).toEqual({
            $slice: [[1, 2, 3], 2]
        });
    });

    it("should create slice from field reference string and item count", () => {
        const op = Slice.sliceArrayOf("myArrayField").itemCount(3);
        const doc = op.toDocument(context);

        expect(doc).toEqual({
            $slice: ["$myArrayField", 3]
        });
    });

    it("should create slice with offset", () => {
        const op = Slice.sliceArrayOf([1, 2, 3]).offset(1).itemCount(2);
        const doc = op.toDocument(context);
        expect(doc).toEqual({
            $slice: [[1, 2, 3], 1, 2]
        });
    });

    it("should create slice from object literal", () => {
        const obj = { a: 1, b: 2 };
        const op = Slice.sliceArrayOf(obj).itemCount(1);
        const doc = op.toDocument(context);
        expect(doc).toEqual({
            $slice: [{ a: 1, b: 2 }, 1]
        });
    });

    it("should throw if null is passed", () => {
        expect(() => Slice.sliceArrayOf(null as any)).toThrow("Value must not be null");
    });

    it("should handle AggregationExpression as offset", () => {
        const op = Slice.sliceArrayOf([10, 20, 30]).offset(ArithmeticOperators.add(1).add(2)).itemCount(1);
        const doc = op.toDocument(context);
        expect(doc).toEqual({
            $slice: [[10, 20, 30], { $add: [1, 2] }, 1]
        });
    });
});