import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TableContainer } from '../../components/Reusable';
import Header from '../../components/Header';
import axios from 'axios';
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import TellerSidebar from '../../components/TellerSideBarMenu';

const MyBalancesPage = () => {
    const navigate = useNavigate();
    
    // State to hold balances fetched from the API
    const [balances, setBalances] = useState([]);
    // State to hold total profit for today
    const [totalProfit, setTotalProfit] = useState(0);
    // Loading state for the page
    const [isLoading, setIsLoading] = useState(true);
    // State to toggle the date filter
    const [filterToday, setFilterToday] = useState(true); // Default to showing today's balances

    useEffect(() => {
        const fetchTellerData = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                toast.error("Authentication required.");
                navigate('/login');
                return;
            }
            const config = { headers: { 'Authorization': `Bearer ${token}` } };
            
            try {
                // We will fetch today's balances and today's total profit
                // This is more efficient for the default view.
                const [balancesRes, profitRes] = await Promise.all([
                    axios.get('http://localhost:7000/api/v1/transactions/my-today-balances', config),
                    axios.get('http://localhost:7000/api/v1/transactions/my-today-profit', config)
                ]);

                setBalances(balancesRes.data || []);
                setTotalProfit(profitRes.data?.totalProfit || 0);

            } catch (error) {
                // If there's no balance for today, the API sends a 404, which is expected.
                if (error.response && error.response.status === 404) {
                    // It's not an error, just means no cash was assigned today.
                    setBalances([]);
                    setTotalProfit(0);
                } else {
                    toast.error(error.response?.data?.message || "Failed to load your data.");
                }
            } finally {
                setIsLoading(false);
            }
        };

        // TODO: Implement fetching all historical balances when filter is toggled off
        // For now, this hook will only fetch today's data as per the new design.
        fetchTellerData();

    }, [navigate]); // The dependency array ensures this runs once on load

    // --- Helper Functions for Display ---
    const formatCurrency = (amount, symbol) => {
        // Use Intl.NumberFormat for robust, locale-aware currency formatting
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: symbol || 'USD', // Fallback currency
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);
    };

    const formatDate = (dateString) => new Date(dateString).toLocaleString();

    // The main table content will now be the `balances` state directly.
    // The filter will be implemented later if historical view is needed.

    if (isLoading) {
        return <div className="text-center p-10">Loading Your Balances...</div>;
    }

    return (
        <>
            <ToastContainer />
            <div className="flex h-screen bg-gray-100 font-sans">
                <TellerSidebar />
                <div className="flex-1 flex flex-col">
                    <Header />
                    <main className="flex-1 p-4 sm:p-8 overflow-y-auto">
                        <TableContainer 
                            title="My Daily Balances & Profit" 
                            // Tellers don't assign cash to themselves, so the button is removed.
                        >
                            {/* Filter and Profit Summary Section */}
                            <div className="flex justify-between items-center space-x-4 p-4 bg-gray-50 border-b">
                                <div>
                                    <span className="text-sm font-semibold text-gray-600">Filter:</span>
                                    <button 
                                        onClick={() => setFilterToday(!filterToday)} 
                                        className={`ml-2 px-3 py-1 text-sm rounded-full ${filterToday ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                                        // TODO: The onClick will need to trigger a new API call for historical data
                                    >
                                        {filterToday ? "Showing Today's Balances" : "Showing All Balances"}
                                    </button>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-gray-600">Today's Total Profit</p>
                                    <p className="text-lg font-bold text-green-600">{formatCurrency(totalProfit, 'RWF')}</p> 
                                    {/* Assuming profit is in RWF, adjust as needed */}
                                </div>
                            </div>

                            <table className="w-full text-sm text-left text-gray-500">
                                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3">Currency</th>
                                        <th scope="col" className="px-6 py-3">Initial (Morning)</th>
                                        <th scope="col" className="px-6 py-3">Current Balance</th>
                                        <th scope="col" className="px-6 py-3">Profit/Loss (Today)</th>
                                        <th scope="col" className="px-6 py-3">Date Assigned</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {balances.length > 0 ? (
                                        balances.map((balance) => {
                                            // Calculate the profit/loss for this specific currency
                                            const currencyProfit = parseFloat(balance.currentAmount) - parseFloat(balance.initialAmount);
                                            const isProfit = currencyProfit >= 0;

                                            return (
                                                <tr key={balance.id} className="bg-white border-b hover:bg-gray-50">
                                                    <td className="px-6 py-4 font-bold text-gray-900">{balance.currency?.code}</td>
                                                    <td className="px-6 py-4 text-gray-600">{formatCurrency(balance.initialAmount, balance.currency?.code)}</td>
                                                    <td className="px-6 py-4 font-bold text-blue-700">{formatCurrency(balance.currentAmount, balance.currency?.code)}</td>
                                                    
                                                    {/* Profit/Loss Column */}
                                                    <td className={`px-6 py-4 font-semibold ${isProfit ? 'text-green-600' : 'text-red-600'}`}>
                                                        {isProfit ? '+' : ''}{formatCurrency(currencyProfit, balance.currency?.code)}
                                                    </td>

                                                    <td className="px-6 py-4">{formatDate(balance.createdAt)}</td>
                                                </tr>
                                            );
                                        })
                                    ) : (
                                        <tr><td colSpan="5" className="px-6 py-4 text-center text-gray-500">No cash assigned for today.</td></tr>
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

export default MyBalancesPage;