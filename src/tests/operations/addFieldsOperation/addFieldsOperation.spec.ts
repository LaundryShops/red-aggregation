import { AddFieldsOperation } from "../../../operations/addFieldsOperation";
import { AddFieldsOperationBuilder } from "../../../operations/addFieldsOperation/addFieldOperationBuilder";
import { NoOpAggregationOperationContext } from "../../../aggregate/aggregateOperationContext/noOpAggregationOperationContext";
import { Fields } from "../../../aggregate/field";
import { ArithmeticOperators } from "../../../operator/arithmeticOperators/arithmeticOperators";

describe("AddFieldsOperation MongoDB $addFields operator", () => {
    let context: NoOpAggregationOperationContext;

    beforeEach(() => {
        context = new NoOpAggregationOperationContext();
    });

    describe("Basic addFields functionality", () => {
        it("should create $addFields with single field and value", () => {
            const operation = AddFieldsOperation.addField("name", "John");
            const doc = operation.toDocument(context);

            expect(doc).toEqual({
                $addFields: { name: "John" }
            });
        });

        it("should create $addFields with field reference", () => {
            const operation = AddFieldsOperation.addField("fullName", Fields.field("firstName"));
            const doc = operation.toDocument(context);

            expect(doc).toEqual({
                $addFields: { fullName: "$firstName" }
            });
        });

        it("should create $addFields with multiple fields using builder", () => {
            const operation = AddFieldsOperation.builder()
                .addFieldWithValue("name", "John")
                .addFieldWithValue("age", 25)
                .build();
            
            const doc = operation.toDocument(context);

            expect(doc).toEqual({
                $addFields: { name: "$John", age: 25 }
            });
        });

        it("should create AddFieldsOperationBuilder with string field", () => {
            const builder = AddFieldsOperation.addField("name");
            expect(builder).toBeDefined();
            expect(typeof builder.withValue).toBe("function");
            expect(typeof builder.withValueOf).toBe("function");
        });

        it("should create builder using static builder method", () => {
            const builder = AddFieldsOperation.builder();
            expect(builder).toBeDefined();
            expect(typeof builder.addField).toBe("function");
        });

        it("should use internalCreateAddFieldOperation", () => {
            const sourceMap = new Map([["field1", "value1"], ["field2", "value2"]]);
            const operation = AddFieldsOperation.internalCreateAddFieldOperation(sourceMap);
            expect(operation).toBeInstanceOf(AddFieldsOperation);
        });
    });

    describe("Builder pattern", () => {
        it("should chain addField operations", () => {
            const operation = AddFieldsOperation.builder()
                .addField("name").withValue("John")
                .addField("age").withValue(25)
                .build();
            
            const doc = operation.toDocument(context);

            expect(doc).toEqual({
                $addFields: { name: "$John", age: 25 }
            });
        });

        it("should use withValueOf for field references", () => {
            const operation = AddFieldsOperation.builder()
                .addField("fullName").withValueOf("firstName")
                .addField("lastName").withValueOf("lastName")
                .build();
            
            const doc = operation.toDocument(context);

            expect(doc).toEqual({
                $addFields: { 
                    fullName: "$firstName", 
                    lastName: "$lastName" 
                }
            });
        });

        it("should use addFieldWithValueOf method", () => {
            const operation = AddFieldsOperation.builder()
                .addFieldWithValueOf("name", "John")
                .addFieldWithValueOf("age", 25)
                .build();
            
            const doc = operation.toDocument(context);

            expect(doc).toEqual({
                $addFields: { name: "$John", age: 25 }
            });
        });

        it("should handle builder constructor with source map", () => {
            const sourceMap = new Map([["field1", "value1"]]);
            const builder = new AddFieldsOperationBuilder(sourceMap);
            const operation = builder.build();
            
            const doc = operation.toDocument(context);

            expect(doc).toEqual({
                $addFields: { field1: "value1" }
            });
        });
    });

    describe("Complex expressions", () => {
        it("should handle arithmetic expressions", () => {
            const operation = AddFieldsOperation.addField("total", ArithmeticOperators.add("$price").add("$tax"));
            const doc = operation.toDocument(context);

            expect(doc).toEqual({
                $addFields: { total: { $add: ["$price", "$tax"] } }
            });
        });

        it("should handle nested expressions", () => {
            const operation = AddFieldsOperation.builder()
                .addField("fullName").withValueOf(ArithmeticOperators.add("$firstName").add("$lastName"))
                .addField("discount").withValueOf(ArithmeticOperators.multiply("$price").multiplyBy(0.1))
                .build();
            
            const doc = operation.toDocument(context);

            expect(doc).toEqual({
                $addFields: { 
                    fullName: { $add: ["$firstName", "$lastName"] },
                    discount: { $multiply: ["$price", 0.1] }
                }
            });
        });
    });

    describe("Value types and edge cases", () => {
         it.each([
             ["string", "John", "John"],
             ["number", 25, 25],
             ["boolean", true, true],
             ["null", null, null],
             ["array", ["tag1", "tag2"], ["tag1", "tag2"]],
             ["object", { key: "value" }, { key: "value" }]
         ])("should handle %s values", (_, value, expected) => {
             const operation = AddFieldsOperation.addField("field", value);
             const doc = operation.toDocument(context);

             expect(doc).toEqual({
                 $addFields: { field: expected }
             });
         });

        it("should handle and() method for chaining", () => {
            const operation = AddFieldsOperation.addField("name", "John");
            const chainedOperation = operation.and()
                .addField("age").withValue(25)
                .build();
            
            const doc = chainedOperation.toDocument(context);

            expect(doc).toEqual({
                $addFields: { name: "John", age: 25 }
            });
        });
    });

    describe("MongoDB operator validation", () => {
        it("should return correct MongoDB operator and generate valid document structure", () => {
            const operation = AddFieldsOperation.addField("name", "John");
            expect(operation["mongoOperator"]()).toBe("$addFields");
            
            const doc = operation.toDocument(context);
            expect(doc).toHaveProperty("$addFields");
            expect(typeof doc.$addFields).toBe("object");
        });
    });

    describe("Real-world scenarios", () => {
        it("should create user profile with computed fields", () => {
            const operation = AddFieldsOperation.builder()
                .addField("fullName").withValueOf(ArithmeticOperators.add("$firstName").add("$lastName"))
                .addField("age").withValue(25)
                .addField("isActive").withValue(true)
                .addField("tags").withValue(["user", "premium"])
                .build();
            
            const doc = operation.toDocument(context);

            expect(doc).toEqual({
                $addFields: { 
                    fullName: { $add: ["$firstName", "$lastName"] },
                    age: 25,
                    isActive: true,
                    tags: ["user", "premium"]
                }
            });
        });

        it("should create computed pricing fields", () => {
            const operation = AddFieldsOperation.builder()
                .addField("total").withValueOf(ArithmeticOperators.add("$price").add("$tax"))
                .addField("discount").withValueOf(ArithmeticOperators.multiply("$price").multiplyBy(0.1))
                .addField("finalPrice").withValueOf(ArithmeticOperators.subtract("$total").subtract("$discount"))
                .build();
            
            const doc = operation.toDocument(context);

            expect(doc).toEqual({
                $addFields: { 
                    total: { $add: ["$price", "$tax"] },
                    discount: { $multiply: ["$price", 0.1] },
                    finalPrice: { $subtract: ["$total", "$discount"] }
                }
            });
        });
    });

    describe("Error handling and edge cases", () => {
        it("should handle withValueOfExpression method (not implemented)", () => {
            const builder = AddFieldsOperation.builder();
            const valueAppender = builder.addField("field");
            
            expect(() => {
                valueAppender.withValueOfExpression("$add", "value1", "value2");
            }).toThrow("Method not implemented.");
        });

        it("should handle empty field name", () => {
            const operation = AddFieldsOperation.addField("", "value");
            const doc = operation.toDocument(context);

            expect(doc).toEqual({
                $addFields: { "": "value" }
            });
        });

        it("should handle complex nested objects", () => {
            const operation = AddFieldsOperation.addField("config", {
                theme: "dark",
                settings: {
                    notifications: true,
                    language: "en"
                }
            });
            const doc = operation.toDocument(context);

            expect(doc).toEqual({
                $addFields: { 
                    config: {
                        theme: "dark",
                        settings: {
                            notifications: true,
                            language: "en"
                        }
                    }
                }
            });
        });

        it("should handle null values", () => {
            const operation = AddFieldsOperation.addField("field", null);
            const doc = operation.toDocument(context);

            expect(doc).toEqual({
                $addFields: { field: null }
            });
        });
    });

    describe("Constructor overloads", () => {
        it("should handle constructor with Map source", () => {
            const sourceMap = new Map([["field1", "value1"], ["field2", "value2"]]);
            const operation = AddFieldsOperation.internalCreateAddFieldOperation(sourceMap);
            const doc = operation.toDocument(context);

            expect(doc).toEqual({
                $addFields: { field1: "value1", field2: "value2" }
            });
        });

        it("should handle constructor with field and value", () => {
            const operation = AddFieldsOperation.addField("field", "value");
            const doc = operation.toDocument(context);

            expect(doc).toEqual({
                $addFields: { field: "value" }
            });
        });
    });
});
