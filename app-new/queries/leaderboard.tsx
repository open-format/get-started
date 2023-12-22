import { gql } from "graphql-request";

export const leaderboardData = gql`
  query leaderboardData(
    $appId: String!
    $start: String!
    $end: String!
  ) {
    actions(
      first: 1000
      where: {
        star_contains_nocase: $appId
        createdAt_gte: $start
        createdAt_lte: $end
      }
      orderBy: createdAt
      orderDirection: desc
    ) {
      xp_rewarded
      user {
        id
      }
      createdAt
    }
    missions(
      first: 1000
      where: {
        star_contains_nocase: $appId
        createdAt_gte: $start
        createdAt_lte: $end
      }
      orderBy: createdAt
      orderDirection: desc
    ) {
      xp_rewarded
      user {
        id
      }
      createdAt
    }
  }
`;
