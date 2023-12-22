import { useRawRequest } from "@openformat/react";
import dayjs from "dayjs";
import * as React from "react";
import { leaderboardData } from "../queries/leaderboard";
import { convertToTimestamps, generateLeaderboard } from "../utils/leaderboard";

export default () => {
  // State to store the leaderboard data
  const [leaderboard, setLeaderboard] = React.useState<LeaderboardEntry[]>();
  const [isLoading, setIsLoading] = React.useState<boolean>(true);

  // Calculate the start and end of the current week
  const startOfWeek = dayjs().startOf("week");
  const endOfWeek = startOfWeek.endOf("week");
  //const startOfWeek = dayjs("2023-12-04");
  //const endOfWeek = dayjs("2023-12-04 19:20");

  // Convert start and end dates of the week to timestamps
  const { startTimestamp, endTimestamp } = convertToTimestamps(
    startOfWeek,
    endOfWeek
  );

  // Custom hook to make a request for leaderboard data
  useRawRequest<{ actions: Action[]; missions: Mission[] }, any>({
    query: leaderboardData,
    variables: {
      appId: process.env.NEXT_PUBLIC_APP_ID, // Application ID from environment variables
      start: startTimestamp, // Start timestamp of the week
      end: endTimestamp, // End timestamp of the week
    },
    config: {
      onSuccess(data) {
        // Set the leaderboard data upon successful retrieval
        setLeaderboard(() => generateLeaderboard(data));
      },
      onSettled: () => setIsLoading(false),
    },
  });

  if (isLoading)
    return (
      <div aria-live="assertive" aria-busy="true">
        Loading...
      </div>
    );

  // Render the leaderboard as a table
  return (
    <table className="leaderboard-table" aria-live="polite">
      <caption id="leaderboard-caption">Leaderboard</caption>
      <thead>
        <tr role="row">
          <th scope="col" role="columnheader">
            Rank
          </th>
          <th scope="col" role="columnheader">
            User
          </th>
          <th scope="col" role="columnheader" aria-sort="descending">
            XP Rewarded
          </th>
        </tr>
      </thead>
      <tbody>
        {leaderboard?.map((item, index) => (
          <tr key={index}>
            <td>{index + 1}</td>
            <td>{item.user}</td>
            <td>{item.xp_rewarded}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};
