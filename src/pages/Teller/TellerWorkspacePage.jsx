/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import TellerSidebar from '../../components/TellerSideBarMenu';
import Header from '../../components/Header';
import axios from 'axios';
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { StatCard } from '../../components/Reusable';
import { ArrowPathIcon, BanknotesIcon, CircleStackIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';
import TransactionForm from '../../components/TransactionForm'; // We will create this
import TransactionsTable from '../../components/TransactionsTable'; // We will create this

// Helper Component for Displaying Balances
const BalanceDisplay = ({ balances, isLoading }) => (
    <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <CircleStackIcon className="h-6 w-6 text-gray-500" />
            Your Current Balances
        </h3>
        {isLoading ? (
            <p className="text-gray-500">Loading balances...</p>
        ) : balances.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {balances.map(balance => (
                    <div key={balance.currency.id} className="bg-gray-50 p-3 rounded-md text-center">
                        <p className="font-bold text-gray-700 text-lg">{balance.currency.code}</p>
                        <p className="text-sm text-gray-500">{parseFloat(balance.currentAmount).toLocaleString()}</p>
                    </div>
                ))}
            </div>
        ) : (
            <p className="text-gray-500">No balances found.</p>
        )}
    </div>
);

const TellerWorkspacePage = () => {
    const navigate = useNavigate();
    // Assuming the user object with ID is stored in localStorage after login
    const [teller, setTeller] = useState(null);

    // State for all our data
    const [balances, setBalances] = useState([]);
    const [profit, setProfit] = useState(0);
    const [transactions, setTransactions] = useState([]);
    const [currencies, setCurrencies] = useState([]);
    const [rates, setRates] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // Get teller info from storage
    useEffect(() => {
        try {
            const storedUser = JSON.parse(localStorage.getItem('user'));
            if (storedUser && storedUser.id) {
                setTeller(storedUser);
            } else {
                toast.error("Teller information not found. Please log in again.");
                navigate('/login');
            }
        } catch (error) {
            toast.error("Failed to read user data. Please log in again.");
            navigate('/login');
        }
    }, [navigate]);

    // Main data fetching function
    const fetchData = useCallback(async () => {
        if (!teller) return;
        setIsLoading(true);
        const token = localStorage.getItem('token');
        const config = { headers: { 'Authorization': `Bearer ${token}` } };
        
        try {
            // Fetch all data concurrently for speed
            const [balanceRes, profitRes, transactionsRes, currenciesRes, ratesRes] = await Promise.all([
                axios.get(`http://localhost:7000/api/v1/transactions/my-today-balances`, config),
                axios.get(`http://localhost:7000/api/v1/transactions/my-today-profit`, config),
                axios.get(`http://localhost:7000/api/v1/transactions/my-today-transactions`, config),
                axios.get('http://localhost:7000/api/v1/currency/view', config),
                axios.get('http://localhost:7000/api/v1/rate/view', config),
            ]);

            setBalances(balanceRes.data || []);
            setProfit(profitRes.data?.totalProfit || 0);
            setTransactions(transactionsRes.data || []);
            setCurrencies(currenciesRes.data || []);
            // Filter for only active rates to be used in the form
            setRates((ratesRes.data || []).filter(rate => rate.isActive));

        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to load workspace data.");
            if (error.response?.status === 401) navigate('/login');
        } finally {
            setIsLoading(false);
        }
    }, [teller, navigate]);

    // Fetch data when the teller info is available
    useEffect(() => {
        if (teller) {
            fetchData();
        }
    }, [teller, fetchData]);


    // Function to handle new transaction submission
    const handleCreateTransaction = async (transactionData) => {
        const token = localStorage.getItem('token');
        const config = { headers: { 'Authorization': `Bearer ${token}` } };
        const API_URL = 'http://localhost:7000/api/v1/transactions/create';

        try {
            await axios.post(API_URL, transactionData, config);
            toast.success("Transaction completed successfully!");
            // Refresh all data to show the latest state
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.message || "Transaction failed.");
            throw error; // Re-throw error to be caught in the form component
        }
    };
    
    return (
        <>
            <ToastContainer />
            <div className="flex h-screen bg-gray-100 font-sans">
                <TellerSidebar />
                <div className="flex-1 flex flex-col">
                    <Header />
                    <main className="flex-1 p-4 sm:p-8 overflow-y-auto">
                        <div className="space-y-8">
                            {/* --- TOP STATS SECTION --- */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <h2 className="text-2xl font-bold text-gray-800 md:col-span-2 lg:col-span-1 self-center">
                                    Teller Workspace
                                </h2>
                                <StatCard 
                                    title="Today's Profit" 
                                    value={isLoading ? '...' : `$${parseFloat(profit).toFixed(2)}`} 
                                    icon={BanknotesIcon} 
                                    color="green" 
                                />
                                {/* Add other top-level stats if you want */}
                                <div className="lg:col-start-4 flex justify-end items-center">
                                    <button onClick={fetchData} disabled={isLoading} className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 rounded-lg shadow-sm hover:bg-gray-50 disabled:opacity-50">
                                        <ArrowPathIcon className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
                                        Refresh
                                    </button>
                                </div>
                            </div>
                            
                            {/* --- BALANCES SECTION --- */}
                            <BalanceDisplay balances={balances} isLoading={isLoading} />
                            
                            {/* --- MAIN WORK AREA --- */}
                            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                                <div className="lg:col-span-2">
                                    <TransactionForm 
                                        tellerId={teller?.id}
                                        currencies={currencies}
                                        rates={rates}
                                        balances={balances}
                                        onSubmit={handleCreateTransaction}
                                        isLoading={isLoading}
                                    />
                                </div>
                                <div className="lg:col-span-3">
                                    <TransactionsTable transactions={transactions} isLoading={isLoading} />
                                </div>
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        </>
    );
};

export default TellerWorkspacePage;