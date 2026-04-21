export const DOCUMENT_METADATA = Symbol.for('mongodb.document');

declare global {
  // `reflect-metadata` augments the Reflect namespace at runtime, but TS doesn't know by default.
  // This keeps the library buildable even if consumers don't install reflect-metadata types.
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Reflect {
    function defineMetadata(metadataKey: unknown, metadataValue: unknown, target: object): void;
    function getMetadata(metadataKey: unknown, target: object): unknown;
  }
}

export interface DocumentMetadata {
  /** Tên collection (hoặc biểu thức SpEL nếu bạn tự parse). */
  collection: string;
  /** Ngôn ngữ mặc định cho document (ví dụ text search). */
  language: string;
  /** Chuỗi collation (hoặc alias sang @Collation trong hệ Spring). */
  collation: string;
}

export type DocumentOptions = Partial<
  Pick<DocumentMetadata, 'language' | 'collation'> & {
    /** @AliasFor collection */
    value: string;
    collection: string;
  }
>;

function resolveCollection(options: DocumentOptions): string {
  const { value = '', collection = '' } = options;
  if (value && collection && value !== collection) {
    throw new Error('@Document: "value" and "collection" are aliases; they must match or only one should be set.');
  }
  return collection || value;
}

/**
 * Class decorator — chỉ áp dụng cho `class`.
 *
 * Nếu `collection` / `value` rỗng, tên collection mặc định lấy từ tên class qua {@link defaultCollectionName}
 * (camelCase → chèn `_` ở ranh giới chữ thường + chữ hoa, rồi lowercase).
 */
export function Document(options: DocumentOptions = {}): ClassDecorator {
  return (target: object) => {
    const ctor = target as { name: string };
    const explicit = resolveCollection(options);
    const collection = explicit || defaultCollectionName(ctor.name);
    const meta: DocumentMetadata = {
      collection,
      language: options.language ?? '',
      collation: options.collation ?? '',
    };
    Reflect.defineMetadata(DOCUMENT_METADATA, meta, ctor);
  };
}

export function getDocumentMetadata(
  ctor: abstract new (...args: never[]) => unknown,
): DocumentMetadata {
  if (typeof Reflect !== 'undefined' && Reflect.getMetadata) {
    return Reflect.getMetadata(DOCUMENT_METADATA, ctor) as DocumentMetadata;
  }
  return (ctor as unknown as Record<symbol, DocumentMetadata>)[DOCUMENT_METADATA];
}

/** Ví dụ derive collection từ tên class (camelCase → snake_case tùy ý). */
export function defaultCollectionName(className: string): string {
  return className.replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase();
}