import { Fields } from "../../../aggregate/field";
import { ArithmeticOperators } from "../../../operator/arithmeticOperators/arithmeticOperators";
import { Filter, FilterExpressionBuilder } from "../../../operator/arrayOperators/filter";
import { ComparisonOperation } from "../../../operator/compareOperators/comparisonOperators";
import { NoOpAggregationOperationContext } from "../../../aggregate/aggregateOperationContext/noOpAggregationOperationContext";

describe("Filter", () => {
    let context: NoOpAggregationOperationContext;

    beforeEach(() => {
        context = new NoOpAggregationOperationContext();
    });

    it("should create filter from string", () => {
        const result = Filter.filter("myField");
        expect(result).toBeInstanceOf(FilterExpressionBuilder);
    });

    it("should throw when filter(null)", () => {
        expect(() => Filter.filter(null as any)).toThrow("Field must not be null");
    });

    it("should generate correct $filter document for array input", () => {
        const filter = new FilterExpressionBuilder()
            .filter(["A", "B"])
            .as("el")
            .by({ $eq: ["$$el", "A"] });

        const doc = filter.toDocument(context);
        expect(doc).toEqual({
            $filter: {
                input: ["A", "B"],
                as: "el",
                cond: { $eq: ["$$el", "A"] },
            },
        });
    });

    it("should map condition if it's AggregationExpression", () => {
        const filter = new FilterExpressionBuilder()
            .filter([1, 2, 3])
            .as("el")
            .by(ComparisonOperation.gt("$$el").greaterThanValue(10));

        const doc = filter.toDocument(context);
        expect(doc).toEqual({
            $filter: {
                input: [1, 2, 3],
                as: "el",
                cond: { $gt: ["$$el", 10] },
            },
        });
    });

    it("should map input if it's Field", () => {
        const field = Fields.field("price");
        const filter = new FilterExpressionBuilder()
            .filter(field)
            .as("p")
            .by({ $gt: ["$$p", 5] });

        const doc = filter.toDocument(context);
        expect(doc).toEqual({
            $filter: {
                input: "$price",
                as: "p",
                cond: { $gt: ["$$p", 5] },
            },
        });
    });

    it("should map input if it's AggregationExpression", () => {
        const filter = new FilterExpressionBuilder()
            .filter(ArithmeticOperators.add("$a").add("$b"))
            .as("item")
            .by({ $gt: ["$$item", 10] });

        const doc = filter.toDocument(context);
        expect(doc).toEqual({
            $filter: {
                input: { $add: ["$a", "$b"] },
                as: "item",
                cond: { $gt: ["$$item", 10] },
            },
        });
    });
});
