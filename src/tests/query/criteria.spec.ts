import { Clause } from "../../query/clause";

describe("Clause query builder", () => {
    it("should create simple equality criteria using is()", () => {
        const criteria = Clause.where("name").is("Alice");

        expect(criteria.getCriteriaObject()).toEqual({
            name: "Alice"
        });
    });

    it("should chain comparison operators", () => {
        const criteria = Clause.where("age").gt(18).lt(65);

        expect(criteria.getCriteriaObject()).toEqual({
            age: {
                $gt: 18,
                $lt: 65
            }
        });
    });

    it("should combine logical operators and/or", () => {
        const criteria = Clause.where("age").gt(18).and(
            Clause.where("status").is("ACTIVE"),
            Clause.where("score").gte(70)
        );

        expect(criteria.getCriteriaObject()).toEqual({
            age: { $gt: 18 },
            $and: [
                { status: "ACTIVE" },
                { score: { $gte: 70 } }
            ]
        });
    });

    it("should support regex expressions", () => {
        const criteria = Clause.where("name").regex(/john/i);

        const object = criteria.getCriteriaObject();
        expect(object.name).toEqual(/john/i);
    });

    it("should set exists and size operators", () => {
        const criteria = Clause.where("tags").exists(true).size(3);

        expect(criteria.getCriteriaObject()).toEqual({
            tags: {
                $exists: true,
                $size: 3
            }
        });
    });

    it("should create $elemMatch expressions", () => {
        const criteria = Clause.where("items").elemMatch(
            Clause.where("price").lt(100)
        );

        expect(criteria.getCriteriaObject()).toEqual({
            items: {
                $elemMatch: {
                    price: {
                        $lt: 100
                    }
                }
            }
        });
    });

    it("should combine with or operator", () => {
        const criteria = Clause.where("name").is("Alice").or(
            Clause.where("age").lt(30),
            Clause.where("status").is("VIP")
        );

        expect(criteria.getCriteriaObject()).toEqual({
            name: "Alice",
            $or: [
                { age: { $lt: 30 } },
                { status: "VIP" }
            ]
        });
    });

    it("should throw error for multiple is() calls", () => {
        const criteria = Clause.where("name").is("Alice");
        expect(() => criteria.is("Bob")).toThrow(
            "Multiple 'is' values declared; You need to use 'and' with multiple criteria"
        );
    });

    it("should throw error for not + is combination", () => {
        const criteria = Clause.where("name").not(null);
        expect(() => criteria.is("Alice")).toThrow(
            "Invalid query: 'not' can't be used with 'is' - use 'ne' instead"
        );
    });

    it("should create $expr criteria", () => {
        const criteria = new Clause().expr({ $eq: ["$qty", 250] });

        expect(criteria.getCriteriaObject()).toEqual({
            $expr: { $eq: ["$qty", 250] }
        });
    });

    it("should create $in and $nin arrays", () => {
        const criteria = Clause.where("role").in("ADMIN", "USER").nin("BANNED");

        expect(criteria.getCriteriaObject()).toEqual({
            role: {
                $in: ["ADMIN", "USER"],
                $nin: ["BANNED"]
            }
        });
    });
});

