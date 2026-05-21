import "reflect-metadata";
import { ObjectId } from "mongodb";
import { MappingContext } from "../../../core/mapping/mappingContext";
import { Document } from "../../../core/mapping/document";
import { Id } from "../../../core/mapping/id";

describe("MappingContext", () => {
    describe("getPersistentEntity — collection resolution", () => {
        it("uses @Document.collection when provided", () => {
            @Document({ collection: "users" })
            class User {}

            const ctx = new MappingContext();
            const pe = ctx.getPersistentEntity(User);
            expect(pe.getCollection()).toBe("users");
        });

        it("falls back to defaultCollectionName when @Document is missing", () => {
            class UserProfile {}

            const ctx = new MappingContext();
            const pe = ctx.getPersistentEntity(UserProfile);
            expect(pe.getCollection()).toBe("user_profile");
        });

        it("caches per type", () => {
            class Same {}

            const ctx = new MappingContext();
            const a = ctx.getPersistentEntity(Same);
            const b = ctx.getPersistentEntity(Same);
            expect(a).toBe(b);
        });

        it("clears cache", () => {
            class Same {}

            const ctx = new MappingContext();
            const a = ctx.getPersistentEntity(Same);
            ctx.clear();
            const b = ctx.getPersistentEntity(Same);
            expect(a).not.toBe(b);
        });
    });

    describe("getPersistentEntity — @Id wiring", () => {
        it("wires @Id property into persistent entity", () => {
            @Document({ collection: "users" })
            class User {
                @Id() _id!: ObjectId;
            }

            const ctx = new MappingContext();
            const pe = ctx.getPersistentEntity(User);

            expect(pe.hasIdProperty()).toBe(true);
            expect(pe.getRequiredIdProperty().getName()).toBe("_id");
            expect(pe.getRequiredIdProperty().getType()).toBe(ObjectId);
        });

        it("respects custom id property name", () => {
            @Document({ collection: "accounts" })
            class Account {
                @Id() accountId!: string;
            }

            const ctx = new MappingContext();
            const pe = ctx.getPersistentEntity(Account);

            expect(pe.getRequiredIdProperty().getName()).toBe("accountId");
            expect(pe.getRequiredIdProperty().getType()).toBe(String);
        });

        it("leaves hasIdProperty false when @Id missing", () => {
            class Plain {}

            const ctx = new MappingContext();
            const pe = ctx.getPersistentEntity(Plain);

            expect(pe.hasIdProperty()).toBe(false);
            expect(() => pe.getRequiredIdProperty()).toThrow(/Required identifier property not found/);
        });

        it("identifier accessor reads custom id property", () => {
            @Document({ collection: "accounts" })
            class Account {
                @Id() accountId!: string;
                constructor(accountId?: string) {
                    if (accountId != null) this.accountId = accountId;
                }
            }

            const ctx = new MappingContext();
            const pe = ctx.getPersistentEntity(Account);
            const acc = new Account("acc-123");

            expect(pe.getIdentifierAccessor(acc).getIdentifier()).toBe("acc-123");
            expect(pe.isNew(new Account())).toBe(true);
            expect(pe.isNew(acc)).toBe(false);
        });
    });
});
