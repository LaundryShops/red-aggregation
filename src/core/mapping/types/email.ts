import { CustomField } from "./customField";
import { DefaultOrFactory } from "./propertyType";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface EmailOptions {
    default?: DefaultOrFactory<string> | null;
}

/**
 * String field với validate hình dạng email cơ bản (`local@domain.tld`) — chỉ là
 * basic shape check, không phải RFC 5322 đầy đủ. Dựng trên `CustomField`.
 */
export function Email(options?: EmailOptions): PropertyDecorator {
    return CustomField<string>({
        kind: "email",
        default: options?.default,
        validate: (value) =>
            typeof value === "string" && EMAIL_PATTERN.test(value)
                ? null
                : `Expected a valid email, got ${typeof value === "string" ? value : typeof value}`,
    });
}
