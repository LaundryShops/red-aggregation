import { Concat } from "../../../operator/stringOperators/concat";
import { NoOpAggregationOperationContext } from "../../../aggregate/aggregateOperationContext/noOpAggregationOperationContext";

describe("Concat MongoDB $concat operator", () => {
    const context = new NoOpAggregationOperationContext();

    it("should create $concat with field reference", () => {
        const expr = Concat.valueOf("firstName").concatValueof("$lastName");
        const doc = expr.toDocument(context);

        expect(doc).toEqual({
            $concat: ["$firstName", "$lastName"]
        });
    });

    it("should create $concat with string literal", () => {
        const expr = Concat.valueOf("firstName").concat(" ");
        const doc = expr.toDocument(context);

        expect(doc).toEqual({
            $concat: ["$firstName", " "]
        });
    });

    it("should create $concat with expression", () => {
        const expr = Concat.valueOf("price").concatValueof({ $toString: "$discount" });
        const doc = expr.toDocument(context);

        expect(doc).toEqual({
            $concat: ["$price", { $toString: "$discount" }]
        });
    });

    it("should create $concat mixing string, field and expression", () => {
        const expr = Concat.valueOf("firstName")
            .concat(" ")
            .concatValueof("$lastName")
            .concat(" - ")
            .concatValueof({ $toString: "$age" });

        const doc = expr.toDocument(context);

        expect(doc).toEqual({
            $concat: ["$firstName", " ", "$lastName", " - ", { $toString: "$age" }]
        });
    });

    it("should create $concat with plain string value using stringValue", () => {
        const expr = Concat.stringValue("Hello ").concatValueof("$username");
        const doc = expr.toDocument(context);

        expect(doc).toEqual({
            $concat: ["Hello ", "$username"]
        });
    });
});
