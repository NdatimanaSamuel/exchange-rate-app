/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useMemo } from 'react';
import { ArrowPathIcon } from '@heroicons/react/24/outline';

// THE FIX IS HERE: We must accept `tellerId` in the props.
const TransactionForm = ({ tellerId, currencies, rates, balances, onSubmit, isLoading }) => {
    // --- State for the form inputs ---
    const [fromCurrency, setFromCurrency] = useState('');
    const [toCurrency, setToCurrency] = useState('');
    const [amount, setAmount] = useState('');
    
    // --- State for the calculated results ---
    const [foundRate, setFoundRate] = useState(null);
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // --- Core Logic: Find the correct exchange rate ---
    useEffect(() => {
        if (!fromCurrency || !toCurrency) {
            setFoundRate(null);
            return;
        }
        const fromCode = currencies.find(c => c.id === parseInt(fromCurrency))?.code;
        const toCode = currencies.find(c => c.id === parseInt(toCurrency))?.code;
        if (!fromCode || !toCode) return;
        const rate = rates.find(
            r => (r.base === fromCode && r.target === toCode) || (r.base === toCode && r.target === fromCode)
        );
        if (rate) {
            setFoundRate(rate);
            setError('');
        } else {
            setFoundRate(null);
            setError('No active exchange rate found for this pair.');
        }
    }, [fromCurrency, toCurrency, rates, currencies]);


    // --- Calculate the exchange result for preview ---
    const exchangeResult = useMemo(() => {
        if (!foundRate || !amount || parseFloat(amount) <= 0) {
            return { toAmount: 0, rateUsed: 0, rateType: '', formula: '', toCode: '' };
        }
        const fromAmount = parseFloat(amount);
        const fromCode = currencies.find(c => c.id === parseInt(fromCurrency))?.code;
        const toCode = currencies.find(c => c.id === parseInt(toCurrency))?.code;

        if (fromCode === foundRate.base) {
            const rate = parseFloat(foundRate.buyRate);
            return { toAmount: (fromAmount * rate).toFixed(2), rateUsed: rate, rateType: 'Buy Rate', formula: `${fromAmount.toLocaleString()} ${fromCode} × ${rate}`, toCode: toCode };
        } else {
            const rate = parseFloat(foundRate.sellRate);
            return { toAmount: (fromAmount / rate).toFixed(2), rateUsed: rate, rateType: 'Sell Rate', formula: `${fromAmount.toLocaleString()} ${fromCode} ÷ ${rate}`, toCode: toCode };
        }
    }, [amount, fromCurrency, toCurrency, foundRate, currencies]);


    const handleSwap = () => {
        const temp = fromCurrency;
        setFromCurrency(toCurrency);
        setToCurrency(temp);
    };

    // --- Form Submission ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!foundRate || isSubmitting) return;

        setIsSubmitting(true);
        try {
            // THE FIX IS HERE: We now include the tellerId from the props in the submission data.
            await onSubmit({
                tellerId: tellerId, // This line was missing
                fromCurrencyId: parseInt(fromCurrency),
                toCurrencyId: parseInt(toCurrency),
                fromAmount: parseFloat(amount),
                exchangeRateId: foundRate.id,
            });
            // Reset form on success
            setFromCurrency('');
            setToCurrency('');
            setAmount('');
        } catch (err) {
            // Error is already shown by toast in the parent component
        } finally {
            setIsSubmitting(false);
        }
    };

    const isButtonDisabled = !foundRate || !amount || parseFloat(amount) <= 0 || isLoading || isSubmitting;

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">New Transaction</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
                {/* From Currency */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">From Currency</label>
                    <select value={fromCurrency} onChange={(e) => setFromCurrency(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" required>
                        <option value="">Select currency...</option>
                        {currencies.map(c => <option key={c.id} value={c.id}>{c.code} - {c.name}</option>)}
                    </select>
                </div>

                {/* Amount */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Amount to Exchange</label>
                    <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="100" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" required />
                </div>

                {/* Swap Button */}
                <div className="flex justify-center py-2">
                    <button type="button" onClick={handleSwap} className="p-2 rounded-full hover:bg-gray-100">
                        <ArrowPathIcon className="h-5 w-5 text-gray-500" />
                    </button>
                </div>

                {/* To Currency */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">To Currency</label>
                    <select value={toCurrency} onChange={(e) => setToCurrency(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" required >
                        <option value="">Select currency...</option>
                        {currencies.map(c => <option key={c.id} value={c.id}>{c.code} - {c.name}</option>)}
                    </select>
                </div>

                {/* Dynamic Info & Error Display */}
                <div className="min-h-[6rem] bg-gray-50 p-3 rounded-lg flex items-center justify-center text-center">
                    {error && <p className="text-red-600 text-sm">{error}</p>}
                    {foundRate && exchangeResult.toAmount > 0 && (
                        <div>
                            <p className="text-gray-700">You will receive approx.{' '} <span className="font-bold text-lg text-green-700">{parseFloat(exchangeResult.toAmount).toLocaleString()} {exchangeResult.toCode}</span></p>
                            <div className="text-xs text-gray-500 mt-1">
                                <span>{exchangeResult.rateType} @ {exchangeResult.rateUsed}</span><span className="mx-2">|</span><span className="font-mono bg-gray-200 px-1 py-0.5 rounded">{exchangeResult.formula}</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Submit Button */}
                <button type="submit" disabled={isButtonDisabled} className="w-full py-3 px-4 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 disabled:bg-gray-400 disabled:opacity-75 disabled:cursor-not-allowed">
                    {isSubmitting ? 'Processing...' : 'Complete Exchange'}
                </button>
            </form>
        </div>
    );
};

export default TransactionForm;