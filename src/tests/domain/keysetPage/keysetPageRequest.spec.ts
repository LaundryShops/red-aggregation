import { Direction } from "../../../domain/order";
import { Sort } from "../../../domain/sort";
import { DefaultKeySetPage } from "../../../domain/keysetPage/defaultKeySetPage";
import { DefaultKeyset } from "../../../domain/keysetPage/defaultKeySet";
import { encodeKeysetCursor } from "../../../domain/keysetPage/keysetCursor";
import { KeysetPageRequest } from "../../../domain/keysetPage/keysetPageRequest";

describe("KeysetPageRequest", () => {
    const sort = Sort.by(Direction.ASC, "name");

    it("of() seeds the first page with no anchor", () => {
        const request = KeysetPageRequest.of(10, sort);

        expect(request.getPageNumber()).toBe(0);
        expect(request.getPageSize()).toBe(10);
        expect(request.getKeysetPage()).toBeNull();
        expect(request.getDirection()).toBe("NEXT");
        expect(request.getSort()).toBe(sort);
    });

    it("next() advances the page number and anchors on the given result keyset page", () => {
        const first = KeysetPageRequest.of(5, sort);
        const resultKeysetPage = new DefaultKeySetPage(0, 5, new DefaultKeyset(["a"]), new DefaultKeyset(["e"]));

        const nextRequest = KeysetPageRequest.next(first, resultKeysetPage);

        expect(nextRequest.getPageNumber()).toBe(1);
        expect(nextRequest.getDirection()).toBe("NEXT");
        expect(nextRequest.getKeysetPage()).toBe(resultKeysetPage);
    });

    it("previous() decrements the page number and anchors on the given result keyset page", () => {
        const second = KeysetPageRequest.next(KeysetPageRequest.of(5, sort), new DefaultKeySetPage(0, 5, new DefaultKeyset(["a"]), new DefaultKeyset(["e"])));
        const resultKeysetPage = new DefaultKeySetPage(5, 5, new DefaultKeyset(["f"]), new DefaultKeyset(["j"]));

        const previousRequest = KeysetPageRequest.previous(second, resultKeysetPage);

        expect(previousRequest.getPageNumber()).toBe(0);
        expect(previousRequest.getDirection()).toBe("PREVIOUS");
        expect(previousRequest.getKeysetPage()).toBe(resultKeysetPage);
    });

    it("previous() floors the page number at 0", () => {
        const first = KeysetPageRequest.of(5, sort);
        const previousRequest = KeysetPageRequest.previous(first, new DefaultKeySetPage(0, 5, new DefaultKeyset(["a"]), new DefaultKeyset(["e"])));

        expect(previousRequest.getPageNumber()).toBe(0);
    });

    it("afterCursor() decodes the cursor into a single-point NEXT anchor", () => {
        const cursor = encodeKeysetCursor(new DefaultKeyset(["m"]));
        const request = KeysetPageRequest.afterCursor(5, sort, cursor);

        expect(request.getDirection()).toBe("NEXT");
        expect(request.getKeysetPage()?.getLowest().getTuple()).toEqual(["m"]);
        expect(request.getKeysetPage()?.getHighest().getTuple()).toEqual(["m"]);
    });

    it("beforeCursor() decodes the cursor into a single-point PREVIOUS anchor", () => {
        const cursor = encodeKeysetCursor(new DefaultKeyset(["m"]));
        const request = KeysetPageRequest.beforeCursor(5, sort, cursor, 2);

        expect(request.getDirection()).toBe("PREVIOUS");
        expect(request.getPageNumber()).toBe(2);
        expect(request.getKeysetPage()?.getLowest().getTuple()).toEqual(["m"]);
    });

    it("withPage()/first()/previousOrFirst() keep sort/anchor/direction while adjusting the page number", () => {
        const anchor = new DefaultKeySetPage(0, 5, new DefaultKeyset(["a"]), new DefaultKeyset(["e"]));
        const request = KeysetPageRequest.next(KeysetPageRequest.of(5, sort), anchor);

        expect((request.withPage(3) as KeysetPageRequest).getPageNumber()).toBe(3);
        expect((request.first() as KeysetPageRequest).getPageNumber()).toBe(0);
        expect((request.previousOrFirst() as KeysetPageRequest).getPageNumber()).toBe(0);
        expect((request.withPage(3) as KeysetPageRequest).getKeysetPage()).toBe(anchor);
    });
});
