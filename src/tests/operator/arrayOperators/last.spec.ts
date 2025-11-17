import { Fields } from "../../../aggregate/field";
import { Last } from "../../../operator/arrayOperators/last";
import { NoOpAggregationOperationContext } from "../../../aggregate/aggregateOperationContext/noOpAggregationOperationContext";

describe("Last Operator", () => {
    let context: NoOpAggregationOperationContext;

    beforeEach(() => {
        context = new NoOpAggregationOperationContext();
    });

    it("should create $last operation from literal array", () => {
        const arr = [1, 2, 3];
        const lastOp = Last.last(arr);
        const doc = lastOp.toDocument(context);

        expect(doc).toEqual({
            $last: [1, 2, 3],
        });
    });

    it("should create $last operation from string field reference", () => {
        jest.spyOn(Fields, "field").mockReturnValue("$scores" as any);

        const lastOp = Last.lastOf("scores");
        const doc = lastOp.toDocument(context);

        expect(doc).toEqual({
            $last: "$scores",
        });
    });

    it("should create $last operation from plain object", () => {
        const obj = { $map: { input: "$items", as: "i", in: "$$i.price" } };
        const lastOp = Last.lastOf(obj);
        const doc = lastOp.toDocument(context);

        expect(doc).toEqual({
            $last: obj,
        });
    });

    it("should throw error if lastOf called with null", () => {
        expect(() => Last.lastOf(null as any)).toThrow("Value must not be null");
    });
});