-- AlterTable
ALTER TABLE `Media` ADD COLUMN `qrVisits` INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE `Visit` (
    `id` VARCHAR(191) NOT NULL,
    `timestamp` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `source` VARCHAR(191) NULL,
    `path` VARCHAR(191) NOT NULL,
    `userAgent` VARCHAR(191) NULL,
    `ip` VARCHAR(191) NULL,

    INDEX `Visit_timestamp_idx`(`timestamp`),
    INDEX `Visit_source_idx`(`source`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
