import { SetIsSubset } from "../../../operator/setOperators/setIsSubset";
import { NoOpAggregationOperationContext } from "../../../aggregate/aggregateOperationContext/noOpAggregationOperationContext";
import { Fields } from "../../../aggregate/field";
import { ArithmeticOperators } from "../../../operator/arithmeticOperators/arithmeticOperators";

describe("SetIsSubset MongoDB $setIsSubset operator", () => {
    let context: NoOpAggregationOperationContext;

    beforeEach(() => {
        context = new NoOpAggregationOperationContext();
    });

    describe("Factory methods and basic functionality", () => {
        it.each([
            ["string field", "subset", { $setIsSubset: ["$subset"] }],
            ["expression", { $split: ["$tags", ","] }, { $setIsSubset: [{ $split: ["$tags", ","] }] }],
            ["record expression", { $map: { input: "$items", in: "$$this" } }, { $setIsSubset: [{ $map: { input: "$items", in: "$$this" } }] }]
        ])("should create SetIsSubset with %s", (_, input, expected) => {
            const setIsSubset = SetIsSubset.arrayAsSet(input as any);
            expect(setIsSubset).toBeInstanceOf(SetIsSubset);
            expect(setIsSubset.toDocument(context)).toEqual(expected);
        });

        it("should create $setIsSubset with subset and superset field references", () => {
            const setIsSubset = SetIsSubset.arrayAsSet("subset").isSubsetOf("superset1", "superset2");
            expect(setIsSubset.toDocument(context)).toEqual({
                $setIsSubset: ["$subset", "$superset1", "$superset2"]
            });
        });

        it("should create $setIsSubset with mixed field references and expressions", () => {
            const setIsSubset = SetIsSubset.arrayAsSet("subset")
                .isSubsetOf("superset1")
                .isSubsetOf({ $split: ["$tags", ","] });
            expect(setIsSubset.toDocument(context)).toEqual({
                $setIsSubset: ["$subset", "$superset1", { $split: ["$tags", ","] }]
            });
        });
    });

    describe("Chaining operations", () => {
        it("should chain multiple isSubsetOf operations", () => {
            const setIsSubset = SetIsSubset.arrayAsSet("subset")
                .isSubsetOf("superset1")
                .isSubsetOf("superset2")
                .isSubsetOf("superset3");
            expect(setIsSubset.toDocument(context)).toEqual({
                $setIsSubset: ["$subset", "$superset1", "$superset2", "$superset3"]
            });
        });

        it("should chain isSubsetOf operations with mixed types", () => {
            const setIsSubset = SetIsSubset.arrayAsSet("subset")
                .isSubsetOf({ $split: ["$tags", ","] })
                .isSubsetOf("superset")
                .isSubsetOf({ $map: { input: "$items", in: "$$this" } });
            expect(setIsSubset.toDocument(context)).toEqual({
                $setIsSubset: ["$subset", { $split: ["$tags", ","] }, "$superset", { $map: { input: "$items", in: "$$this" } }]
            });
        });
    });

    describe("Complex expressions", () => {
        it("should handle arithmetic expressions", () => {
            const setIsSubset = SetIsSubset.arrayAsSet(ArithmeticOperators.add("$a").add("$b"))
                .isSubsetOf(ArithmeticOperators.multiply("$c").multiplyBy("$d"));
            expect(setIsSubset.toDocument(context)).toEqual({
                $setIsSubset: [{ $add: ["$a", "$b"] }, { $multiply: ["$c", "$d"] }]
            });
        });

        it("should handle nested expressions", () => {
            const setIsSubset = SetIsSubset.arrayAsSet({
                $map: { input: "$items", in: { $multiply: ["$$this", 2] } }
            }).isSubsetOf({
                $filter: { input: "$numbers", cond: { $gt: ["$$this", 10] } }
            });
            expect(setIsSubset.toDocument(context)).toEqual({
                $setIsSubset: [
                    { $map: { input: "$items", in: { $multiply: ["$$this", 2] } } },
                    { $filter: { input: "$numbers", cond: { $gt: ["$$this", 10] } } }
                ]
            });
        });
    });

    describe("Error handling", () => {
        it.each([
            ["arrayAsSet receives null", () => SetIsSubset.arrayAsSet(null as any), "Expression must not be null"],
            ["isSubsetOf receives null", () => SetIsSubset.arrayAsSet("subset").isSubsetOf(null as any), "Expressions must not be null"]
        ])("should throw error when %s", (_, action, expectedError) => {
            expect(action).toThrow(expectedError);
        });
    });

    describe("MongoDB method validation", () => {
        it("should return correct MongoDB method name and generate valid document structure", () => {
            const setIsSubset = SetIsSubset.arrayAsSet("subset").isSubsetOf("superset");
            expect(setIsSubset["getMongoMethod"]()).toBe("$setIsSubset");
            
            const doc = setIsSubset.toDocument(context);
            expect(doc).toHaveProperty("$setIsSubset");
            expect(Array.isArray(doc.$setIsSubset)).toBe(true);
            expect(doc.$setIsSubset.length).toBe(2);
        });
    });

    describe("Edge cases", () => {
        it.each([
            ["single element", "single", { $setIsSubset: ["$single"] }],
            ["empty string", "", { $setIsSubset: ["$"] }],
            ["complex chaining", "subset", { $setIsSubset: ["$subset", "$superset1", "$superset2", "$superset3", "$superset4"] }]
        ])("should handle %s", (_, input, expected) => {
            let setIsSubset = SetIsSubset.arrayAsSet(input);
            if (input === "subset") {
                setIsSubset = setIsSubset.isSubsetOf("superset1").isSubsetOf("superset2").isSubsetOf("superset3").isSubsetOf("superset4");
            }
            expect(setIsSubset.toDocument(context)).toEqual(expected);
        });
    });

    describe("Integration and real-world scenarios", () => {
        it("should work with Fields.field()", () => {
            const field = Fields.field("customField");
            const setIsSubset = SetIsSubset.arrayAsSet(field);
            expect(setIsSubset.toDocument(context)).toEqual({
                $setIsSubset: ["$customField"]
            });
        });

        it("should check if user tags are subset of allowed tags", () => {
            const setIsSubset = SetIsSubset.arrayAsSet("userTags").isSubsetOf("allowedTags");
            expect(setIsSubset.toDocument(context)).toEqual({
                $setIsSubset: ["$userTags", "$allowedTags"]
            });
        });

        it("should handle conditional subset checking", () => {
            const setIsSubset = SetIsSubset.arrayAsSet("$userTags").isSubsetOf({
                $cond: {
                    if: { $eq: ["$userType", "premium"] },
                    then: "$premiumTags",
                    else: "$basicTags"
                }
            });
            expect(setIsSubset.toDocument(context)).toEqual({
                $setIsSubset: [
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

        it("should check if processed set is subset of original set", () => {
            const setIsSubset = SetIsSubset.arrayAsSet({
                $setUnion: ["$setA", "$setB"]
            }).isSubsetOf({
                $setUnion: ["$setA", "$setB", "$setC"]
            });
            expect(setIsSubset.toDocument(context)).toEqual({
                $setIsSubset: [
                    { $setUnion: ["$setA", "$setB"] },
                    { $setUnion: ["$setA", "$setB", "$setC"] }
                ]
            });
        });
    });
});
