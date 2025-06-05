-- CreateTable
CREATE TABLE `Transaction` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `tellerId` INTEGER NOT NULL,
    `fromCurrencyId` INTEGER NOT NULL,
    `toCurrencyId` INTEGER NOT NULL,
    `fromAmount` DECIMAL(18, 2) NOT NULL,
    `toAmount` DECIMAL(18, 2) NOT NULL,
    `rate` DECIMAL(18, 6) NOT NULL,
    `exchangeRateId` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `profit` DECIMAL(18, 2) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_TellerTransactions` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_TellerTransactions_AB_unique`(`A`, `B`),
    INDEX `_TellerTransactions_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Transaction` ADD CONSTRAINT `Transaction_tellerId_fkey` FOREIGN KEY (`tellerId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Transaction` ADD CONSTRAINT `Transaction_fromCurrencyId_fkey` FOREIGN KEY (`fromCurrencyId`) REFERENCES `Currency`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Transaction` ADD CONSTRAINT `Transaction_toCurrencyId_fkey` FOREIGN KEY (`toCurrencyId`) REFERENCES `Currency`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Transaction` ADD CONSTRAINT `Transaction_exchangeRateId_fkey` FOREIGN KEY (`exchangeRateId`) REFERENCES `ExchangeRate`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_TellerTransactions` ADD CONSTRAINT `_TellerTransactions_A_fkey` FOREIGN KEY (`A`) REFERENCES `Transaction`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_TellerTransactions` ADD CONSTRAINT `_TellerTransactions_B_fkey` FOREIGN KEY (`B`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
