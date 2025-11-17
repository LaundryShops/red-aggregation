import { IfNull } from "../../../operator/conditionalOperators/ifNull";
import { NoOpAggregationOperationContext } from "../../../aggregate/aggregateOperationContext/noOpAggregationOperationContext";

describe("IfNull MongoDB $ifNull operator", () => {
    const context = new NoOpAggregationOperationContext();

    it("should create $ifNull with field reference and string literal", () => {
        const expr = IfNull.ifNull("name").then("Unknown");
        const doc = expr.toDocument(context);

        expect(doc).toEqual({
            $ifNull: ["$name", "Unknown"]
        });
    });

    it("should create $ifNull with field reference and field reference", () => {
        const expr = IfNull.ifNull("nickname").thenValueOf("username");
        const doc = expr.toDocument(context);

        expect(doc).toEqual({
            $ifNull: ["$nickname", "$username"]
        });
    });

    it("should create $ifNull with expression as condition", () => {
        const expr = IfNull.ifNull({ $toString: "$age" }).then(0);
        const doc = expr.toDocument(context);

        expect(doc).toEqual({
            $ifNull: [{ $toString: "$age" }, 0]
        });
    });

    it("should create $ifNull with expression as value", () => {
        const expr = IfNull.ifNull("score").thenValueOf({ $multiply: ["$weight", 10] });
        const doc = expr.toDocument(context);

        expect(doc).toEqual({
            $ifNull: ["$score", { $multiply: ["$weight", 10] }]
        });
    });

    it("should create $ifNull with number literal as value", () => {
        const expr = IfNull.ifNull("count").then(42);
        const doc = expr.toDocument(context);

        expect(doc).toEqual({
            $ifNull: ["$count", 42]
        });
    });

    it("should create $ifNull with boolean literal as value", () => {
        const expr = IfNull.ifNull("isActive").then(true);
        const doc = expr.toDocument(context);

        expect(doc).toEqual({
            $ifNull: ["$isActive", true]
        });
    });

    it("should create $ifNull with null as value", () => {
        const expr = IfNull.ifNull("optional").then(null);
        const doc = expr.toDocument(context);

        expect(doc).toEqual({
            $ifNull: ["$optional", null]
        });
    });

    it("should create $ifNull with array as value", () => {
        const expr = IfNull.ifNull("tags").then(["default", "tag"]);
        const doc = expr.toDocument(context);

        expect(doc).toEqual({
            $ifNull: ["$tags", ["default", "tag"]]
        });
    });

    it("should create $ifNull with object as value", () => {
        const expr = IfNull.ifNull("config").then({ theme: "dark", lang: "en" });
        const doc = expr.toDocument(context);

        expect(doc).toEqual({
            $ifNull: ["$config", { theme: "dark", lang: "en" }]
        });
    });

    it("should create $ifNull with complex expression as condition", () => {
        const expr = IfNull.ifNull({ $add: ["$a", "$b"] }).then(0);
        const doc = expr.toDocument(context);

        expect(doc).toEqual({
            $ifNull: [{ $add: ["$a", "$b"] }, 0]
        });
    });

    it("should create $ifNull with nested expression as value", () => {
        const expr = IfNull.ifNull("price").thenValueOf({
            $multiply: ["$basePrice", { $add: ["$tax", 1] }]
        });
        const doc = expr.toDocument(context);

        expect(doc).toEqual({
            $ifNull: ["$price", { $multiply: ["$basePrice", { $add: ["$tax", 1] }] }]
        });
    });
});