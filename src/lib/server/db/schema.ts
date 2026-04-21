import { boolean, index, integer, json, pgEnum, pgTable, primaryKey, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";

export const gameRoomStatusEnum = pgEnum("game_room_status", ["waiting", "playing", "ended"]);
export const gameRoomModeEnum = pgEnum("game_room_mode", ["easy", "normal", "hard"]);
export const userRoleEnum = pgEnum("user_role", ["admin", "user"]);
export const playerTypeEnum = pgEnum("player_type", ["player", "guest"]);
export const algorithmEnum = pgEnum("algorithm", ["Bubble Sort", "Selection Sort", "Insertion Sort", "Merge Sort", "Quick Sort"]);

export const users = pgTable("users", {
	id: text("id").primaryKey(),
	name: text("name").notNull(),
	email: text("email").notNull(),
	emailVerified: boolean("email_verified").notNull().default(false),
	image: text("image"),
	rankScore: integer("rank_score").notNull().default(0),
	role: userRoleEnum("role").notNull().default("user"),
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at").notNull().defaultNow().$onUpdateFn(() => new Date())
})

export const verifications = pgTable("verification", {
	id: text("id").primaryKey(),
	identifier: text("identifier").notNull(),
	value: text("value").notNull(),
	expiresAt: timestamp("expires_at").notNull(),
	createdAt: timestamp("created_at"),
	updatedAt: timestamp("updated_at").$onUpdateFn(() => new Date())
});

export const sessions = pgTable("sessions", {
	id: text("id").primaryKey(),
	userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
	token: text("token").notNull().unique(),
	ipAddress: text("ip_address").notNull(),
	userAgent: text("user_agent").notNull(),
	expiresAt: timestamp("expires_at").notNull(),
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at").notNull().defaultNow().$onUpdateFn(() => new Date())
});

export const accounts = pgTable("accounts", {
	id: text("id").primaryKey(),
	accountId: text("account_id").notNull(),
	providerId: text("provider_id").notNull(),
	userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
	accessToken: text("access_token"),
	refreshToken: text("refresh_token"),
	idToken: text("id_token"),
	accessTokenExpiresAt: timestamp("access_token_expires_at"),
	refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
	scope: text("scope"),
	password: text("password"),
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at").notNull().defaultNow().$onUpdateFn(() => new Date())
});

export const players = pgTable("players", {
	id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
	type: playerTypeEnum("type").notNull(),
	userId: text("user_id").references(() => users.id, { onDelete: "cascade" }),
	name: text("name").notNull().default("Anonymous"),
	avatar: text("avatar"),
	createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => [
	index("idx_players_user_id").on(table.userId),
]);

export const gameRooms = pgTable("game_rooms", {
	id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
	joinCode: text("join_code").notNull().unique(),
	status: gameRoomStatusEnum("status").notNull().default("waiting"),
	mode: gameRoomModeEnum("mode").notNull().default("normal"),
	algorithm: algorithmEnum("algorithm").notNull().default("Bubble Sort"),
	initialArray: json("initial_array").notNull(),
	maxPlayers: integer("max_players").notNull().default(2),
	isPrivate: boolean("is_private").notNull().default(false),
	password: text("password"),
	hostPlayerId: text("host_player_id").notNull().references(() => players.id, { onDelete: "cascade" }),
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at").notNull().defaultNow().$onUpdateFn(() => new Date())
}, (table) => [
	index("idx_game_rooms_host_player_id").on(table.hostPlayerId),
	index("idx_game_rooms_join_code").on(table.joinCode),
]);

export const roomParticipants = pgTable("room_participants", {
	roomId: text("room_id").notNull().references(() => gameRooms.id, { onDelete: "cascade" }),
	playerId: text("player_id").notNull().references(() => players.id, { onDelete: "cascade" }),
	isReady: boolean("is_ready").notNull().default(false),
	score: integer("score").notNull().default(0),
	finishedAt: timestamp("finished_at"),
	joinedAt: timestamp("joined_at").notNull().defaultNow(),
}, (table) => [
	primaryKey({ columns: [table.roomId, table.playerId] }),
	index("idx_room_participants_room_id").on(table.roomId),
	index("idx_room_participants_player_id").on(table.playerId),
]);

export const matchSteps = pgTable("match_steps", {
	id: text("id").primaryKey(),
	roomId: text("room_id").notNull().references(() => gameRooms.id, { onDelete: "cascade" }),
	playerId: text("player_id").notNull().references(() => players.id, { onDelete: "cascade" }),
	stepNumber: integer("step_number").notNull(),
	currentArray: json("current_array").notNull(),
	isCorrect: boolean("is_correct").notNull(),
	createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => [
	uniqueIndex("idx_match_steps_room_id_player_id_step_number").on(table.roomId, table.playerId, table.stepNumber),
	index("idx_match_steps_room_id").on(table.roomId),
	index("idx_match_steps_player_id").on(table.playerId),
]);