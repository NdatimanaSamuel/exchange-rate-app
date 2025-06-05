import React from 'react';
import { ArrowLongRightIcon } from '@heroicons/react/24/solid';

const TransactionsTable = ({ transactions, isLoading }) => {
    const formatValue = (amount) => parseFloat(amount).toLocaleString('en-US', { minimumFractionDigits: 2 });
    const formatDate = (date) => new Date(date).toLocaleTimeString();

    return (
        <div className="bg-white p-6 rounded-lg shadow-md h-full">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Today's Transactions</h3>
            <div className="overflow-y-auto max-h-[400px]">
                {isLoading ? (
                    <p>Loading transactions...</p>
                ) : transactions.length > 0 ? (
                    <ul className="space-y-3">
                        {transactions.map(tx => (
                            <li key={tx.id} className="p-3 bg-gray-50 rounded-md flex justify-between items-center">
                                <div className="flex items-center space-x-3">
                                    <div className="text-red-600 font-medium">
                                        - {formatValue(tx.fromAmount)} {tx.fromCurrency.code}
                                    </div>
                                    <ArrowLongRightIcon className="h-5 w-5 text-gray-400" />
                                    <div className="text-green-600 font-medium">
                                        + {formatValue(tx.toAmount)} {tx.toCurrency.code}
                                    </div>
                                </div>
                                <div className="text-xs text-gray-500 text-right">
                                    <p>{formatDate(tx.createdAt)}</p>
                                    <p className="text-green-700">Profit: {formatValue(tx.profit)}</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-gray-500">No transactions made today.</p>
                )}
            </div>
        </div>
    );
};

export default TransactionsTable;