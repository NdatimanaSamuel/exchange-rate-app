import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { TableContainer } from '../../components/Reusable';
import Header from '../../components/Header';
import axios from 'axios';
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ArrowLongRightIcon } from '@heroicons/react/24/solid';
import TellerSidebar from '../../components/TellerSideBarMenu';

const TransactionHistoryPage = () => {
    const navigate = useNavigate();
    
    // State for the full, unfiltered list of transactions
    const [allTransactions, setAllTransactions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // --- NEW: State for filtering ---
    const [searchTerm, setSearchTerm] = useState('');
    const [filterDate, setFilterDate] = useState('');

    useEffect(() => {
        const fetchTransactionHistory = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                toast.error("Authentication required.");
                navigate('/login');
                return;
            }
            const config = { headers: { 'Authorization': `Bearer ${token}` } };
            
            try {
                // Assuming you have an endpoint that returns all transactions for the logged-in teller
                const response = await axios.get('http://localhost:7000/api/v1/transactions/my-today-transactions', config);
                // The API should ideally return transactions sorted by date descending
                setAllTransactions(response.data || []);
            } catch (error) {
                toast.error(error.response?.data?.message || "Failed to load transaction history.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchTransactionHistory();
    }, [navigate]);

    // --- NEW: Memoized filtering logic for performance ---
    // This calculates the filtered list only when the source data or filters change.
    const displayedTransactions = useMemo(() => {
        return allTransactions
            .filter(tx => {
                // Date filter logic
                if (!filterDate) return true;
                const txDate = new Date(tx.createdAt).toISOString().split('T')[0];
                return txDate === filterDate;
            })
            .filter(tx => {
                // Search term filter logic (checks both 'from' and 'to' currency codes)
                if (!searchTerm) return true;
                const term = searchTerm.toUpperCase();
                return tx.fromCurrency.code.includes(term) || tx.toCurrency.code.includes(term);
            });
    }, [allTransactions, filterDate, searchTerm]);


    // --- Helper Functions for Display ---
    const formatCurrencyValue = (amount) => parseFloat(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const formatDate = (dateString) => new Date(dateString).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });


    if (isLoading) {
        return <div className="text-center p-10">Loading Transaction History...</div>;
    }

    return (
        <>
            <ToastContainer />
            <div className="flex h-screen bg-gray-100 font-sans">
                <TellerSidebar />
                <div className="flex-1 flex flex-col">
                    <Header />
                    <main className="flex-1 p-4 sm:p-8 overflow-y-auto">
                        <TableContainer title="My Transaction History">
                            
                            {/* --- NEW: Advanced Filter Controls --- */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 border-b">
                                <div className="md:col-span-1">
                                    <label htmlFor="search" className="block text-sm font-medium text-gray-700">Search by Currency Code</label>
                                    <input
                                        type="text"
                                        id="search"
                                        placeholder="e.g., USD or RWF"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                                    />
                                </div>
                                <div className="md:col-span-1">
                                    <label htmlFor="date" className="block text-sm font-medium text-gray-700">Filter by Date</label>
                                    <input
                                        type="date"
                                        id="date"
                                        value={filterDate}
                                        onChange={(e) => setFilterDate(e.target.value)}
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                                    />
                                </div>
                                <div className="flex items-end">
                                    <button
                                        onClick={() => { setSearchTerm(''); setFilterDate(''); }}
                                        className="w-full h-10 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                                    >
                                        Clear Filters
                                    </button>
                                </div>
                            </div>

                            <table className="w-full text-sm text-left text-gray-500">
                                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3">Date & Time</th>
                                        <th scope="col" className="px-6 py-3">Transaction Details</th>
                                        <th scope="col" className="px-6 py-3">Rate Used</th>
                                        <th scope="col" className="px-6 py-3 text-right">Profit</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {displayedTransactions.length > 0 ? (
                                        displayedTransactions.map((tx) => (
                                            <tr key={tx.id} className="bg-white border-b hover:bg-gray-50">
                                                <td className="px-6 py-4">{formatDate(tx.createdAt)}</td>
                                                
                                                {/* --- NEW: Visual Transaction Flow Column --- */}
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center space-x-2">
                                                        <span className="font-semibold text-red-600">
                                                            - {formatCurrencyValue(tx.fromAmount)} {tx.fromCurrency.code}
                                                        </span>
                                                        <ArrowLongRightIcon className="h-5 w-5 text-gray-400"/>
                                                        <span className="font-semibold text-green-600">
                                                            + {formatCurrencyValue(tx.toAmount)} {tx.toCurrency.code}
                                                        </span>
                                                    </div>
                                                </td>
                                                
                                                <td className="px-6 py-4 text-gray-600">
                                                    @{formatCurrencyValue(tx.rate)}
                                                </td>
                                                
                                                <td className="px-6 py-4 text-right font-medium text-green-700">
                                                    {formatCurrencyValue(tx.profit)} {tx.toCurrency.code}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr><td colSpan="4" className="px-6 py-4 text-center text-gray-500">No transactions found matching your criteria.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </TableContainer>
                    </main>
                </div>
            </div>
        </>
    );
}

export default TransactionHistoryPage;