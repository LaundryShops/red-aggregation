import { KeysetArrayList } from "../../domain/keysetPage/keysetPageImpl";
import { DefaultKeySetPage } from "../../domain/keysetPage/defaultKeySetPage";
import { DefaultKeyset } from "../../domain/keysetPage/defaultKeySet";

describe("KeysetArrayList", () => {
    it("should expose keyset metadata for pagination navigation", () => {
        const keysetPage = new DefaultKeySetPage(
            10,
            5,
            new DefaultKeyset(["lowest", 10]),
            new DefaultKeyset(["highest", 14])
        );

        const list = new KeysetArrayList(["p1", "p2", "p3", "p4", "p5"], keysetPage, 50, 10, 5);

        expect(list.getSize()).toBe(5);
        expect(list.getTotalSize()).toBe(50);
        expect(list.getPage()).toBe(3);
        expect(list.getTotalPages()).toBe(10);
        expect(list.getKeysetPage().getLowest().getTuple()).toEqual(["lowest", 10]);
        expect(list.getKeysetPage().getHighest().getTuple()).toEqual(["highest", 14]);
    });

    it("should keep firstResult/maxResults in keyset-driven scenario", () => {
        const keysetPage = new DefaultKeySetPage(
            20,
            4,
            new DefaultKeyset(["low", 20]),
            new DefaultKeyset(["high", 23]),
            [
                new DefaultKeyset(["low", 20]),
                new DefaultKeyset(["mid", 21]),
                new DefaultKeyset(["high", 23])
            ]
        );

        const list = new KeysetArrayList(["a", "b", "c", "d"], keysetPage, 100, 20, 4);

        expect(list.getFirstResult()).toBe(20);
        expect(list.getMaxResults()).toBe(4);
        expect(list.getKeysetPage().getKeysets().map((k) => k.getTuple())).toEqual([
            ["low", 20],
            ["mid", 21],
            ["high", 23]
        ]);
    });
});

