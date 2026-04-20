import type { algorithmEnum, gameRoomModeEnum } from "$lib/server/db/schema";
import type { Server, Socket } from "socket.io";

export type Difficulty = typeof gameRoomModeEnum.enumValues[number];
export type Algorithm = typeof algorithmEnum.enumValues[number];
export type Step = { type: "swap"; a: number; b: number } | { type: "compare"; a: number; b: number } | { type: "overwrite"; index: number; value: number };

export interface GameState {
    algo: Algorithm;
    difficulty: Difficulty;
    initialArray: number[];
    solutionSteps: Step[];
    currentRound: number;
    maxRounds: number;
    playersFinished: number;
    players: Record<string, PlayerState>;
}

export interface PlayerState {
    currentArray: number[];
    stepIndex: number;
    finished: boolean;
    hintsLeft: number;
    timePenalty: number;
    score: number;
}

export interface ServerToClientEvents {
    "room:update": (data: any) => void;
    "room:join_success": () => void;
    "lobby:update": (data: any) => void;
    "lobby:remove": (data: any) => void;

    "room:started": (data: any) => void;
    "room:settings:update": (data: any) => void;

    "game:new_round": (data: any) => void;
    "game:move_result": (data: any) => void;
    "game:round_end": (data: any) => void;
    "game:hint_result": (data: any) => void;
    "game:player_done": (data: { playerId: string; timeout?: boolean }) => void;
    "game:next_round_start": () => void;
    "game:match_finished": () => void;

    "lobby:new": (data: any) => void;
    "error": (msg: string) => void;
    "ping:response": () => void;
}

export interface ClientToServerEvents {
    "room:join": (data: any) => void;
    "room:leave": () => void;
    "room:sync": () => void;
    "room:start": (data: any) => void;

    "game:ready": () => void;
    "game:try_move": (data: any) => void;
    "game:timeout": () => void;
    "game:request_hint": () => void;

    "room:settings:update": (data: any) => void;
    "player:ready": (data: any) => void;
    "ping:check": () => void;
}

export interface SocketData {
    userId?: string;
    isGuest: boolean;
    guestId?: string;
    roomId?: string;
    playerId?: string;
    rCode?: string;
    leftRoom?: boolean;
}

export type TypedServer = Server<
    ClientToServerEvents,
    ServerToClientEvents,
    any,
    SocketData
>;

export type TypedSocket = Socket<
    ClientToServerEvents,
    ServerToClientEvents,
    any,
    SocketData
>;

export type Events = ServerToClientEvents & ClientToServerEvents;