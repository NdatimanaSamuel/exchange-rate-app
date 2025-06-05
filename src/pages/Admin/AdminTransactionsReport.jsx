import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TableContainer } from '../../components/Reusable';
import Sidebar from '../../components/SidebarMenu';
import Header from '../../components/Header';
import axios from 'axios';
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ArrowLongRightIcon } from '@heroicons/react/24/solid';

const AdminTransactionsReport = () => {
    const navigate = useNavigate();
    
    const [transactions, setTransactions] = useState([]);
    const [tellers, setTellers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedTellerId, setSelectedTellerId] = useState('all');

    // --- NEW: Simplified and Corrected Data Fetching Logic ---
    useEffect(() => {
        let isMounted = true; // Prevent state updates on unmounted component
        const source = axios.CancelToken.source();

        const fetchAllData = async () => {
            setIsLoading(true);
            const token = localStorage.getItem('token');
            if (!token) { navigate('/login'); return; }
            const config = { headers: { 'Authorization': `Bearer ${token}` }, cancelToken: source.token };

            try {
                // Step 1: Always fetch the list of tellers (only happens once if not already fetched)
                if (tellers.length === 0) {
                    const tellersRes = await axios.get('http://localhost:7000/api/v1/auth/users', config);
                    if (isMounted) setTellers(tellersRes.data || []);
                }

                // Step 2: Determine URL and fetch the relevant transactions
                const transactionsUrl = selectedTellerId === 'all'
                    ? 'http://localhost:7000/api/v1/transactions/admin/transactions/today/all'
                    : `http://localhost:7000/api/v1/transactions/admin/transactions/today/${selectedTellerId}`;
                
                const transactionsRes = await axios.get(transactionsUrl, config);
                if (isMounted) setTransactions(transactionsRes.data || []);

            } catch (error) {
                if (!axios.isCancel(error)) {
                    toast.error(error.response?.data?.message || "Failed to fetch data.");
                }
            } finally {
                if (isMounted) setIsLoading(false);
            }
        };

        fetchAllData();

        // Cleanup function to cancel requests if component unmounts
        return () => {
            isMounted = false;
            source.cancel("Component unmounted");
        };
    // The dependency array now correctly triggers a refetch ONLY when the filter changes.
    }, [selectedTellerId, navigate, tellers.length]);


    const formatValue = (amount) => parseFloat(amount).toLocaleString('en-US', { minimumFractionDigits: 2 });
    const formatDate = (date) => new Date(date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    return (
        <>
            <ToastContainer />
            <div className="flex h-screen bg-gray-100 font-sans">
                <Sidebar />
                <div className="flex-1 flex flex-col">
                    <Header />
                    <main className="flex-1 p-4 sm:p-8 overflow-y-auto">
                        <TableContainer title="Today's Transactions Report">
                            <div className="flex items-center space-x-4 p-4 bg-gray-50 border-b">
                                <label htmlFor="tellerFilter" className="text-sm font-semibold text-gray-600">Filter by Teller:</label>
                                <select
                                    id="tellerFilter"
                                    value={selectedTellerId}
                                    onChange={(e) => setSelectedTellerId(e.target.value)}
                                    className="px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                                >
                                    <option value="all">All Tellers</option>
                                    {tellers.map(teller => (
                                        <option key={teller.id} value={teller.id}>{teller.names}</option>
                                    ))}
                                </select>
                            </div>
                            <table className="w-full text-sm text-left text-gray-500">
                                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3">Time</th>
                                        <th scope="col" className="px-6 py-3">Teller</th>
                                        <th scope="col" className="px-6 py-3">Transaction Details</th>
                                        <th scope="col" className="px-6 py-3 text-right">Profit (RWF)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {isLoading ? (
                                        <tr><td colSpan="4" className="text-center p-6">Loading...</td></tr>
                                    ) : transactions.length > 0 ? (
                                        transactions.map((tx) => (
                                            <tr key={tx.id} className="bg-white border-b hover:bg-gray-50">
                                                <td className="px-6 py-4">{formatDate(tx.createdAt)}</td>
                                                <td className="px-6 py-4 font-medium text-gray-900">{tx.user?.names}</td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center space-x-2">
                                                        <span className="font-semibold text-red-600">- {formatValue(tx.fromAmount)} {tx.fromCurrency.code}</span>
                                                        <ArrowLongRightIcon className="h-5 w-5 text-gray-400"/>
                                                        <span className="font-semibold text-green-600">+ {formatValue(tx.toAmount)} {tx.toCurrency.code}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right font-medium text-green-700">{formatValue(tx.profit)}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr><td colSpan="4" className="px-6 py-4 text-center text-gray-500">No transactions found for the selected filter.</td></tr>
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
export default AdminTransactionsReport;