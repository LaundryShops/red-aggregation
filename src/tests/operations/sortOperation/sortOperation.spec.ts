import { SortOperation } from "../../../operations/sortOperation";
import { Sort } from "../../../domain/sort";
import { Order, Direction } from "../../../domain/order";
import { NoOpAggregationOperationContext } from "../../../aggregate/aggregateOperationContext/noOpAggregationOperationContext";

describe("SortOperation", () => {
    let context: NoOpAggregationOperationContext;

    beforeEach(() => {
        context = new NoOpAggregationOperationContext();
    });

    describe("Constructor", () => {
        it("should create SortOperation with Sort", () => {
            const sort = Sort.by("name");
            const operation = new SortOperation(sort);

            expect(operation).toBeInstanceOf(SortOperation);
        });

        it("should throw error when sort is null", () => {
            expect(() => new SortOperation(null as any)).toThrow("Sort must not be null");
        });
    });

    describe("Basic sort operations", () => {
        it("should create sort by single property with ascending direction", () => {
            const sort = Sort.by("name");
            const operation = new SortOperation(sort);
            const doc = operation.toDocument(context);

            expect(doc).toEqual({
                $sort: { name: 1 }
            });
        });

        it("should create sort by single property with descending direction", () => {
            const sort = Sort.by(Direction.DESC, "price");
            const operation = new SortOperation(sort);
            const doc = operation.toDocument(context);

            expect(doc).toEqual({
                $sort: { price: -1 }
            });
        });

        it("should create sort by multiple properties", () => {
            const sort = Sort.by(Direction.ASC, "category", "name");
            const operation = new SortOperation(sort);
            const doc = operation.toDocument(context);

            expect(doc).toEqual({
                $sort: { category: 1, name: 1 }
            });
        });

        it("should create sort with mixed directions", () => {
            const sort = Sort.by(Order.asc("category"), Order.desc("price"));
            const operation = new SortOperation(sort);
            const doc = operation.toDocument(context);

            expect(doc).toEqual({
                $sort: { category: 1, price: -1 }
            });
        });
    });

    describe("and() method", () => {
        it("should chain sort with another Sort", () => {
            const sort1 = Sort.by("name");
            const sort2 = Sort.by(Direction.DESC, "price");
            const operation = new SortOperation(sort1);
            const combinedOperation = operation.and(sort2);
            const doc = combinedOperation.toDocument(context);

            expect(doc).toEqual({
                $sort: { name: 1, price: -1 }
            });
        });

        it("should chain sort with direction and fields", () => {
            const sort = Sort.by("name");
            const operation = new SortOperation(sort);
            const combinedOperation = operation.and(Direction.DESC, "price", "amount");
            const doc = combinedOperation.toDocument(context);

            expect(doc).toEqual({
                $sort: { name: 1, price: -1, amount: -1 }
            });
        });

        it("should chain multiple and() calls", () => {
            const sort = Sort.by("name");
            const operation = new SortOperation(sort);
            const combinedOperation = operation
                .and(Direction.DESC, "price")
                .and(Direction.ASC, "category");
            const doc = combinedOperation.toDocument(context);

            expect(doc).toEqual({
                $sort: { name: 1, price: -1, category: 1 }
            });
        });
    });

    describe("MongoDB operator", () => {
        it("should return correct operator name", () => {
            const sort = Sort.by("name");
            const operation = new SortOperation(sort);

            expect(operation.getOperator()).toBe("$sort");
        });
    });

    describe("Complex sort scenarios", () => {
        it("should handle empty sort", () => {
            const sort = Sort.unsorted();
            const operation = new SortOperation(sort);
            const doc = operation.toDocument(context);

            expect(doc).toEqual({
                $sort: {}
            });
        });

        it("should handle sort with multiple directions", () => {
            const sort = Sort.by(
                Order.asc("status"),
                Order.desc("createdAt"),
                Order.asc("name")
            );
            const operation = new SortOperation(sort);
            const doc = operation.toDocument(context);

            expect(doc).toEqual({
                $sort: { status: 1, createdAt: -1, name: 1 }
            });
        });

        it("should handle sort with all descending", () => {
            const sort = Sort.by(Direction.DESC, "field1", "field2", "field3");
            const operation = new SortOperation(sort);
            const doc = operation.toDocument(context);

            expect(doc).toEqual({
                $sort: { field1: -1, field2: -1, field3: -1 }
            });
        });
    });

    describe("Field reference handling", () => {
        it("should handle field references correctly", () => {
            const sort = Sort.by("name");
            const operation = new SortOperation(sort);
            const doc = operation.toDocument(context);

            expect(doc).toEqual({
                $sort: { name: 1 }
            });
        });

        it("should handle field references with descending", () => {
            const sort = Sort.by(Direction.DESC, "total", "count");
            const operation = new SortOperation(sort);
            const doc = operation.toDocument(context);

            expect(doc).toEqual({
                $sort: { total: -1, count: -1 }
            });
        });
    });

    describe("Sort methods integration", () => {
        it("should work with Sort.by() default direction", () => {
            const sort = Sort.by("age");
            const operation = new SortOperation(sort);
            const doc = operation.toDocument(context);

            expect(doc).toEqual({
                $sort: { age: 1 }
            });
        });

        it("should work with Sort.fromOrder()", () => {
            const sort = Sort.fromOrder(
                Order.asc("name"),
                Order.desc("age")
            );
            const operation = new SortOperation(sort);
            const doc = operation.toDocument(context);

            expect(doc).toEqual({
                $sort: { name: 1, age: -1 }
            });
        });

        it("should work with Sort.ascending()", () => {
            const sort = Sort.by(Direction.DESC, "price").ascending();
            const operation = new SortOperation(sort);
            const doc = operation.toDocument(context);

            expect(doc).toEqual({
                $sort: { price: 1 }
            });
        });

        it("should work with Sort.descending()", () => {
            const sort = Sort.by("price").descending();
            const operation = new SortOperation(sort);
            const doc = operation.toDocument(context);

            expect(doc).toEqual({
                $sort: { price: -1 }
            });
        });
    });
});

