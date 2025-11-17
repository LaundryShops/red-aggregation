import { Sum } from "../../../operator/accumulatorOperators/sum";
import { NoOpAggregationOperationContext } from "../../../aggregate/aggregateOperationContext/noOpAggregationOperationContext";

describe("Sum MongoDB $sum operator", () => {
    const context = new NoOpAggregationOperationContext();

    it("should create $sum with field reference", () => {
        const expr = Sum.sumOf("price").and("$tax");
        const doc = expr.toDocument(context);

        expect(doc).toEqual({
            $sum: ["$price", "$tax"]
        });
    });

    it("should create $sum with number literal", () => {
        const expr = Sum.sumOf("price").and(100);
        const doc = expr.toDocument(context);

        expect(doc).toEqual({
            $sum: ["$price", 100]
        });
    });

    it("should create $sum with expression", () => {
        const expr = Sum.sumOf("total").and({ $multiply: ["$quantity", "$unitPrice"] });
        const doc = expr.toDocument(context);

        expect(doc).toEqual({
            $sum: ["$total", { $multiply: ["$quantity", "$unitPrice"] }]
        });
    });

    it("should create $sum with multiple chained values", () => {
        const expr = Sum.sumOf("subtotal")
            .and("$discount")
            .and({ $multiply: ["$fee", 2] })
            .and(5);

        const doc = expr.toDocument(context);

        expect(doc).toEqual({
            $sum: ["$subtotal", "$discount", { $multiply: ["$fee", 2] }, 5]
        });
    });

    it("should create $sum starting from expression", () => {
        const expr = Sum.sumOf({ $add: ["$a", "$b"] }).and("$c");
        const doc = expr.toDocument(context);

        expect(doc).toEqual({
            $sum: [{ $add: ["$a", "$b"] }, "$c"]
        });
    });
});
