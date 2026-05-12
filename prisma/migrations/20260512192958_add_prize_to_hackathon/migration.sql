/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `hackathons` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `reg_start_date` to the `hackathons` table without a default value. This is not possible if the table is not empty.
  - Added the required column `slug` to the `hackathons` table without a default value. This is not possible if the table is not empty.
  - Added the required column `submission_deadline` to the `hackathons` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "hackathons" ADD COLUMN     "prize" TEXT,
ADD COLUMN     "reg_start_date" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "slug" TEXT NOT NULL,
ADD COLUMN     "submission_deadline" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "hackathons_slug_key" ON "hackathons"("slug");
