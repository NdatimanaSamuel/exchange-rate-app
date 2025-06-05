/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/SidebarMenu';
import Header from '../../components/Header';
import axios from 'axios';
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FormCard, PrimaryButton } from '../../components/Reusable';

const AssignCashPage = () => {
    // State for the form
    const [formData, setFormData] = useState({
        userId: '',
        currencyId: '',
        initialAmount: '',
    });

    // State to hold the lists for our dropdowns
    const [tellers, setTellers] = useState([]);
    const [currencies, setCurrencies] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isDataLoading, setIsDataLoading] = useState(true); // For fetching initial data
    const navigate = useNavigate();

    // Fetch both tellers and currencies when the component mounts
    useEffect(() => {
        const fetchDataForDropdowns = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                toast.error('Authentication error.');
                navigate('/login');
                return;
            }
            const config = { headers: { 'Authorization': `Bearer ${token}` } };
            
            try {
                const [tellersRes, currenciesRes] = await Promise.all([
                    axios.get('http://localhost:7000/api/v1/auth/users', config),
                    axios.get('http://localhost:7000/api/v1/currency/view', config)
                ]);
                
                setTellers(tellersRes.data || []);
                setCurrencies(currenciesRes.data || []);
            } catch (error) {
                toast.error("Failed to load required data (tellers or currencies).");
            } finally {
                setIsDataLoading(false);
            }
        };

        fetchDataForDropdowns();
    }, [navigate]);

    const handleChange = (e) => {
        setFormData(prevState => ({ ...prevState, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.userId || !formData.currencyId || !formData.initialAmount) {
            toast.warn("Please fill out all fields.");
            return;
        }

        const token = localStorage.getItem('token');
        setIsLoading(true);
        
        const API_URL = 'http://localhost:7000/api/v1/teller/assign-cash/';
        const config = { headers: { 'Authorization': `Bearer ${token}` } };
        
        // ====================================================================
        // THE FIX IS HERE: Convert string values to numbers before sending
        // ====================================================================
        const payload = {
            userId: parseInt(formData.userId, 10), // Convert to integer
            currencyId: parseInt(formData.currencyId, 10), // Convert to integer
            initialAmount: parseFloat(formData.initialAmount) // Convert to float (handles decimals)
        };
        
        console.log('Submitting CORRECTED payload:', payload);

        try {
            const response = await axios.post(API_URL, payload, config);

            toast.success(response.data?.message || 'Cash assigned successfully!');
            setTimeout(() => navigate('/teller-balances'), 2000);
        } catch (error) {
            // Now this will show the *real* error message from the backend if there is one
            toast.error(error.response?.data?.message || 'Failed to assign cash.');
        } finally {
            setIsLoading(false);
        }
    };

    if (isDataLoading) {
        return <div className="text-center p-10">Loading form data...</div>;
    }

    return (
        <>
            <ToastContainer />
            <div className="flex h-screen bg-gray-100 font-sans">
                <Sidebar />
                <div className="flex-1 flex flex-col">
                    <Header />
                    <main className="flex-1 p-4 sm:p-8 overflow-y-auto">
                        <FormCard title="Assign Cash to Teller">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label htmlFor="userId" className="block text-sm font-medium text-gray-700">Select Teller</label>
                                    <select id="userId" name="userId" value={formData.userId} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
                                        <option value="" disabled>-- Choose a teller --</option>
                                        {tellers.map(teller => (
                                            <option key={teller.id} value={teller.id}>{teller.names} ({teller.email})</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="currencyId" className="block text-sm font-medium text-gray-700">Select Currency</label>
                                    <select id="currencyId" name="currencyId" value={formData.currencyId} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
                                        <option value="" disabled>-- Choose a currency --</option>
                                        {currencies.map(currency => (
                                            <option key={currency.id} value={currency.id}>{currency.name} ({currency.code})</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="initialAmount" className="block text-sm font-medium text-gray-700">Initial Amount</label>
                                    <input type="number" id="initialAmount" name="initialAmount" value={formData.initialAmount} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" placeholder="e.g., 1000" />
                                </div>
                                <div className="flex justify-end pt-2">
                                    <PrimaryButton type="submit" disabled={isLoading}>
                                        {isLoading ? 'Assigning...' : 'Assign Cash'}
                                    </PrimaryButton>
                                </div>
                            </form>
                        </FormCard>
                    </main>
                </div>
            </div>
        </>
    );
};

export default AssignCashPage;