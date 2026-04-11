/*
  Warnings:

  - You are about to drop the column `hackaton_id` on the `criteria` table. All the data in the column will be lost.
  - You are about to drop the column `hackaton_id` on the `jury` table. All the data in the column will be lost.
  - You are about to drop the column `hackaton_id` on the `participations` table. All the data in the column will be lost.
  - You are about to drop the `hackatons` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `hackatons_categories` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[hackathon_id,user_id]` on the table `jury` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[team_id,hackathon_id]` on the table `participations` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `hackathon_id` to the `criteria` table without a default value. This is not possible if the table is not empty.
  - Added the required column `hackathon_id` to the `jury` table without a default value. This is not possible if the table is not empty.
  - Added the required column `hackathon_id` to the `participations` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "HackathonStatus" AS ENUM ('DRAFT', 'REGISTRATION', 'ACTIVE', 'FINISHED');

-- DropForeignKey
ALTER TABLE "criteria" DROP CONSTRAINT "criteria_hackaton_id_fkey";

-- DropForeignKey
ALTER TABLE "hackatons" DROP CONSTRAINT "hackatons_creator_id_fkey";

-- DropForeignKey
ALTER TABLE "hackatons_categories" DROP CONSTRAINT "hackatons_categories_category_fkey";

-- DropForeignKey
ALTER TABLE "hackatons_categories" DROP CONSTRAINT "hackatons_categories_hackaton_id_fkey";

-- DropForeignKey
ALTER TABLE "jury" DROP CONSTRAINT "jury_hackaton_id_fkey";

-- DropForeignKey
ALTER TABLE "participations" DROP CONSTRAINT "participations_hackaton_id_fkey";

-- DropIndex
DROP INDEX "jury_hackaton_id_user_id_key";

-- DropIndex
DROP INDEX "participations_team_id_hackaton_id_key";

-- AlterTable
ALTER TABLE "criteria" DROP COLUMN "hackaton_id",
ADD COLUMN     "hackathon_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "jury" DROP COLUMN "hackaton_id",
ADD COLUMN     "hackathon_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "participations" DROP COLUMN "hackaton_id",
ADD COLUMN     "hackathon_id" TEXT NOT NULL;

-- DropTable
DROP TABLE "hackatons";

-- DropTable
DROP TABLE "hackatons_categories";

-- DropEnum
DROP TYPE "HackatonStatus";

-- CreateTable
CREATE TABLE "hackathons" (
    "id" TEXT NOT NULL,
    "creator_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" "HackathonStatus" NOT NULL DEFAULT 'DRAFT',
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "image_url" TEXT,

    CONSTRAINT "hackathons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hackathons_categories" (
    "hackathon_id" TEXT NOT NULL,
    "category" TEXT NOT NULL,

    CONSTRAINT "hackathons_categories_pkey" PRIMARY KEY ("hackathon_id","category")
);

-- CreateIndex
CREATE UNIQUE INDEX "jury_hackathon_id_user_id_key" ON "jury"("hackathon_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "participations_team_id_hackathon_id_key" ON "participations"("team_id", "hackathon_id");

-- AddForeignKey
ALTER TABLE "hackathons" ADD CONSTRAINT "hackathons_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hackathons_categories" ADD CONSTRAINT "hackathons_categories_hackathon_id_fkey" FOREIGN KEY ("hackathon_id") REFERENCES "hackathons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hackathons_categories" ADD CONSTRAINT "hackathons_categories_category_fkey" FOREIGN KEY ("category") REFERENCES "categories"("name") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "participations" ADD CONSTRAINT "participations_hackathon_id_fkey" FOREIGN KEY ("hackathon_id") REFERENCES "hackathons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "criteria" ADD CONSTRAINT "criteria_hackathon_id_fkey" FOREIGN KEY ("hackathon_id") REFERENCES "hackathons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jury" ADD CONSTRAINT "jury_hackathon_id_fkey" FOREIGN KEY ("hackathon_id") REFERENCES "hackathons"("id") ON DELETE CASCADE ON UPDATE CASCADE;
