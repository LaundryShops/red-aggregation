import { ReplaceWithOperation } from "../../../operations/replaceWithOperation";
import { NoOpAggregationOperationContext } from "../../../aggregate/aggregateOperationContext/noOpAggregationOperationContext";
import { Fields } from "../../../aggregate/field";
import { ArithmeticOperators } from "../../../operator/arithmeticOperators/arithmeticOperators";

describe("ReplaceWithOperation MongoDB $replaceWith operator", () => {
    let context: NoOpAggregationOperationContext;

    beforeEach(() => {
        context = new NoOpAggregationOperationContext();
    });

    it("should replace document with literal value", () => {
        const operation = ReplaceWithOperation.replaceWithValue({ status: "archived" });
        const doc = operation.toDocument(context);

        expect(doc).toEqual({
            $replaceWith: { status: "archived" }
        });
    });

    it("should replace document with field reference", () => {
        const operation = ReplaceWithOperation.replaceWithValueOf("profile");
        const doc = operation.toDocument(context);

        expect(doc).toEqual({
            $replaceWith: "$profile"
        });
    });

    it("should replace document with Field instance", () => {
        const operation = ReplaceWithOperation.replaceWithValueOf(Fields.field("profile"));
        const doc = operation.toDocument(context);

        expect(doc).toEqual({
            $replaceWith: "$profile"
        });
    });

    it("should replace document with AggregationExpression", () => {
        const expression = ArithmeticOperators.add("$price").add("$tax");
        const operation = ReplaceWithOperation.replaceWithValueOf(expression);

        const doc = operation.toDocument(context);
        expect(doc).toEqual({
            $replaceWith: {
                $add: ["$price", "$tax"]
            }
        });
    });

    it("should replace document with nested array values", () => {
        const operation = ReplaceWithOperation.replaceWithValueOf(["$first", ["$second", "$third"]]);
        const doc = operation.toDocument(context);

        expect(doc).toEqual({
            $replaceWith: ["$first", ["$second", "$third"]]
        });
    });

    it("should reject null replaceWithValueOf input", () => {
        expect(() => ReplaceWithOperation.replaceWithValueOf(null)).toThrow("Value must not be null");
    });
});

