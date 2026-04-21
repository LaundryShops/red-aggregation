import { Assert } from "../../utils/assert";

describe("Assert", () => {
    describe("isInstanceOf", () => {
        class TestClass {
            value: string;
            constructor(value: string) {
                this.value = value;
            }
        }

        class OtherClass {
            data: number;
            constructor(data: number) {
                this.data = data;
            }
        }

        describe("with class constructor", () => {
            it("should not throw when value is instance of class", () => {
                const instance = new TestClass("test");
                expect(() => Assert.isInstanceOf(TestClass, instance)).not.toThrow();
            });

            it("should throw TypeError when value is not instance of class", () => {
                const other = new OtherClass(123);
                expect(() => Assert.isInstanceOf(TestClass, other)).toThrow(TypeError);
                expect(() => Assert.isInstanceOf(TestClass, other)).toThrow(/Invalid type/);
            });

            it("should throw with custom message", () => {
                const other = new OtherClass(123);
                expect(() => Assert.isInstanceOf(TestClass, other, "Must be TestClass"))
                    .toThrow("Must be TestClass");
            });
        });

        describe("with primitive type 'string'", () => {
            it("should not throw when value is string", () => {
                expect(() => Assert.isInstanceOf("string", "hello")).not.toThrow();
            });

            it("should throw TypeError when value is not string", () => {
                expect(() => Assert.isInstanceOf("string", 123)).toThrow(TypeError);
                expect(() => Assert.isInstanceOf("string", null)).toThrow(TypeError);
                expect(() => Assert.isInstanceOf("string", undefined)).toThrow(TypeError);
            });
        });

        describe("with primitive type 'number'", () => {
            it("should not throw when value is number", () => {
                expect(() => Assert.isInstanceOf("number", 42)).not.toThrow();
                expect(() => Assert.isInstanceOf("number", 3.14)).not.toThrow();
                expect(() => Assert.isInstanceOf("number", 0)).not.toThrow();
            });

            it("should throw TypeError when value is not number", () => {
                expect(() => Assert.isInstanceOf("number", "42")).toThrow(TypeError);
                expect(() => Assert.isInstanceOf("number", null)).toThrow(TypeError);
            });
        });

        describe("with primitive type 'boolean'", () => {
            it("should not throw when value is boolean", () => {
                expect(() => Assert.isInstanceOf("boolean", true)).not.toThrow();
                expect(() => Assert.isInstanceOf("boolean", false)).not.toThrow();
            });

            it("should throw TypeError when value is not boolean", () => {
                expect(() => Assert.isInstanceOf("boolean", 1)).toThrow(TypeError);
                expect(() => Assert.isInstanceOf("boolean", "true")).toThrow(TypeError);
            });
        });
    });

    describe("notNull", () => {
        it("should not throw when value is not null or undefined", () => {
            expect(() => Assert.notNull("value", "Must not be null")).not.toThrow();
            expect(() => Assert.notNull(0, "Must not be null")).not.toThrow();
            expect(() => Assert.notNull(false, "Must not be null")).not.toThrow();
            expect(() => Assert.notNull([], "Must not be null")).not.toThrow();
            expect(() => Assert.notNull({}, "Must not be null")).not.toThrow();
        });

        it("should throw when value is null", () => {
            expect(() => Assert.notNull(null, "Value is null")).toThrow("Value is null");
        });

        it("should throw when value is undefined", () => {
            expect(() => Assert.notNull(undefined, "Value is undefined"))
                .toThrow("Value is undefined");
        });

        describe("with arrays", () => {
            it("should throw when array contains null", () => {
                expect(() => Assert.notNull([1, null, 3], "Array has null"))
                    .toThrow("Array has null");
            });

            it("should throw when array contains undefined", () => {
                expect(() => Assert.notNull([1, undefined, 3], "Array has undefined"))
                    .toThrow("Array has undefined");
            });

            it("should not throw when array has no null or undefined", () => {
                expect(() => Assert.notNull([1, 2, 3], "Valid array")).not.toThrow();
                expect(() => Assert.notNull(["a", "b"], "Valid array")).not.toThrow();
            });

            it("should not throw for empty array", () => {
                expect(() => Assert.notNull([], "Empty array")).not.toThrow();
            });
        });
    });

    describe("notEmpty", () => {
        describe("with strings", () => {
            it("should not throw when string has content", () => {
                expect(() => Assert.notEmpty("hello", "Must not be empty")).not.toThrow();
                expect(() => Assert.notEmpty("a", "Must not be empty")).not.toThrow();
            });

            it("should throw when string is empty", () => {
                expect(() => Assert.notEmpty("", "String is empty")).toThrow("String is empty");
            });

            it("should throw when string is whitespace only", () => {
                expect(() => Assert.notEmpty("   ", "String is whitespace"))
                    .toThrow("String is whitespace");
            });

            it("should throw when string is null or undefined", () => {
                expect(() => Assert.notEmpty(null as any, "String is null")).toThrow("String is null");
                expect(() => Assert.notEmpty(undefined as any, "String is undefined"))
                    .toThrow("String is undefined");
            });
        });

        describe("with arrays", () => {
            it("should not throw when array has elements", () => {
                expect(() => Assert.notEmpty([1, 2], "Must not be empty")).not.toThrow();
                expect(() => Assert.notEmpty(["a"], "Must not be empty")).not.toThrow();
            });

            it("should throw when array is empty", () => {
                expect(() => Assert.notEmpty([], "Array is empty")).toThrow("Array is empty");
            });
        });
    });

    describe("noNullElements", () => {
        it("should not throw when array has no null elements", () => {
            const arr = [1, 2, 3];
            expect(() => Assert.noNullElements(arr, "No nulls")).not.toThrow();
        });

        it("should throw when array contains null", () => {
            const arr = [1, null, 3];
            expect(() => Assert.noNullElements(arr, "Has null")).toThrow("Has null");
        });

        it("should throw when array contains undefined", () => {
            const arr = [1, undefined, 3];
            expect(() => Assert.noNullElements(arr, "Has undefined")).toThrow("Has undefined");
        });

        it("should throw when value is not an array", () => {
            expect(() => Assert.noNullElements("not array" as any, "Not an array"))
                .toThrow("Not an array");
        });

        it("should work with type assertion", () => {
            const arr: (string | null)[] = ["a", "b", "c"];
            Assert.noNullElements(arr, "No nulls");
            // After assertion, arr should be string[]
            expect(arr).toEqual(["a", "b", "c"]);
        });
    });

    describe("notEmptyArray", () => {
        it("should not throw when array has elements", () => {
            expect(() => Assert.notEmptyArray([1], "Array empty")).not.toThrow();
        });

        it("should throw when array is empty", () => {
            expect(() => Assert.notEmptyArray([], "Array is empty")).toThrow("Array is empty");
        });

        it("should throw when array is null", () => {
            expect(() => Assert.notEmptyArray(null as any, "Array is null")).toThrow("Array is null");
        });
    });

    describe("hasText", () => {
        it("should not throw when string has non-whitespace content", () => {
            expect(() => Assert.hasText("hello", "Must have text")).not.toThrow();
        });

        it("should throw when string is empty", () => {
            expect(() => Assert.hasText("", "No text")).toThrow("No text");
        });

        it("should throw when string is whitespace only", () => {
            expect(() => Assert.hasText("   ", "Only whitespace")).toThrow("Only whitespace");
        });

        it("should throw when string is null", () => {
            expect(() => Assert.hasText(null as any, "Null text")).toThrow("Null text");
        });
    });

    describe("isTrue", () => {
        it("should not throw when condition is true", () => {
            expect(() => Assert.isTrue(true, "Must be true")).not.toThrow();
            expect(() => Assert.isTrue(1 === 1, "Must be true")).not.toThrow();
        });

        it("should throw when condition is false", () => {
            expect(() => Assert.isTrue(false, "Condition failed")).toThrow("Condition failed");
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            let falseCondition = false;
            falseCondition = (2 > 3);
            expect(() => Assert.isTrue(falseCondition, "Math error")).toThrow("Math error");
        });
    });

    describe("state", () => {
        it("should not throw when expression is true", () => {
            expect(() => Assert.state(true, "Invalid state")).not.toThrow();
        });

        it("should throw when expression is false", () => {
            expect(() => Assert.state(false, "Invalid state")).toThrow("Invalid state");
        });

        it("should work with complex expressions", () => {
            const obj = { count: 5 };
            expect(() => Assert.state(obj.count > 0, "Count must be positive")).not.toThrow();
            expect(() => Assert.state(obj.count > 10, "Count too small")).toThrow("Count too small");
        });
    });

    describe("stateWithSupplier", () => {
        it("should not throw when expression is true", () => {
            const supplier = jest.fn(() => "Error message");
            expect(() => Assert.stateWithSupplier(true, supplier)).not.toThrow();
            expect(supplier).not.toHaveBeenCalled();
        });

        it("should throw with message from supplier when expression is false", () => {
            const supplier = jest.fn(() => "Lazy error message");
            expect(() => Assert.stateWithSupplier(false, supplier)).toThrow("Lazy error message");
            expect(supplier).toHaveBeenCalledTimes(1);
        });

        it("should not call supplier when not needed", () => {
            const expensiveSupplier = jest.fn(() => `Error at ${Date.now()}`);
            Assert.stateWithSupplier(true, expensiveSupplier);
            expect(expensiveSupplier).not.toHaveBeenCalled();
        });
    });

    describe("stateWithError", () => {
        it("should not throw when expression is true", () => {
            const errorFactory = jest.fn(() => new RangeError("Out of range"));
            expect(() => Assert.stateWithError(true, errorFactory)).not.toThrow();
            expect(errorFactory).not.toHaveBeenCalled();
        });

        it("should throw custom error type when expression is false", () => {
            const errorFactory = () => new RangeError("Value out of range");
            expect(() => Assert.stateWithError(false, errorFactory)).toThrow(RangeError);
            expect(() => Assert.stateWithError(false, errorFactory)).toThrow("Value out of range");
        });

        it("should throw custom error type (TypeError)", () => {
            const errorFactory = () => new TypeError("Invalid type provided");
            expect(() => Assert.stateWithError(false, errorFactory)).toThrow(TypeError);
            expect(() => Assert.stateWithError(false, errorFactory)).toThrow("Invalid type provided");
        });

        it("should throw custom error with complex factory", () => {
            class ValidationError extends Error {
                field: string;
                constructor(field: string, message: string) {
                    super(message);
                    this.field = field;
                }
            }

            const errorFactory = () => new ValidationError("email", "Invalid email format");
            try {
                Assert.stateWithError(false, errorFactory);
                fail("Should have thrown");
            } catch (e) {
                expect(e).toBeInstanceOf(ValidationError);
                expect((e as ValidationError).field).toBe("email");
                expect((e as Error).message).toBe("Invalid email format");
            }
        });
    });
});
