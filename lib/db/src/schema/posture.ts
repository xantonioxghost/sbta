import { relations } from "drizzle-orm";
import {
  boolean,
  integer,
  pgTable,
  real,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

/**
 * 1. User Health Profile
 * Stored locally and synchronizable to Supabase.
 */
export const profilesTable = pgTable("profiles", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull().default(""),
  age: text("age").default(""),
  height: text("height").default(""),
  weight: text("weight").default(""),
  postureGoal: text("posture_goal").default(""),
  painAreas: text("pain_areas").default(""),
  injuries: text("injuries").default(""),
  conditions: text("conditions").default(""),
  mobilityLimitations: text("mobility_limitations").default(""),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

/**
 * 2. User Preferences
 * Alert thresholds, delay, notification toggles, and haptics.
 */
export const userPreferencesTable = pgTable("user_preferences", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => profilesTable.id, { onDelete: "cascade" }),
  threshold: integer("threshold").notNull().default(15),
  delay: integer("delay").notNull().default(8),
  notifications: boolean("notifications").notNull().default(true),
  vibration: boolean("vibration").notNull().default(true),
  sound: boolean("sound").notNull().default(false),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

/**
 * 3. Posture Sessions
 * Recorded tracking sessions from the wearable device.
 */
export const postureSessionsTable = pgTable("posture_sessions", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => profilesTable.id, { onDelete: "cascade" }),
  startedAt: timestamp("started_at", { withTimezone: true }).defaultNow().notNull(),
  endedAt: timestamp("ended_at", { withTimezone: true }),
  durationSeconds: integer("duration_seconds").notNull().default(0),
  goodPosturePercentage: integer("good_posture_percentage").notNull().default(100),
  avgAngle: real("avg_angle").notNull().default(0),
  maxAngle: real("max_angle").notNull().default(0),
  alertCount: integer("alert_count").notNull().default(0),
  sessionType: text("session_type").notNull().default("general"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

/**
 * 4. Posture Readings / Samples
 * High-resolution periodic samples during a tracking session.
 */
export const postureReadingsTable = pgTable("posture_readings", {
  id: uuid("id").defaultRandom().primaryKey(),
  sessionId: uuid("session_id")
    .notNull()
    .references(() => postureSessionsTable.id, { onDelete: "cascade" }),
  timestamp: timestamp("timestamp", { withTimezone: true }).defaultNow().notNull(),
  angle: real("angle").notNull(),
  good: boolean("good").notNull(),
});

/**
 * 5. Wearable Devices
 * Connected ESP32 PostureBelt devices and baseline calibrations.
 */
export const devicesTable = pgTable("devices", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => profilesTable.id, { onDelete: "cascade" }),
  name: text("name").notNull().default("PostureBelt"),
  bleAddress: text("ble_address"),
  baselineAngle: real("baseline_angle").default(0),
  lastConnectedAt: timestamp("last_connected_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// Relations
export const profilesRelations = relations(profilesTable, ({ one, many }) => ({
  preferences: one(userPreferencesTable, {
    fields: [profilesTable.id],
    references: [userPreferencesTable.userId],
  }),
  sessions: many(postureSessionsTable),
  devices: many(devicesTable),
}));

export const postureSessionsRelations = relations(postureSessionsTable, ({ one, many }) => ({
  profile: one(profilesTable, {
    fields: [postureSessionsTable.userId],
    references: [profilesTable.id],
  }),
  readings: many(postureReadingsTable),
}));

export const postureReadingsRelations = relations(postureReadingsTable, ({ one }) => ({
  session: one(postureSessionsTable, {
    fields: [postureReadingsTable.sessionId],
    references: [postureSessionsTable.id],
  }),
}));

export const userPreferencesRelations = relations(userPreferencesTable, ({ one }) => ({
  profile: one(profilesTable, {
    fields: [userPreferencesTable.userId],
    references: [profilesTable.id],
  }),
}));

export const devicesRelations = relations(devicesTable, ({ one }) => ({
  profile: one(profilesTable, {
    fields: [devicesTable.userId],
    references: [profilesTable.id],
  }),
}));

// Schemas & Types
export const insertProfileSchema = createInsertSchema(profilesTable);
export const selectProfileSchema = createSelectSchema(profilesTable);
export type InsertProfile = z.infer<typeof insertProfileSchema>;
export type Profile = typeof profilesTable.$inferSelect;

export const insertUserPreferencesSchema = createInsertSchema(userPreferencesTable);
export const selectUserPreferencesSchema = createSelectSchema(userPreferencesTable);
export type InsertUserPreferences = z.infer<typeof insertUserPreferencesSchema>;
export type UserPreferences = typeof userPreferencesTable.$inferSelect;

export const insertPostureSessionSchema = createInsertSchema(postureSessionsTable);
export const selectPostureSessionSchema = createSelectSchema(postureSessionsTable);
export type InsertPostureSession = z.infer<typeof insertPostureSessionSchema>;
export type PostureSession = typeof postureSessionsTable.$inferSelect;

export const insertPostureReadingSchema = createInsertSchema(postureReadingsTable);
export const selectPostureReadingSchema = createSelectSchema(postureReadingsTable);
export type InsertPostureReading = z.infer<typeof insertPostureReadingSchema>;
export type PostureReading = typeof postureReadingsTable.$inferSelect;

export const insertDeviceSchema = createInsertSchema(devicesTable);
export const selectDeviceSchema = createSelectSchema(devicesTable);
export type InsertDevice = z.infer<typeof insertDeviceSchema>;
export type Device = typeof devicesTable.$inferSelect;
