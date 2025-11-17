import { SetEquals } from "../../../operator/setOperators/setEquals";
import { NoOpAggregationOperationContext } from "../../../aggregate/aggregateOperationContext/noOpAggregationOperationContext";
import { Fields } from "../../../aggregate/field";
import { ArithmeticOperators } from "../../../operator/arithmeticOperators/arithmeticOperators";

describe("SetEquals MongoDB $setEquals operator", () => {
    let context: NoOpAggregationOperationContext;

    beforeEach(() => {
        context = new NoOpAggregationOperationContext();
    });

    describe("Factory methods and basic functionality", () => {
        it.each([
            ["string field", "tags", { $setEquals: ["$tags"] }],
            ["expression", { $split: ["$tags", ","] }, { $setEquals: [{ $split: ["$tags", ","] }] }],
            ["record expression", { $map: { input: "$items", in: "$$this" } }, { $setEquals: [{ $map: { input: "$items", in: "$$this" } }] }]
        ])("should create SetEquals with %s", (_, input, expected) => {
            const setEquals = SetEquals.arrayAsSet(input as any);
            expect(setEquals).toBeInstanceOf(SetEquals);
            expect(setEquals.toDocument(context)).toEqual(expected);
        });

        it("should create $setEquals with multiple field references", () => {
            const setEquals = SetEquals.arrayAsSet("set1").isEqualTo("set2", "set3");
            expect(setEquals.toDocument(context)).toEqual({
                $setEquals: ["$set1", "$set2", "$set3"]
            });
        });

        it("should create $setEquals with mixed field references and expressions", () => {
            const setEquals = SetEquals.arrayAsSet("set1")
                .isEqualTo("set2")
                .isEqualTo({ $split: ["$tags", ","] });
            expect(setEquals.toDocument(context)).toEqual({
                $setEquals: ["$set1", "$set2", { $split: ["$tags", ","] }]
            });
        });
    });

    describe("Chaining operations", () => {
        it("should chain multiple isEqualTo operations", () => {
            const setEquals = SetEquals.arrayAsSet("set1")
                .isEqualTo("set2")
                .isEqualTo("set3")
                .isEqualTo("set4");
            expect(setEquals.toDocument(context)).toEqual({
                $setEquals: ["$set1", "$set2", "$set3", "$set4"]
            });
        });

        it("should chain isEqualTo operations with mixed types", () => {
            const setEquals = SetEquals.arrayAsSet("set1")
                .isEqualTo({ $split: ["$tags", ","] })
                .isEqualTo("set2")
                .isEqualTo({ $map: { input: "$items", in: "$$this" } });
            expect(setEquals.toDocument(context)).toEqual({
                $setEquals: ["$set1", { $split: ["$tags", ","] }, "$set2", { $map: { input: "$items", in: "$$this" } }]
            });
        });
    });

    describe("Complex expressions", () => {
        it("should handle arithmetic expressions", () => {
            const setEquals = SetEquals.arrayAsSet(ArithmeticOperators.add("$a").add("$b"))
                .isEqualTo(ArithmeticOperators.multiply("$c").multiplyBy("$d"));
            expect(setEquals.toDocument(context)).toEqual({
                $setEquals: [{ $add: ["$a", "$b"] }, { $multiply: ["$c", "$d"] }]
            });
        });

        it("should handle nested expressions", () => {
            const setEquals = SetEquals.arrayAsSet({
                $map: { input: "$items", in: { $multiply: ["$$this", 2] } }
            }).isEqualTo({
                $filter: { input: "$numbers", cond: { $gt: ["$$this", 10] } }
            });
            expect(setEquals.toDocument(context)).toEqual({
                $setEquals: [
                    { $map: { input: "$items", in: { $multiply: ["$$this", 2] } } },
                    { $filter: { input: "$numbers", cond: { $gt: ["$$this", 10] } } }
                ]
            });
        });
    });

    describe("Error handling", () => {
        it.each([
            ["arrayAsSet receives null", () => SetEquals.arrayAsSet(null as any), "Expression must not be null"],
            ["isEqualTo receives null", () => SetEquals.arrayAsSet("set1").isEqualTo(null as any), "Expressions must not be null"]
        ])("should throw error when %s", (_, action, expectedError) => {
            expect(action).toThrow(expectedError);
        });
    });

    describe("MongoDB method validation", () => {
        it("should return correct MongoDB method name and generate valid document structure", () => {
            const setEquals = SetEquals.arrayAsSet("set1").isEqualTo("set2");
            expect(setEquals["getMongoMethod"]()).toBe("$setEquals");
            
            const doc = setEquals.toDocument(context);
            expect(doc).toHaveProperty("$setEquals");
            expect(Array.isArray(doc.$setEquals)).toBe(true);
            expect(doc.$setEquals.length).toBe(2);
        });
    });

    describe("Edge cases", () => {
        it.each([
            ["single element", "single", { $setEquals: ["$single"] }],
            ["empty string", "", { $setEquals: ["$"] }],
            ["complex chaining", "set1", { $setEquals: ["$set1", "$set2", "$set3", "$set4", "$set5"] }]
        ])("should handle %s", (_, input, expected) => {
            let setEquals = SetEquals.arrayAsSet(input);
            if (input === "set1") {
                setEquals = setEquals.isEqualTo("set2").isEqualTo("set3").isEqualTo("set4").isEqualTo("set5");
            }
            expect(setEquals.toDocument(context)).toEqual(expected);
        });
    });

    describe("Integration and real-world scenarios", () => {
        it("should work with Fields.field()", () => {
            const field = Fields.field("customField");
            const setEquals = SetEquals.arrayAsSet(field);
            expect(setEquals.toDocument(context)).toEqual({
                $setEquals: ["$customField"]
            });
        });

        it("should check if user tags equal allowed tags", () => {
            const setEquals = SetEquals.arrayAsSet("userTags").isEqualTo("allowedTags");
            expect(setEquals.toDocument(context)).toEqual({
                $setEquals: ["$userTags", "$allowedTags"]
            });
        });

        it("should handle conditional equality checking", () => {
            const setEquals = SetEquals.arrayAsSet("$userTags").isEqualTo({
                $cond: {
                    if: { $eq: ["$userType", "premium"] },
                    then: "$premiumTags",
                    else: "$basicTags"
                }
            });
            expect(setEquals.toDocument(context)).toEqual({
                $setEquals: [
                    "$userTags",
                    {
                        $cond: {
                            if: { $eq: ["$userType", "premium"] },
                            then: "$premiumTags",
                            else: "$basicTags"
                        }
                    }
                ]
            });
        });

        it("should check if processed set equals original set", () => {
            const setEquals = SetEquals.arrayAsSet({
                $setUnion: ["$setA", "$setB"]
            }).isEqualTo({
                $setUnion: ["$setA", "$setB"]
            });
            expect(setEquals.toDocument(context)).toEqual({
                $setEquals: [
                    { $setUnion: ["$setA", "$setB"] },
                    { $setUnion: ["$setA", "$setB"] }
                ]
            });
        });
    });
});
