# GetStarted with OPENFORMAT

Welcome to the GetStarted template for OPENFORMAT – your gateway to integrating core features of the OPENFORMAT platform into your project. This template is designed to streamline the implementation process and provide you with a solid foundation to build upon. Key features include:

- **Play (Rewards)**: Engage users with a dynamic on-chain rewards system.
- **Profile Management**: Enable users to create and manage their profiles.
- **Leaderboard Functionality**: Foster competition with a real-time leaderboard.
- **Quests**: Introduce quests to enhance user interaction and engagement.

## Technology Stack

- **Frontend**: Built with NextJS. see the [Frontend README](./frontend/README.md) for more details.

- **Backend**: Developed using TypeScript, the backend is powered by Hono for serverless functions and Prisma for database management, ensuring robustness and scalability. See the [Backend README](./backend/README.md) for more details.

> [!IMPORTANT]  
> This application is not production ready. We've focused on creating a minimal implementation to help you understand how to use OPENFORMAT.

## Getting Started

### Prerequisites

- We're using Bun as the JavaScript runtime for its awesome performance - [Bun](https://bun.sh/)
- Node.js 18.17 or later (This is due to Next.js and Prisma relying on Node.js APIs that Bun does not yet implement - [Ref](https://bun.sh/guides/ecosystem/nextjs)). Once Bun supports these APIs this will not longer be required.

### Setup

1. Clone the repository:

```bash
git clone https://github.com/open-format/get-started.git
```

2. Navigate to the project directory:

```bash
cd get-started
```

3. Run setup script (Install dependencies,setups local database and generate env files):

```bash
make setup
```

4. Add environment variables to `./backend/.env` and `./frontend/.env.local`

5. Execute development commands:

```bash
bun dev
```

5. Open your browser to view the applications:

   - Backend is running at [http://localhost:8000](http://localhost:8080)
   - React app is available at [http://localhost:3000](http://localhost:3000)

## Token System Usage Guide

### Overview

The Token System is designed to calculate and trigger rewards based on user actions and completed missions. It utilises two main configuration files: `actions.ts` and `missions.ts`, and a core class `TokenSystem`.

### `actions.ts` - Action Configurations

This file sets up the actions that users can perform to earn rewards.

| Key           | Type   | Description                                          |
| ------------- | ------ | ---------------------------------------------------- |
| `id`          | String | Unique identifier for the action.                    |
| `amount`      | Number | The reward amount associated with the action.        |
| `description` | String | A brief description of the action.                   |
| `address`     | String | Ethereum token address related to the action reward. |

#### Structure Example:

```ts
export default [
  {
    id: "test_action",
    amount: 10,
    description: "trigger_test_action",
    address: process.env.XP_TOKEN_ID,
  },
];
```

### `missions.ts` - Mission Configurations

This file defines missions that users can complete for additional rewards.

| Key            | Type   | Description                                                                         |
| -------------- | ------ | ----------------------------------------------------------------------------------- |
| `id`           | String | Unique identifier for the mission.                                                  |
| `description`  | String | Detailed description of the mission.                                                |
| `tokens`       | Array  | List of tokens (with addresses and amounts) associated with completing the mission. |
| `requirements` | Array  | List of requirements (actions and counts) needed to complete the mission.           |

#### `tokens` Array Structure

| Key       | Type   | Description                                           |
| --------- | ------ | ----------------------------------------------------- |
| `address` | String | Ethereum token address related to the mission reward. |
| `amount`  | Number | Amount of the token to be rewarded.                   |

#### `requirements` Array Structure

| Key        | Type   | Description                                       |
| ---------- | ------ | ------------------------------------------------- |
| `actionId` | String | ID of the action required for the mission.        |
| `count`    | Number | Number of times the action needs to be completed. |

#### Structure Example:

```ts
export default [
  {
    id: "test_mission",
    description:
      "Complete two test actions to complete the Test Mission",
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
```

## `tokenSystem` - Main Logic

The `TokenSystem` class is responsible for integrating the actions and missions with the reward logic.

### Core Functions:

- `getUser(address: string)`: Retrieves a user object with relevant information based on the given address.
- `handleCompletedAction(address: string, actionId: string)`: Handles the logic when a user completes an action.
- `calculateUserXP(completedActions: string[])`: Calculates the total XP of a user based on completed actions.
- `calculateCompletedMissions(completedActions: string[])`: Determines which missions have been completed by the user.
- `getActionById(id: string)`: Fetches action configuration by ID.
- `getMissionById(id: string)`: Fetches mission configuration by ID.

### Example Usage:

```typescript
import TokenSystem from "./path/to/TokenSystem";
import { OpenFormatSDK } from "@openformat/sdk";

const sdk = new OpenFormatSDK({
  network: Chains.polygonMumbai,
  starId: process.env.APPLICATION_ID as string,
  signer: process.env.PRIVATE_KEY,
});

const tokenSystem = new TokenSystem(sdk);

// Example: Get user info
const userInfo = await tokenSystem.getUser("0xUserAddress...");

// Example: Handle completed action
const updatedUser = await tokenSystem.handleCompletedAction(
  "0xUserAddress...",
  "actionId"
);
```
