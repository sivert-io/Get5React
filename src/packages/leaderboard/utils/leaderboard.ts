import { UserType } from "@/common";
import { User } from "@prisma/client";

export function addPositionsToUsers(players: any[]) {
  const sortedLeaderboardUsers: (User & { position: number })[] = [];

  players
    .sort((a, b) => b.rating - a.rating)
    .forEach((user, i) => {
      sortedLeaderboardUsers.push({ ...user, position: i + 1 });
    });

  return sortedLeaderboardUsers;
}

export function getRatingGroups(users: UserType[] | User[]) {
  // Calculate rank distribution
  if (users.length === 0) {
    return [];
  }
  const step = 1000;
  const maxRating =
    Math.ceil(Math.max(...users.map((user) => user.rating)) / step) * step;
  const distribution = [];

  for (let i = 0; i <= maxRating; i += step) {
    distribution.push({
      x: `${i / 1000}K-${(i + step) / 1000}K`,
      y: users.filter((user) => user.rating >= i && user.rating < i + step)
        .length,
    });
  }

  return distribution;
}
