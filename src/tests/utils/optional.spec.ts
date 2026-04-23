import { Optional, isPresent, orElse, ifPresent } from "../../utils/optional";

describe("Optional utility functions", () => {
    describe("isPresent", () => {
        it("should return true for non-null values", () => {
            expect(isPresent("value")).toBe(true);
            expect(isPresent(0)).toBe(true);
            expect(isPresent(false)).toBe(true);
            expect(isPresent([])).toBe(true);
            expect(isPresent({})).toBe(true);
        });

        it("should return false for null", () => {
            expect(isPresent(null)).toBe(false);
        });

        it("should return false for undefined", () => {
            expect(isPresent(undefined)).toBe(false);
        });

        it("should work as type guard", () => {
            const value: string | null = "test";
            if (isPresent(value)) {
                // TypeScript should know value is string here
                expect(value.length).toBe(4);
            }
        });
    });

    describe("orElse", () => {
        it("should return value when present", () => {
            expect(orElse("actual", "fallback")).toBe("actual");
            expect(orElse(42, 0)).toBe(42);
        });

        it("should return fallback when value is null", () => {
            expect(orElse(null, "fallback")).toBe("fallback");
        });

        it("should return fallback when value is undefined", () => {
            expect(orElse(undefined, "fallback")).toBe("fallback");
        });

        it("should handle falsy values correctly", () => {
            expect(orElse(0, 999)).toBe(0);
            expect(orElse(false, true)).toBe(false);
            expect(orElse("", "default")).toBe("");
        });
    });

    describe("ifPresent", () => {
        it("should call consumer when value is present", () => {
            const consumer = jest.fn();
            ifPresent("value", consumer);
            expect(consumer).toHaveBeenCalledWith("value");
            expect(consumer).toHaveBeenCalledTimes(1);
        });

        it("should not call consumer when value is null", () => {
            const consumer = jest.fn();
            ifPresent(null, consumer);
            expect(consumer).not.toHaveBeenCalled();
        });

        it("should not call consumer when value is undefined", () => {
            const consumer = jest.fn();
            ifPresent(undefined, consumer);
            expect(consumer).not.toHaveBeenCalled();
        });

        it("should call consumer with 0 and false", () => {
            const consumer = jest.fn();
            ifPresent(0, consumer);
            expect(consumer).toHaveBeenCalledWith(0);

            ifPresent(false, consumer);
            expect(consumer).toHaveBeenCalledWith(false);
        });
    });
});

describe("Optional class", () => {
    describe("constructor", () => {
        it("should create with non-null value", () => {
            const optional = new Optional("value");
            expect(optional.orElse("fallback")).toBe("value");
        });

        it("should create with null value", () => {
            const optional = new Optional<string>(null);
            expect(optional.orElse("fallback")).toBe("fallback");
        });
    });

    describe("static empty", () => {
        it("should create empty optional", () => {
            const optional = Optional.empty<string>();
            expect(optional.orElse("fallback")).toBe("fallback");
        });

        it("should create empty optional of any type", () => {
            const numberOptional = Optional.empty<number>();
            expect(numberOptional.orElse(42)).toBe(42);

            const objectOptional = Optional.empty<{ a: number }>();
            expect(objectOptional.orElse({ a: 1 })).toEqual({ a: 1 });
        });
    });

    describe("filter", () => {
        it("should return value when predicate matches", () => {
            const optional = new Optional(10);
            const filtered = optional.filter(v => v > 5);
            expect(filtered.orElse(0)).toBe(10);
        });

        it("should return empty when predicate does not match", () => {
            const optional = new Optional(3);
            const filtered = optional.filter(v => v > 5);
            expect(filtered.orElse(0)).toBe(0);
        });

        it("should return empty when original is empty", () => {
            const optional = Optional.empty<number>();
            const filtered = optional.filter(v => v > 5);
            expect(filtered.orElse(0)).toBe(0);
        });

        it("should handle complex predicates", () => {
            interface User { name: string; age: number; }
            const user: User = { name: "Alice", age: 25 };
            const optional = new Optional(user);

            const adults = optional.filter(u => u.age >= 18);
            expect(adults.orElse({ name: "", age: 0 })).toEqual(user);

            const seniors = optional.filter(u => u.age >= 65);
            expect(seniors.orElse({ name: "", age: 0 })).toEqual({ name: "", age: 0 });
        });
    });

    describe("map", () => {
        it("should transform value when present", () => {
            const optional = new Optional(5);
            const mapped = optional.map(v => v * 2);
            expect(mapped.orElse(0)).toBe(10);
        });

        it("should return empty when original is empty", () => {
            const optional = Optional.empty<number>();
            const mapped = optional.map(v => v * 2);
            expect(mapped.orElse(0)).toBe(0);
        });

        it("should chain multiple maps", () => {
            const optional = new Optional(2);
            const result = optional
                .map(v => v + 1)
                .map(v => v * 3)
                .map(v => v.toString());

            expect(result.orElse("0")).toBe("9");
        });

        it("should handle type changes in map", () => {
            interface User { name: string; }
            const user: User = { name: "Bob" };
            const optional = new Optional(user);

            const nameLength = optional.map(u => u.name.length);
            expect(nameLength.orElse(0)).toBe(3);
        });
    });

    describe("orElse", () => {
        it("should return value when present", () => {
            const optional = new Optional("actual");
            expect(optional.orElse("fallback")).toBe("actual");
        });

        it("should return default when empty", () => {
            const optional = Optional.empty<string>();
            expect(optional.orElse("fallback")).toBe("fallback");
        });

        it("should return falsy values correctly", () => {
            const optional = new Optional(0);
            expect(optional.orElse(999)).toBe(0);
        });
    });

    describe("chaining operations", () => {
        it("should support filter then map chain", () => {
            const optional = new Optional(10);
            const result = optional
                .filter(v => v > 5)
                .map(v => v * 2)
                .orElse(0);
            expect(result).toBe(20);
        });

        it("should short-circuit on filter failure", () => {
            const optional = new Optional(3);
            const mapFn = jest.fn(v => v * 2);

            const result = optional
                .filter(v => v > 5)
                .map(mapFn)
                .orElse(0);

            expect(result).toBe(0);
            expect(mapFn).not.toHaveBeenCalled();
        });

        it("should handle complex chaining scenarios", () => {
            interface Order {
                items: { price: number; }[];
            }

            const order: Order = {
                items: [{ price: 10 }, { price: 20 }, { price: 30 }]
            };

            const totalPrice = new Optional(order)
                .filter(o => o.items.length > 0)
                .map(o => o.items.reduce((sum, item) => sum + item.price, 0))
                .filter(total => total > 50)
                .orElse(0);

            expect(totalPrice).toBe(60);
        });
    });
});
