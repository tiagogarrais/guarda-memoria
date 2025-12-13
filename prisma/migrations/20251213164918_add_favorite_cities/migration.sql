-- CreateTable
CREATE TABLE `_UserFavoriteCities` (
    `A` INTEGER NOT NULL,
    `B` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `_UserFavoriteCities_AB_unique`(`A`, `B`),
    INDEX `_UserFavoriteCities_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `_UserFavoriteCities` ADD CONSTRAINT `_UserFavoriteCities_A_fkey` FOREIGN KEY (`A`) REFERENCES `City`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_UserFavoriteCities` ADD CONSTRAINT `_UserFavoriteCities_B_fkey` FOREIGN KEY (`B`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
