import { SetOperation } from "../../../operations/setOperation/setOperation";
import { NoOpAggregationOperationContext } from "../../../aggregate/aggregateOperationContext/noOpAggregationOperationContext";
import { Fields } from "../../../aggregate/field";
import { ArithmeticOperators } from "../../../operator/arithmeticOperators/arithmeticOperators";

describe("SetOperation MongoDB $set operator", () => {
    let context: NoOpAggregationOperationContext;

    beforeEach(() => {
        context = new NoOpAggregationOperationContext();
    });

    it("should create $set with createSetOperation", () => {
        const operation = SetOperation.createSetOperation("name", "John");
        const doc = operation.toDocument(context);

        expect(doc).toEqual({
            $set: {
                name: "John"
            }
        });
    });

    it("should set field with direct value using set()", () => {
        const operation = SetOperation.createSetOperation("age", 30).set("status", "active");
        const doc = operation.toDocument(context);

        expect(doc).toEqual({
            $set: {
                age: 30,
                status: "active"
            }
        });
    });

    it("should set field using FieldAppender toValue", () => {
        const operation = new SetOperation(new Map()).set("score").toValue(10);
        const doc = operation.toDocument(context);

        expect(doc).toEqual({
            $set: {
                score: 10
            }
        });
    });

    it("should set field using FieldAppender toValueOf with field reference", () => {
        const operation = new SetOperation(new Map()).set("total").toValueOf("amount");
        const doc = operation.toDocument(context);

        expect(doc).toEqual({
            $set: {
                total: "$amount"
            }
        });
    });

    it("should set multiple fields via and()", () => {
        const operation = new SetOperation(new Map())
            .set("firstName").toValue("John")
            .and()
            .set("lastName").toValue("Doe");

        const doc = operation.toDocument(context);

        expect(doc).toEqual({
            $set: {
                firstName: "John",
                lastName: "Doe"
            }
        });
    });

    it("should preserve existing fields when chaining set()", () => {
        const operation = SetOperation.createSetOperation("name", "Alice")
            .set("age", 28)
            .set("city", "Hanoi");

        const doc = operation.toDocument(context);

        expect(doc).toEqual({
            $set: {
                name: "Alice",
                age: 28,
                city: "Hanoi"
            }
        });
    });

    it("should support AggregationExpression as value", () => {
        const expression = ArithmeticOperators.add("$price").add("$tax");

        const operation = new SetOperation(new Map()).set("total").toValueOf(expression);
        const doc = operation.toDocument(context);

        expect(doc).toEqual({
            $set: {
                total: { $add: ["$price", "$tax"] }
            }
        });
    });

    it("should expose fields through getFields()", () => {
        const operation = SetOperation.createSetOperation(Fields.field("name"), "Bob")
            .set(Fields.field("age"), 31);

        const fields = operation.getFields();
        const exposed = Array.from(fields).map((field) => field.getName());

        expect(exposed).toEqual(["name", "age"]);
    });
});

