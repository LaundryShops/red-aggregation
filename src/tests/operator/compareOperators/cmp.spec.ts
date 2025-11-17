import { Cmp } from "../../../operator/compareOperators/cmp";
import { NoOpAggregationOperationContext } from "../../../aggregate/aggregateOperationContext/noOpAggregationOperationContext";

describe("Cmp Operator Integration Test", () => {
    it("should create $cmp from field reference", () => {
        const cmp = Cmp.valueOf("price");

        expect(cmp.toDocument(new NoOpAggregationOperationContext())).toEqual({
            $cmp: ["$price"],
        });
    });

    // it("should create $cmp from expression object", () => {
    //     const cmp = Cmp.valueOf({ $abs: -5 });

    //     expect(cmp.toDocument(new NoOpAggregationOperationContext())).toEqual({
    //         $cmp: [{ $abs: -5 }],
    //     });
    // });

    it("should compare field to another field", () => {
        const cmp = Cmp.valueOf("price").compareTo("discount");

        expect(cmp.toDocument(new NoOpAggregationOperationContext())).toEqual({
            $cmp: ["$price", "$discount"],
        });
    });

    // it("should compare field to expression", () => {
    //     const cmp = Cmp.valueOf("price").compareTo({ $abs: "$discount" });

    //     expect(cmp.toDocument(new NoOpAggregationOperationContext())).toEqual({
    //         $cmp: ["$price", { $abs: "$discount" }],
    //     });
    // });

    it("should compare field to literal value", () => {
        const cmp = Cmp.valueOf("price").compareToValue(100);

        expect(cmp.toDocument(new NoOpAggregationOperationContext())).toEqual({
            $cmp: ["$price", 100],
        });
    });

    it("should chain compareTo and compareToValue", () => {
        const cmp = Cmp.valueOf("price")
            .compareTo("discount")
            .compareToValue(50);

        expect(cmp.toDocument(new NoOpAggregationOperationContext())).toEqual({
            $cmp: ["$price", "$discount", 50],
        });
    });
});
