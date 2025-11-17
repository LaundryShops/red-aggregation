import { SetUnion } from "../../../operator/setOperators/setUnion";
import { NoOpAggregationOperationContext } from "../../../aggregate/aggregateOperationContext/noOpAggregationOperationContext";
import { Fields } from "../../../aggregate/field";
import { ArithmeticOperators } from "../../../operator/arithmeticOperators/arithmeticOperators";

describe("SetUnion MongoDB $setUnion operator", () => {
    let context: NoOpAggregationOperationContext;

    beforeEach(() => {
        context = new NoOpAggregationOperationContext();
    });

    describe("Factory methods and basic functionality", () => {
        it.each([
            ["string field", "tags", { $setUnion: ["$tags"] }],
            ["expression", { $split: ["$tags", ","] }, { $setUnion: [{ $split: ["$tags", ","] }] }],
            ["record expression", { $map: { input: "$items", in: "$$this" } }, { $setUnion: [{ $map: { input: "$items", in: "$$this" } }] }]
        ])("should create SetUnion with %s", (_, input, expected) => {
            const setUnion = SetUnion.arrayAsSet(input as any);
            expect(setUnion).toBeInstanceOf(SetUnion);
            expect(setUnion.toDocument(context)).toEqual(expected);
        });

        it("should create $setUnion with multiple field references", () => {
            const setUnion = SetUnion.arrayAsSet("tags1").union("tags2", "tags3");
            expect(setUnion.toDocument(context)).toEqual({
                $setUnion: ["$tags1", "$tags2", "$tags3"]
            });
        });

        it("should create $setUnion with mixed field references and expressions", () => {
            const setUnion = SetUnion.arrayAsSet("tags1")
                .union("tags2")
                .union({ $split: ["$tags", ","] });
            expect(setUnion.toDocument(context)).toEqual({
                $setUnion: ["$tags1", "$tags2", { $split: ["$tags", ","] }]
            });
        });
    });

    describe("Chaining operations", () => {
        it("should chain multiple union operations", () => {
            const setUnion = SetUnion.arrayAsSet("set1")
                .union("set2")
                .union("set3")
                .union("set4");
            expect(setUnion.toDocument(context)).toEqual({
                $setUnion: ["$set1", "$set2", "$set3", "$set4"]
            });
        });

        it("should chain union operations with mixed types", () => {
            const setUnion = SetUnion.arrayAsSet("field1")
                .union({ $split: ["$tags", ","] })
                .union("field2")
                .union({ $map: { input: "$items", in: "$$this" } });
            expect(setUnion.toDocument(context)).toEqual({
                $setUnion: ["$field1", { $split: ["$tags", ","] }, "$field2", { $map: { input: "$items", in: "$$this" } }]
            });
        });
    });

    describe("Complex expressions", () => {
        it("should handle arithmetic expressions", () => {
            const setUnion = SetUnion.arrayAsSet(ArithmeticOperators.add("$a").add("$b"))
                .union(ArithmeticOperators.multiply("$c").multiplyBy("$d"));
            expect(setUnion.toDocument(context)).toEqual({
                $setUnion: [{ $add: ["$a", "$b"] }, { $multiply: ["$c", "$d"] }]
            });
        });

        it("should handle nested expressions", () => {
            const setUnion = SetUnion.arrayAsSet({
                $map: { input: "$items", in: { $multiply: ["$$this", 2] } }
            }).union({
                $filter: { input: "$numbers", cond: { $gt: ["$$this", 10] } }
            });
            expect(setUnion.toDocument(context)).toEqual({
                $setUnion: [
                    { $map: { input: "$items", in: { $multiply: ["$$this", 2] } } },
                    { $filter: { input: "$numbers", cond: { $gt: ["$$this", 10] } } }
                ]
            });
        });
    });

    describe("Error handling", () => {
        it.each([
            ["arrayAsSet receives null", () => SetUnion.arrayAsSet(null as any), "Expression must not be null"],
            ["union receives null", () => SetUnion.arrayAsSet("tags").union(null as any), "Expressions must not be null"]
        ])("should throw error when %s", (_, action, expectedError) => {
            expect(action).toThrow(expectedError);
        });
    });

    describe("MongoDB method validation", () => {
        it("should return correct MongoDB method name and generate valid document structure", () => {
            const setUnion = SetUnion.arrayAsSet("set1").union("set2");
            expect(setUnion["getMongoMethod"]()).toBe("$setUnion");
            
            const doc = setUnion.toDocument(context);
            expect(doc).toHaveProperty("$setUnion");
            expect(Array.isArray(doc.$setUnion)).toBe(true);
            expect(doc.$setUnion.length).toBe(2);
        });
    });

    describe("Edge cases", () => {
        it.each([
            ["single element", "single", { $setUnion: ["$single"] }],
            ["empty string", "", { $setUnion: ["$"] }],
            ["complex chaining", "a", { $setUnion: ["$a", "$b", "$c", "$d", "$e"] }]
        ])("should handle %s", (_, input, expected) => {
            let setUnion = SetUnion.arrayAsSet(input);
            if (input === "a") {
                setUnion = setUnion.union("b").union("c").union("d").union("e");
            }
            expect(setUnion.toDocument(context)).toEqual(expected);
        });
    });

    describe("Integration and real-world scenarios", () => {
        it("should work with Fields.field()", () => {
            const field = Fields.field("customField");
            const setUnion = SetUnion.arrayAsSet(field);
            expect(setUnion.toDocument(context)).toEqual({
                $setUnion: ["$customField"]
            });
        });

        it("should union tags from multiple sources", () => {
            const setUnion = SetUnion.arrayAsSet("userTags")
                .union("categoryTags")
                .union("systemTags");
            expect(setUnion.toDocument(context)).toEqual({
                $setUnion: ["$userTags", "$categoryTags", "$systemTags"]
            });
        });

        it("should handle union with conditional expressions", () => {
            const setUnion = SetUnion.arrayAsSet("$tags").union({
                $cond: {
                    if: { $gt: ["$score", 80] },
                    then: ["premium", "high-score"],
                    else: []
                }
            });
            expect(setUnion.toDocument(context)).toEqual({
                $setUnion: [
                    "$tags",
                    {
                        $cond: {
                            if: { $gt: ["$score", 80] },
                            then: ["premium", "high-score"],
                            else: []
                        }
                    }
                ]
            });
        });

        it("should union arrays from different operations", () => {
            const setUnion = SetUnion.arrayAsSet({ $split: ["$tags", ","] })
                .union({ $map: { input: "$items", in: "$$this.category" } })
                .union("$defaultTags");
            expect(setUnion.toDocument(context)).toEqual({
                $setUnion: [
                    { $split: ["$tags", ","] },
                    { $map: { input: "$items", in: "$$this.category" } },
                    "$defaultTags"
                ]
            });
        });
    });
});
