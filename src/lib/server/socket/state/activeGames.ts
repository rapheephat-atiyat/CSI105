import type { GameState } from "../type";

export const activeGames = new Map<string, GameState>();
export const disconnectTimeouts = new Map<string, NodeJS.Timeout>();
