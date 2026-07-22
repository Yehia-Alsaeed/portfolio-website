import { boolean, index, pgEnum, pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

export const INQUIRY_TYPES = [
  "Job opportunity",
  "Freelance project",
  "Collaboration",
  "Other",
] as const;
export type InquiryType = (typeof INQUIRY_TYPES)[number];

export const inquiryTypeEnum = pgEnum("inquiry_type", INQUIRY_TYPES);

export const contactMessages = pgTable(
  "contact_messages",
  {
    id: uuid().defaultRandom().primaryKey(),
    inquiryType: inquiryTypeEnum().notNull(),
    name: varchar({ length: 100 }).notNull(),
    email: varchar({ length: 254 }).notNull(),
    message: varchar({ length: 5000 }).notNull(),
    isRead: boolean().notNull().default(false),
    createdAt: timestamp({ withTimezone: true, mode: "date" }).notNull().defaultNow(),
  },
  (table) => [index("contact_messages_created_at_id_idx").on(table.createdAt, table.id)],
);
