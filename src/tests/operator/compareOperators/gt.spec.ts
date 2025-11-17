import { Gt } from "../../../operator/compareOperators/gt";
import { NoOpAggregationOperationContext } from "../../../aggregate/aggregateOperationContext/noOpAggregationOperationContext";

describe("Gt Operator Integration Test", () => {
    it("should create $gt from field reference", () => {
        const gt = Gt.valueOf("price");

        expect(gt.toDocument(new NoOpAggregationOperationContext())).toEqual({
            $gt: ["$price"],
        });
    });

    // it("should create $gt from expression object", () => {
    //     const gt = Gt.valueOf({ $abs: -5 });

    //     expect(gt.toDocument(new NoOpAggregationOperationContext())).toEqual({
    //         $gt: [{ $abs: -5 }],
    //     });
    // });

    it("should compare field greater than another field", () => {
        const gt = Gt.valueOf("price").greaterThan("discount");

        expect(gt.toDocument(new NoOpAggregationOperationContext())).toEqual({
            $gt: ["$price", "$discount"],
        });
    });

    // it("should compare field greater than expression", () => {
    //     const gt = Gt.valueOf("price").greaterThan({ $abs: "$discount" });

    //     expect(gt.toDocument(new NoOpAggregationOperationContext())).toEqual({
    //         $gt: ["$price", { $abs: "$discount" }],
    //     });
    // });

    it("should compare field greater than literal value", () => {
        const gt = Gt.valueOf("price").greaterThanValue(100);

        expect(gt.toDocument(new NoOpAggregationOperationContext())).toEqual({
            $gt: ["$price", 100],
        });
    });

    it("should chain greaterThan and greaterThanValue", () => {
        const gt = Gt.valueOf("price")
            .greaterThan("discount")
            .greaterThanValue(50);

        expect(gt.toDocument(new NoOpAggregationOperationContext())).toEqual({
            $gt: ["$price", "$discount", 50],
        });
    });
});
