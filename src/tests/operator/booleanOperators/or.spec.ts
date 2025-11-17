import { Or } from "../../../operator/booleanOperators/or";
import { NoOpAggregationOperationContext } from "../../../aggregate/aggregateOperationContext/noOpAggregationOperationContext";

describe("Or Operator Integration Test", () => {
    it("should create $or with multiple values", () => {
        const or = Or.or(true, false);

        expect(or.toDocument(new NoOpAggregationOperationContext())).toEqual({
            $or: [true, false],
        });
    });

    it("should add literal value with orValue", () => {
        const or = Or.or(true).orValue(false);

        expect(or.toDocument(new NoOpAggregationOperationContext())).toEqual({
            $or: [true, false],
        });
    });

    it("should add field reference with orField", () => {
        const or = Or.or(true).orField("isActive");

        expect(or.toDocument(new NoOpAggregationOperationContext())).toEqual({
            $or: [true, "$isActive"],
        });
    });

    it("should add nested expression with orExpression", () => {
        const nested = Or.or(false); // giả sử biểu thức con cũng là một Or
        const or = Or.or(true).orExpression(nested);

        expect(or.toDocument(new NoOpAggregationOperationContext())).toEqual({
            $or: [true, { $or: [false] }],
        });
    });

    it("should chain multiple orValue and orField calls", () => {
        const or = Or.or(true).orValue(false).orField("isDeleted");

        expect(or.toDocument(new NoOpAggregationOperationContext())).toEqual({
            $or: [true, false, "$isDeleted"],
        });
    });
});