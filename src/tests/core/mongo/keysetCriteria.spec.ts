import { Direction } from "../../../domain/order";
import { Sort } from "../../../domain/sort";
import { DefaultKeyset } from "../../../domain/keysetPage/defaultKeySet";
import { buildKeysetFilter, reverseSort } from "../../../core/mongo/keysetCriteria";

describe("buildKeysetFilter", () => {
    it("builds a $gt filter for a single ascending field seeking NEXT", () => {
        const sort = Sort.by(Direction.ASC, "createdAt");
        const filter = buildKeysetFilter(sort, new DefaultKeyset([10]), "NEXT");

        expect(filter).toEqual({ $or: [{ createdAt: { $gt: 10 } }] });
    });

    it("builds a $lt filter for a single ascending field seeking PREVIOUS", () => {
        const sort = Sort.by(Direction.ASC, "createdAt");
        const filter = buildKeysetFilter(sort, new DefaultKeyset([10]), "PREVIOUS");

        expect(filter).toEqual({ $or: [{ createdAt: { $lt: 10 } }] });
    });

    it("builds a $lt filter for a single descending field seeking NEXT", () => {
        const sort = Sort.by(Direction.DESC, "createdAt");
        const filter = buildKeysetFilter(sort, new DefaultKeyset([10]), "NEXT");

        expect(filter).toEqual({ $or: [{ createdAt: { $lt: 10 } }] });
    });

    it("builds a $gt filter for a single descending field seeking PREVIOUS", () => {
        const sort = Sort.by(Direction.DESC, "createdAt");
        const filter = buildKeysetFilter(sort, new DefaultKeyset([10]), "PREVIOUS");

        expect(filter).toEqual({ $or: [{ createdAt: { $gt: 10 } }] });
    });

    it("expands a compound (ASC, DESC) sort into the standard seek $or for NEXT", () => {
        const sort = Sort.by(Direction.ASC, "name").and(Sort.by(Direction.DESC, "age"));
        const filter = buildKeysetFilter(sort, new DefaultKeyset(["Alice", 30]), "NEXT");

        expect(filter).toEqual({
            $or: [
                { name: { $gt: "Alice" } },
                { name: "Alice", age: { $lt: 30 } },
            ],
        });
    });

    it("expands a compound (ASC, DESC) sort into the standard seek $or for PREVIOUS", () => {
        const sort = Sort.by(Direction.ASC, "name").and(Sort.by(Direction.DESC, "age"));
        const filter = buildKeysetFilter(sort, new DefaultKeyset(["Alice", 30]), "PREVIOUS");

        expect(filter).toEqual({
            $or: [
                { name: { $lt: "Alice" } },
                { name: "Alice", age: { $gt: 30 } },
            ],
        });
    });

    it("throws when the sort is unsorted", () => {
        expect(() => buildKeysetFilter(Sort.unsorted(), new DefaultKeyset([1]), "NEXT")).toThrow();
    });

    it("throws when the tuple length does not match the sort field count", () => {
        const sort = Sort.by(Direction.ASC, "name").and(Sort.by(Direction.ASC, "age"));
        expect(() => buildKeysetFilter(sort, new DefaultKeyset(["Alice"]), "NEXT")).toThrow();
    });
});

describe("reverseSort", () => {
    it("flips the direction of every order", () => {
        const sort = Sort.by(Direction.ASC, "name").and(Sort.by(Direction.DESC, "age"));
        const reversed = reverseSort(sort);

        expect(reversed.get().map((o) => [o.getProperty(), o.getDirection()])).toEqual([
            ["name", Direction.DESC],
            ["age", Direction.ASC],
        ]);
    });
});
