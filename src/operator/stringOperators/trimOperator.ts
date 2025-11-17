import { Fields } from "../../aggregate/field";
import { AggregationExpression } from "../../aggregationExpression";
import { Assert } from "../../utils";
import { AbstractOperatorExpression } from "../abstractOperatorExpression";
import { LTrim } from "./ltrimOperator";
import { RTrim } from "./rtrimOperator";

export class Trim extends AbstractOperatorExpression {
    static valueOf(fieldReference: string): Trim
    static valueOf(expression: AggregationExpression): Trim
    static valueOf(expression: Record<string, any>): Trim
    static valueOf(value: unknown) {
        Assert.notNull(value, 'Value must not be null');
        if (typeof value === 'string') {
            return new Trim(new Map().set('input', Fields.field(value)));
        }
        return new Trim(new Map().set('input', value));
    }

    constructor(value: any) {
        super(value);
    }

    charsOf(fieldReference: string): Trim
    charsOf(expression: AggregationExpression): Trim
    charsOf(expression: Record<string, any>): Trim
    charsOf(value: unknown) {
        Assert.notNull(value, 'Value must not be null');
        if (typeof value === 'string') {
            return new Trim(this.append('chars', Fields.field(value)));
        }
        return new Trim(this.append('chars', value));
    }

    chars(chars: string) {
        Assert.notNull(chars, "Chars must not be null");
        return new Trim(this.append("chars", chars));
    }

    left(): LTrim {
        return new LTrim(this.argumentMap());
    }

    right(): RTrim {
        return new RTrim(this.argumentMap());
    }

    protected getMongoMethod(): string {
        return '$trim';
    }

}
