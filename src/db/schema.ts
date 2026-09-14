import { integer, pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";

export const settingsTable = pgTable("settings", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  ownerId: varchar("owner_id", { length: 255 }).notNull().unique(),
  businessName: varchar("business_name", { length: 255 }),
  supportEmail: varchar("support_email", { length: 255 }),
  knowledge: text("knowledge"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Setting = typeof settingsTable.$inferSelect;
export type NewSetting = typeof settingsTable.$inferInsert;
