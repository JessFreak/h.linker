import { TeamResponse } from '@h.linker/libs';

export class TeamUtils {
  static isMember(
    team: TeamResponse | null | undefined,
    userId: string | undefined,
  ): boolean {
    if (!team || !userId) return false;
    return !!team.members?.some((m) => m.id === userId);
  }

  static isLeader(
    team: TeamResponse | null | undefined,
    userId: string | undefined,
  ): boolean {
    if (!team || !userId) return false;
    return team.leaderId === userId;
  }

  static hasPendingRequest(
    team: TeamResponse | null | undefined,
    userId: string | undefined,
  ): boolean {
    if (!team || !userId) return false;
    return !!team.requests?.some((r) => r.id === userId);
  }
}
