import { Buffer } from "node:buffer";
import { DefaultKeyset } from "./defaultKeySet";
import { Keyset, Serializable } from "./types";

export function encodeKeysetCursor(keyset: Keyset): string {
    return Buffer.from(JSON.stringify(keyset.getTuple())).toString('base64');
}

export function decodeKeysetCursor(cursor: string): DefaultKeyset {
    let parsed: unknown;
    try {
        parsed = JSON.parse(Buffer.from(cursor, 'base64').toString('utf-8'));
    } catch {
        throw new Error(`Invalid keyset cursor: '${cursor}' is not valid base64/JSON`);
    }

    if (!Array.isArray(parsed)) {
        throw new Error(`Invalid keyset cursor: decoded value must be an array, got ${typeof parsed}`);
    }

    return new DefaultKeyset(parsed as Serializable);
}
