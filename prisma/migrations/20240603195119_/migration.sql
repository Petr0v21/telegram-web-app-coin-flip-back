/*
  Warnings:

  - Added the required column `side` to the `Game` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "CoinSide" AS ENUM ('HEADS', 'TAILS');

-- AlterTable
ALTER TABLE "Game" ADD COLUMN     "side" "CoinSide" NOT NULL;
