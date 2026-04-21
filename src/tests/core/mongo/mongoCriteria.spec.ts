import type { Document, Filter } from "mongodb";
import { criteriaToFilter } from "../../../core/mongo/mongoCriteria";
import { ClauseDefinition } from "../../../query/standardDefinition";

// Test helper class that extends ClauseDefinition
class TestClause extends ClauseDefinition {
    constructor(private readonly criteriaDoc: Document) {
        super();
    }

    getCriteriaObject(): Document {
        return this.criteriaDoc;
    }

    getKey(): string | null {
        return null;
    }
}

describe("criteriaToFilter", () => {
    it("should convert plain object criteria to Filter", () => {
        const criteria = { name: "John", age: 30 };
        const filter = criteriaToFilter(criteria);

        expect(filter).toEqual({ name: "John", age: 30 });
    });

    it("should convert ClauseDefinition to Filter using getCriteriaObject", () => {
        const criteriaDoc = { status: "active", count: { $gt: 5 } };
        const clause = new TestClause(criteriaDoc);
        const filter = criteriaToFilter(clause);

        expect(filter).toEqual(criteriaDoc);
    });

    it("should handle empty object criteria", () => {
        const criteria = {};
        const filter = criteriaToFilter(criteria);

        expect(filter).toEqual({});
    });

    it("should handle complex MongoDB operators", () => {
        const criteria = {
            age: { $gte: 18, $lte: 65 },
            name: { $in: ["Alice", "Bob"] },
            $or: [{ status: "active" }, { role: "admin" }]
        };
        const filter = criteriaToFilter(criteria);

        expect(filter).toEqual(criteria);
    });

    it("should handle nested object criteria", () => {
        const criteria = {
            "address.city": "New York",
            "address.zip": { $regex: "^10" }
        };
        const filter = criteriaToFilter(criteria);

        expect(filter).toEqual(criteria);
    });

    it("should handle null and undefined values in criteria", () => {
        const criteria = {
            deletedAt: null,
            optional: undefined
        };
        const filter = criteriaToFilter(criteria);

        expect(filter).toEqual(criteria);
    });

    it("should handle ClauseDefinition with complex criteria", () => {
        const complexCriteria = {
            $and: [
                { category: "electronics" },
                { price: { $lt: 1000 } },
                { $or: [{ brand: "Apple" }, { brand: "Samsung" }] }
            ]
        };
        const clause = new TestClause(complexCriteria);
        const filter = criteriaToFilter(clause);

        expect(filter).toEqual(complexCriteria);
    });

    it("should handle array values in criteria", () => {
        const criteria = {
            tags: ["featured", "new"],
            ids: [1, 2, 3, 4, 5]
        };
        const filter = criteriaToFilter(criteria);

        expect(filter).toEqual(criteria);
    });

    it("should handle boolean values in criteria", () => {
        const criteria = {
            isActive: true,
            isDeleted: false
        };
        const filter = criteriaToFilter(criteria);

        expect(filter).toEqual(criteria);
    });

    it("should handle date values in criteria", () => {
        const date = new Date("2024-01-15");
        const criteria = {
            createdAt: { $gte: date },
            updatedAt: date
        };
        const filter = criteriaToFilter(criteria);

        expect(filter).toEqual(criteria);
    });

    it("should handle id field in criteria", () => {
        const criteria = {
            userId: "user-123"
        };
        const filter = criteriaToFilter(criteria);

        expect(filter).toEqual(criteria);
    });

    it("should return the same Filter type for both plain objects and ClauseDefinition", () => {
        const plainCriteria = { type: "test" };
        const clauseCriteria = new TestClause({ type: "test" });

        const plainFilter = criteriaToFilter(plainCriteria);
        const clauseFilter = criteriaToFilter(clauseCriteria);

        expect(plainFilter).toEqual(clauseFilter);
    });

    it("should handle ClauseDefinition subclass with custom behavior", () => {
        class CustomClause extends ClauseDefinition {
            constructor(private field: string, private value: unknown) {
                super();
            }

            getCriteriaObject(): Document {
                return { [this.field]: this.value };
            }

            getKey(): string | null {
                return this.field;
            }
        }

        const clause = new CustomClause("customField", "customValue");
        const filter = criteriaToFilter(clause);

        expect(filter).toEqual({ customField: "customValue" });
    });
});
