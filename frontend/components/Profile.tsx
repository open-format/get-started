import { ProfileData } from "@/@types";
import { useProfileStore } from "@/stores";
import apiClient from "@/utils/apiClient";
import { useWallet } from "@openformat/react";
import { useQuery } from "@tanstack/react-query";

export default function Profile() {
  const { setProfileData } = useProfileStore();
  const { address } = useWallet();

  const { data: profileData, isLoading } = useQuery({
    queryKey: ["profileData"],
    queryFn: fetchProfileData,
    enabled: Boolean(address),
  });

  async function fetchProfileData(): Promise<ProfileData> {
    return await apiClient
      .get("profile/me")
      .then((res) => {
        setProfileData(res.data.data);
        return res.data.data;
      })
      .catch((err) => console.log({ err }));
  }

  if (isLoading)
    return (
      <div aria-live="assertive" aria-busy="true">
        Loading...
      </div>
    );

  return (
    <section id="profile" className="main">
      <h2>Your Profile</h2>
      {profileData && (
        <div className="user-data">
          <div className="user-data-details">
            <figcaption id="user-name">
              {profileData?.name}
            </figcaption>
            <p id="user-email">{profileData?.email}</p>
            <p id="user-wallet">{profileData?.eth_address}</p>
          </div>
          <div className="user-data-wallet-scores">
            <ul id="user-tokens">
              <li>
                <strong>Total XP:</strong> {profileData?.xp_balance}
              </li>
              <li>
                <strong>Total Reward Token:</strong>{" "}
                {profileData?.reward_token_balance}
              </li>
            </ul>
          </div>
        </div>
      )}
    </section>
  );
}
