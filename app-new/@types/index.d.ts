interface Action {
  xp_rewarded: string;
  user: { id: string };
  createdAt: string;
}

interface Mission {
  xp_rewarded: string;
  user: { id: string };
  createdAt: string;
}

interface LeaderboardEntry {
  user: string;
  xp_rewarded: string;
}

export interface ProfileData {
  nickname: string;
  eth_address: string;
  email_address: string;
}
