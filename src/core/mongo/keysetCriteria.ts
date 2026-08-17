import type { Document, Filter } from "mongodb";
import { Direction, Order } from "../../domain/order";
import { Sort } from "../../domain/sort";
import { KeysetDirection } from "../../domain/keysetPage/keysetPageable";
import { Keyset } from "../../domain/keysetPage/types";

function oppositeDirection(direction: Direction): Direction {
    return direction === Direction.ASC ? Direction.DESC : Direction.ASC;
}

/**
 * Flips every order's direction — used to seek backward (`PREVIOUS`) in natural sort order.
 * The caller must reverse the fetched rows back before returning them.
 */
export function reverseSort(sort: Sort): Sort {
    return Sort.by(...sort.get().map((order) => order.with(oppositeDirection(order.getDirection()))));
}

function strictOperator(order: Order, direction: KeysetDirection): '$gt' | '$lt' {
    const seeksForward = direction === 'NEXT' ? order.isAscending() : !order.isAscending();
    return seeksForward ? '$gt' : '$lt';
}

/**
 * Builds the Mongo "seek" filter for keyset pagination: since Mongo has no row-value comparison,
 * this expands the tuple comparison `(a, b, ...) > (x, y, ...)` into the standard `$or` of
 * equality-prefix + strict-comparison clauses.
 */
export function buildKeysetFilter(sort: Sort, keyset: Keyset, direction: KeysetDirection): Filter<Document> {
    const orders = sort.get();
    const tuple = keyset.getTuple();

    if (!sort.isSorted()) {
        throw new Error("Cannot build a keyset filter from an unsorted Sort");
    }
    if (orders.length !== tuple.length) {
        throw new Error(`Keyset tuple length (${tuple.length}) does not match sort field count (${orders.length})`);
    }

    const clauses: Filter<Document>[] = orders.map((order, i) => {
        const clause: Filter<Document> = {};
        for (let j = 0; j < i; j++) {
            clause[orders[j].getProperty()] = tuple[j];
        }
        clause[order.getProperty()] = { [strictOperator(order, direction)]: tuple[i] };
        return clause;
    });

    return { $or: clauses };
}
