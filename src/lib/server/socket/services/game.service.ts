import { db } from "$lib/server/db";
import { gameRooms, players, roomParticipants, users, historicGames } from "$lib/server/db/schema";
import { and, eq } from "drizzle-orm";
import { activeGames } from "../state/activeGames";
import type { GameState, TypedServer, TypedSocket } from "../type";
import { generateArray, getSolutionSteps } from "$lib/utils/sorting";
import type { Algorithm, Difficulty } from "$lib/types";

export function createGame(roomId: string, algo: Algorithm, diff: Difficulty) {
    const initArray = generateArray(diff);
    const solution = getSolutionSteps(algo, initArray);

    const game: GameState = {
        algo,
        difficulty: diff,
        initialArray: initArray,
        solutionSteps: solution.steps,
        currentRound: 1,
        maxRounds: 3,
        playersFinished: 0,
        players: {}
    };

    activeGames.set(roomId, game);
    return game;
}

export function initPlayerState(game: GameState, playerId: string) {
    const hintsCount = game.difficulty === 'hard' ? 0 : 3;
    game.players[playerId] = {
        currentArray: [...game.initialArray],
        stepIndex: 0,
        finished: false,
        hintsLeft: hintsCount,
        timePenalty: 0,
        score: 0
    };
}

export function handleMove(socket: TypedSocket, indexA: number, indexB: number, io: TypedServer) {
    const { roomId, playerId, rCode } = socket.data;
    if (!roomId || !playerId || !rCode) return;

    const game = activeGames.get(roomId);
    if (!game) return;

    const playerState = game.players[playerId];
    if (!playerState || playerState.finished) return;

    const minIndex = Math.min(indexA, indexB);
    const maxIndex = Math.max(indexA, indexB);

    let isCorrect = false;
    const expectedStep = game.solutionSteps[playerState.stepIndex];

    if (expectedStep && expectedStep.type === "swap" && minIndex === expectedStep.a && maxIndex === expectedStep.b) {
        isCorrect = true;
        playerState.stepIndex++;
    }

    if (isCorrect) {
        const temp = playerState.currentArray[indexA];
        playerState.currentArray[indexA] = playerState.currentArray[indexB];
        playerState.currentArray[indexB] = temp;

        const isSorted = playerState.currentArray.every((val, i, arr) => i === 0 || arr[i - 1] <= val);

        if (isSorted) {
            playerState.finished = true;
            game.playersFinished++;

            const timeTakenMs = Date.now() - (game as any).roundStartTime;
            const timeTakenSec = Math.floor(timeTakenMs / 1000);
            const timeLeft = Math.max(0, 60 - timeTakenSec - playerState.timePenalty);

            const rankBonus = Math.max(0, ((game as any).totalPlayers - game.playersFinished) * 100);
            const roundScore = (timeLeft * 10) + rankBonus;

            playerState.score += roundScore;

            socket.emit("game:round_end", {
                correct: true,
                indexA,
                indexB,
                isSorted: true,
                timeLeft,
                roundScore,
                totalScore: playerState.score,
                rank: game.playersFinished,
                timeout: false,
                array: playerState.currentArray
            });

            io.to(rCode).emit("game:player_done", { playerId });

            checkRoundEnd(game, roomId, rCode, io);
            return true;
        } else {
            socket.emit("game:move_result", { correct: true, isSorted: false, array: playerState.currentArray, indexA, indexB });
        }
    } else {
        playerState.timePenalty += 5;
        socket.emit("game:move_result", { correct: false, penalty: 5, array: playerState.currentArray });
    }
    return false;
}

export function handleTimeout(socket: TypedSocket, io: TypedServer) {
    const { roomId, playerId, rCode } = socket.data;
    if (!roomId || !playerId || !rCode) return;

    const game = activeGames.get(roomId);
    if (!game) return;

    const playerState = game.players[playerId];
    if (!playerState || playerState.finished) return;

    playerState.finished = true;
    game.playersFinished++;

    socket.emit("game:round_end", {
        correct: false,
        isSorted: false,
        timeLeft: 0,
        roundScore: 0,
        totalScore: playerState.score,
        rank: game.playersFinished,
        timeout: true,
        array: playerState.currentArray
    });

    io.to(rCode).emit("game:player_done", { playerId, timeout: true });
    checkRoundEnd(game, roomId, rCode, io);
}


async function checkRoundEnd(game: GameState, roomId: string, rCode: string, io: TypedServer) {
    const totalPlayers = (game as any).totalPlayers || 1;
    if (game.playersFinished >= totalPlayers) {
        if (game.currentRound < game.maxRounds) {
            // Wait 5 seconds then start next round
            setTimeout(() => {
                startNextRound(game, rCode, io);
            }, 5000);
        } else {
            try {
                for (const pid in game.players) {
                    const pState = game.players[pid];
                    const finalScore = pState.score;

                    await db.update(roomParticipants)
                        .set({ score: finalScore, finishedAt: new Date() })
                        .where(and(eq(roomParticipants.roomId, roomId), eq(roomParticipants.playerId, pid)));

                    const playerRecord = await db.query.players.findFirst({
                        where: eq(players.id, pid)
                    });

                    if (playerRecord && playerRecord.userId) {
                        await db.insert(historicGames).values({
                            userId: playerRecord.userId,
                            roomId: roomId,
                            algorithm: game.algo,
                            mode: game.difficulty,
                            score: finalScore,
                            playedAt: new Date()
                        });

                        const userRecord = await db.query.users.findFirst({
                            where: eq(users.id, playerRecord.userId)
                        });

                        if (userRecord) {
                            await db.update(users)
                                .set({ rankScore: (userRecord.rankScore || 0) + finalScore })
                                .where(eq(users.id, userRecord.id));
                        }
                    }
                }

                await db.update(gameRooms)
                    .set({ status: 'ended' })
                    .where(eq(gameRooms.id, roomId));

                io.to(rCode).emit("game:match_finished");
                activeGames.delete(roomId);
            } catch (err) {
                console.error("Error saving match results: ", err);
                io.to(rCode).emit("game:match_finished");
                activeGames.delete(roomId);
            }
        }
    }
}

function startNextRound(game: GameState, rCode: string, io: TypedServer) {
    game.currentRound++;
    game.initialArray = generateArray(game.difficulty);
    const solution = getSolutionSteps(game.algo, game.initialArray);
    game.solutionSteps = solution.steps;
    game.playersFinished = 0;
    (game as any).roundStartTime = Date.now();

    for (const pid in game.players) {
        const pState = game.players[pid];
        pState.currentArray = [...game.initialArray];
        pState.stepIndex = 0;
        pState.finished = false;
        pState.timePenalty = 0;
        pState.hintsLeft = game.difficulty === 'hard' ? 0 : 3;
    }

    io.to(rCode).emit("game:next_round_start");
}

export function handleHint(socket: TypedSocket) {
    const { roomId, playerId } = socket.data;
    if (!roomId || !playerId) return;
    const game = activeGames.get(roomId);

    if (game) {
        const playerState = game.players[playerId];
        if (playerState && !playerState.finished && playerState.hintsLeft > 0) {
            const nextStep = game.solutionSteps[playerState.stepIndex];
            if (nextStep && nextStep.type === "swap") {
                playerState.hintsLeft--;
                socket.emit("game:hint_result", {
                    hintIndices: [nextStep.a, nextStep.b],
                    hintsLeft: playerState.hintsLeft
                });
            }
        }
    }
}