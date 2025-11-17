export enum Direction {
    ASC = 'ASC',
    DESC = 'DESC'
}

export enum NullHandling {
    NATIVE = 'NATIVE',
    NULLS_FIRST = 'NULLS_FIRST',
    NULLS_LAST = 'NULLS_LAST'
}

export class Order {
    constructor(
        private readonly direction: Direction,
        private readonly property: string,
        private readonly _ignoreCase: boolean = false,
        private readonly nullHandling: NullHandling = NullHandling.NATIVE
    ) { }

    static by(property: string): Order {
        return new Order(Direction.ASC, property);
    }

    static asc(property: string): Order {
        return new Order(Direction.ASC, property);
    }

    static desc(property: string): Order {
        return new Order(Direction.DESC, property);
    }

    isAscending(): boolean {
        return this.direction === Direction.ASC;
    }

    isDescending(): boolean {
        return this.direction === Direction.DESC;
    }

    getProperty(): string {
        return this.property;
    }

    getDirection(): Direction {
        return this.direction;
    }

    getNullHandling(): NullHandling {
        return this.nullHandling;
    }

    isIgnoreCase(): boolean {
        return this._ignoreCase;
    }

    with(direction: Direction): Order {
        return new Order(direction, this.property, this._ignoreCase, this.nullHandling);
    }

    withProperty(property: string): Order {
        return new Order(this.direction, property, this._ignoreCase, this.nullHandling);
    }

    withIgnoreCase(): Order {
        return new Order(this.direction, this.property, true, this.nullHandling);
    }

    withNullHandling(nullHandling: NullHandling): Order {
        return new Order(this.direction, this.property, this._ignoreCase, nullHandling);
    }

    ignoreCase(): Order {
        return this.withIgnoreCase();
    }
}