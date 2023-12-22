import { fromWei } from "@openformat/react";
import * as dayjs from "dayjs";
import { ethers } from "ethers";

/**
 * Generates a leaderboard based on actions and missions.
 * Each entry in the leaderboard includes a user identifier and their total XP rewarded.
 * The leaderboard is sorted by XP rewarded in descending order.
 *
 * @param {Object} params - The parameters object.
 * @param {Action[]} params.actions - Array of actions to be included in the leaderboard.
 * @param {Mission[]} params.missions - Array of missions to be included in the leaderboard.
 * @returns {LeaderboardEntry[]} An array of leaderboard entries, each containing a user ID and their total XP rewarded.
 */
export function generateLeaderboard({
  actions,
  missions,
}: {
  actions: Action[];
  missions: Mission[];
}): LeaderboardEntry[] {
  const leaderboard = new Map<string, ethers.BigNumber>();

  const processEntries = (entries: Array<Action | Mission>) => {
    entries?.forEach((entry) => {
      const userId = entry.user.id;
      const xp = ethers.BigNumber.from(entry.xp_rewarded);
      leaderboard.set(
        userId,
        (leaderboard.get(userId) || ethers.BigNumber.from(0)).add(xp)
      );
    });
  };

  // Process both actions and missions
  processEntries(actions);
  processEntries(missions);

  return Array.from(leaderboard, ([user, xp_rewarded]) => ({
    user,
    xp_rewarded: Number(fromWei(xp_rewarded)).toFixed(0),
  })).sort((a, b) => Number(b.xp_rewarded) - Number(a.xp_rewarded));
}

/**
 * Converts start and end dates into Unix timestamps in string format.
 *
 * @param {string | dayjs.Dayjs} startDate - The start date, either as a string or a dayjs object.
 * @param {string | dayjs.Dayjs} endDate - The end date, either as a string or a dayjs object.
 * @returns {{ startTimestamp: string; endTimestamp: string }} An object containing the start and end timestamps as strings.
 */
export function convertToTimestamps(
  startDate: string | dayjs.Dayjs,
  endDate: string | dayjs.Dayjs
): { startTimestamp: string; endTimestamp: string } {
  const start = dayjs(startDate);
  const end = dayjs(endDate);

  const startTimestamp = start.unix().toString();
  const endTimestamp = end.unix().toString();

  return { startTimestamp, endTimestamp };
}
