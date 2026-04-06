-- CreateEnum
CREATE TYPE "HackatonStatus" AS ENUM ('DRAFT', 'REGISTRATION', 'ACTIVE', 'FINISHED');

-- CreateEnum
CREATE TYPE "UserTeamStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'LEFT');

-- CreateTable
CREATE TABLE "roles" (
    "name" TEXT NOT NULL,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("name")
);

-- CreateTable
CREATE TABLE "categories" (
    "name" TEXT NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("name")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT,
    "github_id" TEXT,
    "bio" TEXT,
    "avatar_url" TEXT,
    "password" TEXT NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "teams" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "leader_id" TEXT NOT NULL,
    "description" TEXT,
    "communication_link" TEXT,

    CONSTRAINT "teams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users_teams" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "team_id" TEXT NOT NULL,
    "role_name" TEXT NOT NULL,
    "status" "UserTeamStatus" NOT NULL DEFAULT 'PENDING',
    "type" TEXT,
    "message" TEXT,
    "created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_teams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hackatons" (
    "id" TEXT NOT NULL,
    "creator_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" "HackatonStatus" NOT NULL DEFAULT 'DRAFT',
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "image_url" TEXT,

    CONSTRAINT "hackatons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users_categories" (
    "user_id" TEXT NOT NULL,
    "category" TEXT NOT NULL,

    CONSTRAINT "users_categories_pkey" PRIMARY KEY ("user_id","category")
);

-- CreateTable
CREATE TABLE "hackatons_categories" (
    "hackaton_id" TEXT NOT NULL,
    "category" TEXT NOT NULL,

    CONSTRAINT "hackatons_categories_pkey" PRIMARY KEY ("hackaton_id","category")
);

-- CreateTable
CREATE TABLE "participations" (
    "id" TEXT NOT NULL,
    "team_id" TEXT NOT NULL,
    "hackaton_id" TEXT NOT NULL,
    "github_repo_url" TEXT,
    "final_score" DOUBLE PRECISION NOT NULL DEFAULT 0,

    CONSTRAINT "participations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "criteria" (
    "id" TEXT NOT NULL,
    "hackaton_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL,
    "max_value" INTEGER NOT NULL DEFAULT 10,

    CONSTRAINT "criteria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "jury" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "hackaton_id" TEXT NOT NULL,

    CONSTRAINT "jury_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scores" (
    "id" TEXT NOT NULL,
    "jury_id" TEXT NOT NULL,
    "participation_id" TEXT NOT NULL,
    "criterion_id" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "scores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reviews" (
    "id" TEXT NOT NULL,
    "participation_id" TEXT NOT NULL,
    "jury_id" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "strengths" TEXT,
    "weaknesses" TEXT,

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_github_id_key" ON "users"("github_id");

-- CreateIndex
CREATE UNIQUE INDEX "participations_team_id_hackaton_id_key" ON "participations"("team_id", "hackaton_id");

-- CreateIndex
CREATE UNIQUE INDEX "jury_hackaton_id_user_id_key" ON "jury"("hackaton_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "reviews_jury_id_participation_id_key" ON "reviews"("jury_id", "participation_id");

-- AddForeignKey
ALTER TABLE "teams" ADD CONSTRAINT "teams_leader_id_fkey" FOREIGN KEY ("leader_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users_teams" ADD CONSTRAINT "users_teams_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users_teams" ADD CONSTRAINT "users_teams_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users_teams" ADD CONSTRAINT "users_teams_role_name_fkey" FOREIGN KEY ("role_name") REFERENCES "roles"("name") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hackatons" ADD CONSTRAINT "hackatons_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users_categories" ADD CONSTRAINT "users_categories_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users_categories" ADD CONSTRAINT "users_categories_category_fkey" FOREIGN KEY ("category") REFERENCES "categories"("name") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hackatons_categories" ADD CONSTRAINT "hackatons_categories_hackaton_id_fkey" FOREIGN KEY ("hackaton_id") REFERENCES "hackatons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hackatons_categories" ADD CONSTRAINT "hackatons_categories_category_fkey" FOREIGN KEY ("category") REFERENCES "categories"("name") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "participations" ADD CONSTRAINT "participations_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "participations" ADD CONSTRAINT "participations_hackaton_id_fkey" FOREIGN KEY ("hackaton_id") REFERENCES "hackatons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "criteria" ADD CONSTRAINT "criteria_hackaton_id_fkey" FOREIGN KEY ("hackaton_id") REFERENCES "hackatons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jury" ADD CONSTRAINT "jury_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jury" ADD CONSTRAINT "jury_hackaton_id_fkey" FOREIGN KEY ("hackaton_id") REFERENCES "hackatons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scores" ADD CONSTRAINT "scores_jury_id_fkey" FOREIGN KEY ("jury_id") REFERENCES "jury"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scores" ADD CONSTRAINT "scores_participation_id_fkey" FOREIGN KEY ("participation_id") REFERENCES "participations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scores" ADD CONSTRAINT "scores_criterion_id_fkey" FOREIGN KEY ("criterion_id") REFERENCES "criteria"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_participation_id_fkey" FOREIGN KEY ("participation_id") REFERENCES "participations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_jury_id_fkey" FOREIGN KEY ("jury_id") REFERENCES "jury"("id") ON DELETE CASCADE ON UPDATE CASCADE;
