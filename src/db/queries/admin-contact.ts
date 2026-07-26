import { sql } from "drizzle-orm";

import { getDatabase } from "@/db/client";
import { contactMessages } from "@/db/schema";
import { requireAdmin } from "@/features/admin/auth/authorize";
import type { ContactMessageDto, ContactPage } from "@/features/admin/analytics/model";
import { decodeContactCursor, encodeContactCursor } from "@/features/admin/analytics/ranges";

export const ADMIN_CONTACT_QUERY_SHAPE = {
  pageSize: 20,
  fetchLimit: 21,
  orderBy: "created_at desc, id desc",
  pagination: "(created_at, id) keyset",
} as const;

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type QueryResult = unknown[] | { rows?: unknown[] };
type Row = Record<string, unknown>;

function rowsOf(result: QueryResult): Row[] {
  return (Array.isArray(result) ? result : (result.rows ?? [])) as Row[];
}

function safeCount(value: unknown): number {
  const count = typeof value === "bigint" ? Number(value) : Number(value ?? 0);
  if (!Number.isSafeInteger(count) || count < 0)
    throw new Error("Admin query returned an unsafe count.");
  return count;
}

function readDate(value: unknown): Date {
  const date = value instanceof Date ? value : new Date(String(value));
  if (!Number.isFinite(date.getTime()))
    throw new Error("Admin query returned an invalid contact date.");
  return date;
}

function mapContact(row: Row): ContactMessageDto {
  return {
    id: String(row.id),
    inquiryType: row.inquiryType ?? row.inquiry_type,
    name: String(row.name),
    email: String(row.email),
    message: String(row.message),
    isRead: Boolean(row.isRead ?? row.is_read),
    createdAt: readDate(row.createdAt ?? row.created_at).toISOString(),
  } as ContactMessageDto;
}

export async function readContactPage(
  input: {
    cursor?: string | string[];
    now?: Date;
  } = {},
): Promise<ContactPage> {
  await requireAdmin();

  const now = input.now ?? new Date();
  const cursor = decodeContactCursor(input.cursor, now);
  const db = getDatabase();
  const pageRowsPromise = db.execute(
    cursor
      ? sql`select ${contactMessages.id}, ${contactMessages.inquiryType}, ${contactMessages.name},
              ${contactMessages.email}, ${contactMessages.message}, ${contactMessages.isRead},
              ${contactMessages.createdAt}
            from ${contactMessages}
            where (${contactMessages.createdAt}, ${contactMessages.id}) < (${cursor.createdAt}, ${cursor.id})
            order by ${contactMessages.createdAt} desc, ${contactMessages.id} desc
            limit ${ADMIN_CONTACT_QUERY_SHAPE.fetchLimit}`
      : sql`select ${contactMessages.id}, ${contactMessages.inquiryType}, ${contactMessages.name},
              ${contactMessages.email}, ${contactMessages.message}, ${contactMessages.isRead},
              ${contactMessages.createdAt}
            from ${contactMessages}
            order by ${contactMessages.createdAt} desc, ${contactMessages.id} desc
            limit ${ADMIN_CONTACT_QUERY_SHAPE.fetchLimit}`,
  );
  const unreadRowsPromise = db.execute(
    sql`select count(*)::bigint as unread_count from ${contactMessages} where ${contactMessages.isRead} = false`,
  );

  const [pageRowsResult, unreadRowsResult] = await Promise.all([
    pageRowsPromise,
    unreadRowsPromise,
  ]);
  const allRows = rowsOf(pageRowsResult as QueryResult);
  const rows = allRows.slice(0, ADMIN_CONTACT_QUERY_SHAPE.pageSize).map(mapContact);
  const extra = allRows[ADMIN_CONTACT_QUERY_SHAPE.pageSize];

  return {
    rows,
    unreadCount: safeCount(
      rowsOf(unreadRowsResult as QueryResult)[0]?.unreadCount ??
        rowsOf(unreadRowsResult as QueryResult)[0]?.unread_count,
    ),
    ...(extra
      ? {
          nextCursor: encodeContactCursor({
            createdAt: readDate(extra.createdAt ?? extra.created_at).toISOString(),
            id: String(extra.id),
          }),
        }
      : {}),
  };
}

export function isValidContactMessageId(id: string): boolean {
  return UUID_PATTERN.test(id);
}

export async function setContactMessageRead(input: {
  id: string;
  isRead: boolean;
}): Promise<boolean> {
  if (!isValidContactMessageId(input.id)) return false;

  await requireAdmin();
  const rows = rowsOf(
    (await getDatabase().execute(
      sql`update ${contactMessages}
          set ${contactMessages.isRead} = ${input.isRead}
          where ${contactMessages.id} = ${input.id}
          returning ${contactMessages.id}`,
    )) as QueryResult,
  );

  return rows.length > 0;
}

export async function deleteContactMessage(id: string): Promise<boolean> {
  if (!isValidContactMessageId(id)) return false;

  await requireAdmin();
  const rows = rowsOf(
    (await getDatabase().execute(
      sql`delete from ${contactMessages}
          where ${contactMessages.id} = ${id}
          returning ${contactMessages.id}`,
    )) as QueryResult,
  );

  return rows.length > 0;
}
