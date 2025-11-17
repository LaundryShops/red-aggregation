import { Direction, Order } from "./order";

export class Sort {
    static readonly DEFAULT_DIRECTION = Direction.ASC;
    private static readonly EMPTY_ARRAY: Order[] = [];

    private constructor(private readonly orders: Order[]) { }

    /**
      * Creates a new Sort using the given Order instances.
      */
    static by(...orders: Order[]): Sort;
    /**
     * Creates a new Sort for the given property with default ascending direction.
     */
    static by(property: string): Sort;
    /**
     * Creates a new Sort for the given properties with specified direction.
     */
    static by(direction: Direction, ...properties: string[]): Sort;
    static by(firstArg: string | Direction | Order, ...remainder: Array<string | Order>): Sort {
        // Case 1: Sort.by(Order[])
        if (firstArg instanceof Order) {
            return new Sort([firstArg, ...(remainder as Order[])]);
        }

        // Case 3: Sort.by(Direction, ...string[])
        if (Object.values(Direction).includes(firstArg as Direction)) {
            if (remainder.length === 0) {
                throw new Error("Properties must not be null or empty!");
            }
            const properties = remainder as string[];
            return new Sort(properties.map(prop => {
                return new Order(firstArg as Direction, prop)
            }));
        }

        // Case 2: Sort.by(string) - single property
        if (typeof firstArg === 'string') {
            return new Sort([new Order(Direction.ASC, firstArg)]);
        }

        throw new Error("Invalid arguments for Sort.by()");
    }

    static unsorted(): Sort {
        return new Sort(Sort.EMPTY_ARRAY);
    }

    static empty(): Sort {
        return Sort.unsorted();
    }

    static fromOrder(...orders: Order[]): Sort {
        return orders.length === 0 ? Sort.unsorted() : new Sort(orders);
    }

    and(sort: Sort): Sort {
        if (!sort) {
            return this;
        }
        return new Sort([...this.orders, ...sort.orders]);
    }

    andSort(sort: Sort): Sort {
        return this.and(sort);
    }

    ascending(): Sort {
        return this.withDirection(Direction.ASC);
    }

    descending(): Sort {
        return this.withDirection(Direction.DESC);
    }

    isSorted(): boolean {
        return this.orders.length > 0;
    }

    isEmpty(): boolean {
        return !this.isSorted();
    }

    getOrderFor(property: string): Order | undefined {
        return this.orders.find(order => order.getProperty() === property);
    }

    get(): Order[] {
        const orders = this.orders
        return ([] as Order[]).concat(orders);
    }

    withDirection(direction: Direction): Sort {
        const newOrders = this.orders.map(order => order.with(direction));
        return Sort.fromOrder(...newOrders);
    }

    forEach(callback: (order: Order) => void): void {
        this.orders.forEach(callback);
    }

    map<T>(callback: (order: Order) => T): T[] {
        return this.orders.map(callback);
    }

    filter(predicate: (order: Order) => boolean): Sort {
        const filteredOrders = this.orders.filter(predicate);
        return Sort.fromOrder(...filteredOrders);
    }

    thenBy(property: string): Sort {
        return this.and(Sort.by(property));
    }

    thenByDescending(property: string): Sort {
        return this.and(Sort.by(Direction.DESC, property));
    }

    static parse(value: string): Sort {
        if (!value) {
            return Sort.unsorted();
        }

        const orders = value.split(',')
            .map(part => part.trim())
            .filter(part => part.length > 0)
            .map(part => {
                const elements = part.split(' ');
                const property = elements[0];
                const direction = elements.length > 1 && elements[1].toUpperCase() === 'DESC'
                    ? Direction.DESC
                    : Direction.ASC;
                return new Order(direction, property);
            });

        return Sort.fromOrder(...orders);
    }

    toString(): string {
        if (this.isEmpty()) {
            return '';
        }

        return this.orders
            .map(order => {
                const direction = order.getDirection() === Direction.ASC ? 'ASC' : 'DESC';
                return `${order.getProperty()}: ${direction}`;
            })
            .join(', ');
    }

    [Symbol.iterator]() {
        return this.orders[Symbol.iterator]();
    }
}