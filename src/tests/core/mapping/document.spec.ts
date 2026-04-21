import "reflect-metadata";
import {
    defaultCollectionName,
    Document,
    getDocumentMetadata,
} from "../../../core/mapping/document";

describe("@Document mapping", () => {
    it("derives collection from class name when value and collection are omitted", () => {
        @Document()
        class EmptyDoc {}

        expect(getDocumentMetadata(EmptyDoc)).toEqual({
            collection: "empty_doc",
            language: "",
            collation: "",
        });
    });

    it("maps camelCase class name to snake_case default collection", () => {
        @Document()
        class UserProfile {}

        expect(getDocumentMetadata(UserProfile).collection).toBe("user_profile");
    });

    it("uses value as collection name", () => {
        @Document({ value: "users" })
        class UserEntity {}

        expect(getDocumentMetadata(UserEntity).collection).toBe("users");
    });

    it("uses collection when set", () => {
        @Document({ collection: "orders" })
        class OrderEntity {}

        expect(getDocumentMetadata(OrderEntity).collection).toBe("orders");
    });

    it("prefers collection when both value and collection match as aliases", () => {
        @Document({ value: "items", collection: "items" })
        class ItemEntity {}

        expect(getDocumentMetadata(ItemEntity).collection).toBe("items");
    });

    it("throws when value and collection disagree", () => {
        expect(() => {
            @Document({ value: "a", collection: "b" })
            class ConflictingDoc {}
            void ConflictingDoc;
        }).toThrow(
            '@Document: "value" and "collection" are aliases; they must match or only one should be set.',
        );
    });

    it("persists language and collation", () => {
        @Document({
            collection: "articles",
            language: "en",
            collation: "locale: en_US",
        })
        class Article {}

        expect(getDocumentMetadata(Article)).toEqual({
            collection: "articles",
            language: "en",
            collation: "locale: en_US",
        });
    });

    it("returns undefined metadata for an undecorated class", () => {
        class Plain {}

        expect(getDocumentMetadata(Plain)).toBeUndefined();
    });
});

describe("defaultCollectionName", () => {
    it("inserts underscores between lowercase-then-uppercase boundaries and lowercases", () => {
        expect(defaultCollectionName("UserProfile")).toBe("user_profile");
        expect(defaultCollectionName("OrderLineItem")).toBe("order_line_item");
        /** Acronym-heavy names have no lower→upper boundary; whole string lowercases. */
        expect(defaultCollectionName("HTTPResponse")).toBe("httpresponse");
    });

    it("returns lowercase for a single word", () => {
        expect(defaultCollectionName("invoice")).toBe("invoice");
    });
});
