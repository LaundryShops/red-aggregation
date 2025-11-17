import { And } from "../../../operator/booleanOperators/and";
import { NoOpAggregationOperationContext } from "../../../aggregate/aggregateOperationContext/noOpAggregationOperationContext";

describe("And Operator Integration Test", () => {
    it("should create $and with literal values", () => {
        const and = And.and(true, false);

        expect(and.toDocument(new NoOpAggregationOperationContext())).toEqual({
            $and: [true, false],
        });
    });

    it("should add literal value with andValue", () => {
        const and = And.and(true).andValue(false);

        expect(and.toDocument(new NoOpAggregationOperationContext())).toEqual({
            $and: [true, false],
        });
    });

    it("should add field reference with andField", () => {
        const and = And.and(true).andField("isActive");

        expect(and.toDocument(new NoOpAggregationOperationContext())).toEqual({
            $and: [true, "$isActive"],
        });
    });

    it("should add nested expression with andExpression", () => {
        const nested = And.and(false);
        const and = And.and(true).andExpression(nested);

        expect(and.toDocument(new NoOpAggregationOperationContext())).toEqual({
            $and: [true, { $and: [false] }],
        });
    });

    it("should chain andValue, andField and andExpression", () => {
        const nested = And.and(false);
        const and = And.and(true).andValue(false).andField("isDeleted").andExpression(nested);

        expect(and.toDocument(new NoOpAggregationOperationContext())).toEqual({
            $and: [true, false, "$isDeleted", { $and: [false] }],
        });
    });

    it("should create $and with empty array when no input", () => {
        const and = And.and();

        expect(and.toDocument(new NoOpAggregationOperationContext())).toEqual({
            $and: [],
        });
    });
});
