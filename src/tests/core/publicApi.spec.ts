import "reflect-metadata";
import * as CoreApi from "../../core";

describe("public API surface — typed field decorators reachable from package root", () => {
    it.each([
        "String",
        "Number",
        "Boolean",
        "Date",
        "Enum",
        "Uuid",
        "ObjectId",
        "Array",
        "PlainObject",
    ])("exports %s as a decorator factory function", (name) => {
        expect(typeof (CoreApi as unknown as Record<string, unknown>)[name]).toBe("function");
    });
});
