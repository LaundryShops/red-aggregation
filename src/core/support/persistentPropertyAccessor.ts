export interface PersistentPropertyAccessor<T> {
    /**
     * Lấy giá trị property theo tên.
     */
    getProperty<P = unknown>(property: string): P | null;

    /**
     * Tương thích với mapping layer: cho phép truyền {@link MongoPersistentProperty}.
     */
    getProperty<P = unknown>(property: import("./mongoPersistentRepository").MongoPersistentProperty<P>): P | null;
}
