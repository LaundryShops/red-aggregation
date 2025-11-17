import { Fields } from "../../../aggregate/field";
import { AggregationExpression } from "../../../aggregationExpression";
import { Size } from "../../../operator/arrayOperators/size";
import { NoOpAggregationOperationContext } from "../../../aggregate/aggregateOperationContext/noOpAggregationOperationContext";

describe("Size Operator", () => {
    let context: NoOpAggregationOperationContext;

    beforeEach(() => {
        context = new NoOpAggregationOperationContext();
        jest.spyOn(context, "getReference").mockImplementation((field: any) => ({ toString: () => `$${field}` } as any));
    });

    it("should calculate size of a literal array", () => {
        const op = Size.lengthOfArray([1, 2, 3]);
        const doc = op.toDocument(context);
        expect(doc).toEqual({
            $size: [1, 2, 3]
        });
    });

    it("should calculate size of a field reference string", () => {
        jest.spyOn(Fields, "field").mockReturnValue("arrField" as any);

        const op = Size.lengthOfArray("arrField");
        const doc = op.toDocument(context);
        expect(doc).toEqual({
            $size: "arrField"
        });
    });

    it("should calculate size of a plain object", () => {
        const obj = { a: 1, b: 2 };
        const op = Size.lengthOfArray(obj);
        const doc = op.toDocument(context);
        expect(doc).toEqual({
            $size: { a: 1, b: 2 }
        });
    });

    it("should throw if null is passed", () => {
        expect(() => Size.lengthOfArray(null as any)).toThrow("Value must not be null");
    });
});
