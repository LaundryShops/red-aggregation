import { Avg } from "../../../operator/accumulatorOperators/avg";
import { NoOpAggregationOperationContext } from "../../../aggregate/aggregateOperationContext/noOpAggregationOperationContext";

describe("Avg MongoDB $avg operator", () => {
    const context = new NoOpAggregationOperationContext();

    it("should create $avg with field reference", () => {
        const expr = Avg.avgOf("score").and("$bonus");
        const doc = expr.toDocument(context);

        expect(doc).toEqual({
            $avg: ["$score", "$bonus"]
        });
    });

    // it("should create $avg with number literal", () => {
    //     const expr = Avg.avgOf("score").and(10);
    //     const doc = expr.toDocument(context);

    //     expect(doc).toEqual({
    //         $avg: ["$score", 10]
    //     });
    // });

    it("should create $avg with expression", () => {
        const expr = Avg.avgOf("total").and({ $multiply: ["$price", "$quantity"] });
        const doc = expr.toDocument(context);

        expect(doc).toEqual({
            $avg: ["$total", { $multiply: ["$price", "$quantity"] }]
        });
    });

    it("should create $avg with multiple chained values", () => {
        const expr = Avg.avgOf("a")
            .and("$b")
            .and({ $add: ["$c", 5] })
            // .and(20);

        const doc = expr.toDocument(context);

        expect(doc).toEqual({
            $avg: ["$a", "$b", { $add: ["$c", 5] }]
        });
    });

    it("should create $avg starting from expression", () => {
        const expr = Avg.avgOf({ $subtract: ["$x", "$y"] }).and("$z");
        const doc = expr.toDocument(context);

        expect(doc).toEqual({
            $avg: [{ $subtract: ["$x", "$y"] }, "$z"]
        });
    });
});
