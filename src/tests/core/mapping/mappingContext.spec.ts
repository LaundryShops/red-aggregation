import "reflect-metadata";
import { ObjectId } from "mongodb";
import { MappingContext } from "../../../core/mapping/mappingContext";
import { Document } from "../../../core/mapping/document";
import { Id } from "../../../core/mapping/id";
import { String as StringField } from "../../../core/mapping/types/string";
import { ObjectId as ObjectIdField } from "../../../core/mapping/types/objectId";
import { Array as ArrayField } from "../../../core/mapping/types/array";
import { PlainObject as ObjectField } from "../../../core/mapping/types/object";
import { CustomField } from "../../../core/mapping/types/customField";
import { Email } from "../../../core/mapping/types/email";

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

    describe("getPersistentEntity — stripUnknownFields + typed fields wiring", () => {
        it("defaults shouldStripUnknownFields to false when @Document omits the option", () => {
            @Document({ collection: "users" })
            class User {
                @Id() _id!: ObjectId;
                @StringField() email!: string;
            }

            const ctx = new MappingContext();
            const pe = ctx.getPersistentEntity(User);

            expect(pe.shouldStripUnknownFields()).toBe(false);
        });

        it("wires stripUnknownFields: true from @Document", () => {
            @Document({ collection: "users", stripUnknownFields: true })
            class User {
                @Id() _id!: ObjectId;
                @StringField() email!: string;
            }

            const ctx = new MappingContext();
            const pe = ctx.getPersistentEntity(User);

            expect(pe.shouldStripUnknownFields()).toBe(true);
        });

        it("getKnownFieldNames combines @Id and typed-field decorators", () => {
            @Document({ collection: "users" })
            class User {
                @Id() _id!: ObjectId;
                @StringField() email!: string;
                @StringField() name!: string;
            }

            const ctx = new MappingContext();
            const pe = ctx.getPersistentEntity(User);

            expect(pe.getKnownFieldNames().sort()).toEqual(["_id", "email", "name"]);
        });

        it("end-to-end: stripUnknownFields removes an undeclared field, keeps declared + id", () => {
            @Document({ collection: "users", stripUnknownFields: true })
            class User {
                @Id() _id!: ObjectId;
                @StringField() email!: string;
            }

            const ctx = new MappingContext();
            const pe = ctx.getPersistentEntity(User);

            const raw = { _id: "1", email: "a@test.com", extra: "sneaky" };
            expect(pe.stripUnknownFields(raw)).toEqual({ _id: "1", email: "a@test.com" });
        });
    });

    describe("getPersistentEntity — v2 typed fields (@ObjectId/@Array/@Object)", () => {
        it("getKnownFieldNames includes @ObjectId/@Array/@Object fields alongside @Id", () => {
            @Document({ collection: "posts" })
            class Post {
                @Id() _id!: ObjectId;
                @ObjectIdField() authorId!: ObjectId;
                @ArrayField() tags!: string[];
                @ObjectField() meta!: Record<string, unknown>;
            }

            const ctx = new MappingContext();
            const pe = ctx.getPersistentEntity(Post);

            expect(pe.getKnownFieldNames().sort()).toEqual(["_id", "authorId", "meta", "tags"]);
        });

        it("end-to-end: stripUnknownFields keeps @ObjectId/@Array/@Object fields, removes an undeclared one", () => {
            @Document({ collection: "posts", stripUnknownFields: true })
            class Post {
                @Id() _id!: ObjectId;
                @ObjectIdField() authorId!: ObjectId;
                @ArrayField() tags!: string[];
                @ObjectField() meta!: Record<string, unknown>;
            }

            const ctx = new MappingContext();
            const pe = ctx.getPersistentEntity(Post);

            const authorId = new ObjectId();
            const raw = { _id: "1", authorId, tags: ["a"], meta: { flag: true }, extra: "sneaky" };
            expect(pe.stripUnknownFields(raw)).toEqual({
                _id: "1",
                authorId,
                tags: ["a"],
                meta: { flag: true },
            });
        });
    });

    describe("getPersistentEntity — @CustomField/@Email typed fields", () => {
        it("getKnownFieldNames includes @CustomField/@Email fields alongside @Id", () => {
            @Document({ collection: "users" })
            class User {
                @Id() _id!: ObjectId;
                @Email() email!: string;
                @CustomField<number>({ kind: "positive-number", validate: () => null }) score!: number;
            }

            const ctx = new MappingContext();
            const pe = ctx.getPersistentEntity(User);

            expect(pe.getKnownFieldNames().sort()).toEqual(["_id", "email", "score"]);
        });

        it("end-to-end: stripUnknownFields keeps @CustomField/@Email fields, removes an undeclared one", () => {
            @Document({ collection: "users", stripUnknownFields: true })
            class User {
                @Id() _id!: ObjectId;
                @Email() email!: string;
                @CustomField<number>({ kind: "positive-number", validate: () => null }) score!: number;
            }

            const ctx = new MappingContext();
            const pe = ctx.getPersistentEntity(User);

            const raw = { _id: "1", email: "a@test.com", score: 5, extra: "sneaky" };
            expect(pe.stripUnknownFields(raw)).toEqual({ _id: "1", email: "a@test.com", score: 5 });
        });
    });
});
