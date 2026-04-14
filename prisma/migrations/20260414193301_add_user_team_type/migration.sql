/*
  Warnings:

  - Added the required column `type` to the `users_teams` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "UserTeamType" AS ENUM ('INVITATION', 'REQUEST');

-- AlterTable
ALTER TABLE "users_teams" DROP COLUMN "type",
ADD COLUMN     "type" "UserTeamType" NOT NULL;
