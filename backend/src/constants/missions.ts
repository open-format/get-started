export default [
  {
    id: "Reward User",
    description:
      "Press Reward User on the App page twice to complete this Quest.",
    tokens: [
      {
        address: process.env.XP_TOKEN_ID,
        amount: 100,
      },
      {
        address: process.env.REWARD_TOKEN_ID,
        amount: 5,
      },
    ],
    badgeUrl: "https://i.postimg.cc/4yg90byK/avatar.png",
    requirements: [
      {
        actionId: "test_action",
        description: "Complete the test action twice!",
        count: 2,
      },
    ],
  },
];
