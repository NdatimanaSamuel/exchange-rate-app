-- CreateTable
CREATE TABLE `ExchangeRate` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `base` VARCHAR(3) NOT NULL,
    `target` VARCHAR(3) NOT NULL,
    `buyRate` DECIMAL(18, 6) NOT NULL,
    `sellRate` DECIMAL(18, 6) NOT NULL,
    `provider` VARCHAR(191) NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `ExchangeRate_base_target_idx`(`base`, `target`),
    UNIQUE INDEX `ExchangeRate_base_target_createdAt_key`(`base`, `target`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
