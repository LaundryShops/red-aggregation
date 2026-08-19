import { DefaultKeyset } from "../../../domain/keysetPage/defaultKeySet";
import { decodeKeysetCursor, encodeKeysetCursor } from "../../../domain/keysetPage/keysetCursor";

describe("keysetCursor", () => {
    it("round-trips a single-field tuple", () => {
        const keyset = new DefaultKeyset([10]);
        const cursor = encodeKeysetCursor(keyset);

        expect(typeof cursor).toBe("string");
        expect(decodeKeysetCursor(cursor).getTuple()).toEqual([10]);
    });

    it("round-trips a compound tuple", () => {
        const keyset = new DefaultKeyset(["Alice", 42]);
        const cursor = encodeKeysetCursor(keyset);

        expect(decodeKeysetCursor(cursor).getTuple()).toEqual(["Alice", 42]);
    });

    it("throws on malformed base64/JSON", () => {
        expect(() => decodeKeysetCursor("not-base64-json!!!")).toThrow();
    });

    it("throws when the decoded value is not an array", () => {
        const cursor = Buffer.from(JSON.stringify({ not: "an array" })).toString("base64");
        expect(() => decodeKeysetCursor(cursor)).toThrow(/must be an array/);
    });
});
