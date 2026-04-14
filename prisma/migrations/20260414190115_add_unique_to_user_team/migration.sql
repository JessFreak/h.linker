/*
  Warnings:

  - A unique constraint covering the columns `[user_id,team_id]` on the table `users_teams` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "users_teams_user_id_team_id_key" ON "users_teams"("user_id", "team_id");
