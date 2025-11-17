import { CountOperation, CountOperationBuilder } from "../../../operations/countOperation";
import { NoOpAggregationOperationContext } from "../../../aggregate/aggregateOperationContext/noOpAggregationOperationContext";
import { ExposedField } from "../../../aggregate/field/exposeField";

describe("CountOperation", () => {
    let context: NoOpAggregationOperationContext;

    beforeEach(() => {
        context = new NoOpAggregationOperationContext();
    });

    describe("Constructor", () => {
        it("should create CountOperation with field name", () => {
            const operation = new CountOperation("total");

            expect(operation).toBeInstanceOf(CountOperation);
            expect(operation.fieldName).toBe("total");
        });

        it("should throw error when field name is null", () => {
            expect(() => new CountOperation(null as any)).toThrow("Field name must not be null");
        });

        it("should throw error when field name is undefined", () => {
            expect(() => new CountOperation(undefined as any)).toThrow("Field name must not be null");
        });

        it("should throw error when field name is empty string", () => {
            expect(() => new CountOperation("")).toThrow("Field name must not be null");
        });

        it("should throw error when field name is whitespace only", () => {
            expect(() => new CountOperation("   ")).toThrow("Field name must not be null");
        });
    });

    describe("Basic count operations", () => {
        it("should create $count operation with field name", () => {
            const operation = new CountOperation("total");
            const doc = operation.toDocument(context);

            expect(doc).toEqual({
                $count: "total"
            });
        });

        it("should create $count operation with different field name", () => {
            const operation = new CountOperation("productCount");
            const doc = operation.toDocument(context);

            expect(doc).toEqual({
                $count: "productCount"
            });
        });

        it("should create $count operation with trimmed field name", () => {
            const operation = new CountOperation("  result  ");
            const doc = operation.toDocument(context);

            expect(doc).toEqual({
                $count: "  result  "
            });
        });
    });

    describe("MongoDB operator", () => {
        it("should return correct operator name", () => {
            const operation = new CountOperation("total");

            expect(operation.getOperator()).toBe("$count");
        });
    });

    describe("getFields() method", () => {
        it("should return ExposedFields with correct field", () => {
            const operation = new CountOperation("total");
            const fields = operation.getFields();

            expect(fields).toBeDefined();
            const fieldsArray = Array.from(fields);
            expect(fieldsArray).toHaveLength(1);
            expect(fieldsArray[0]).toBeInstanceOf(ExposedField);
            expect(fieldsArray[0].getName()).toBe("total");
        });

        it("should return synthetic ExposedField", () => {
            const operation = new CountOperation("count");
            const fields = operation.getFields();
            const fieldsArray = Array.from(fields);

            expect(fieldsArray[0].isSynthetic()).toBe(true);
        });
    });

    describe("inheritsFields() method", () => {
        it("should return false", () => {
            const operation = new CountOperation("total");

            expect(operation.inheritsFields()).toBe(false);
        });
    });

    describe("CountOperationBuilder", () => {
        it("should create CountOperation using builder", () => {
            const builder = new CountOperationBuilder();
            const operation = builder.as("total");

            expect(operation).toBeInstanceOf(CountOperation);
            expect(operation.fieldName).toBe("total");
        });

        it("should create CountOperation with builder and generate correct document", () => {
            const builder = new CountOperationBuilder();
            const operation = builder.as("productCount");
            const doc = operation.toDocument(context);

            expect(doc).toEqual({
                $count: "productCount"
            });
        });

        it("should throw error when builder as() receives empty string", () => {
            const builder = new CountOperationBuilder();

            expect(() => builder.as("")).toThrow("Field name must not be null");
        });

        it("should throw error when builder as() receives null", () => {
            const builder = new CountOperationBuilder();

            expect(() => builder.as(null as any)).toThrow("Field name must not be null");
        });
    });

    describe("Field name variations", () => {
        it.each([
            ["simpleName", "simpleName"],
            ["camelCase", "camelCase"],
            ["snake_case", "snake_case"],
            ["PascalCase", "PascalCase"],
            ["UPPERCASE", "UPPERCASE"],
            ["123numeric", "123numeric"],
            ["special$field", "special$field"]
        ])("should handle field name '%s'", (fieldName, expected) => {
            const operation = new CountOperation(fieldName);
            const doc = operation.toDocument(context);

            expect(doc).toEqual({
                $count: expected
            });
        });
    });
});

