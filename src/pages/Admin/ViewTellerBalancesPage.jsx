/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TableContainer } from '../../components/Reusable';
import { PencilSquareIcon } from '@heroicons/react/24/outline';
import Sidebar from '../../components/SidebarMenu';
import Header from '../../components/Header';
import axios from 'axios';
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { PrimaryButton } from '../../components/Reusable';

// Update Modal Component (can be in the same file or imported)
const UpdateBalanceModal = ({ isOpen, onClose, onUpdate, balance, tellers, currencies }) => {
    const [formData, setFormData] = useState({ userId: '', currencyId: '', initialAmount: '' });

    useEffect(() => {
        if (balance) {
            setFormData({
                userId: balance.userId || '',
                currencyId: balance.currencyId || '',
                initialAmount: balance.initialAmount || '',
            });
        }
    }, [balance]);

    if (!isOpen) return null;

    const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

    const handleUpdateClick = () => {
        onUpdate(balance.id, { ...formData, initialAmount: parseFloat(formData.initialAmount) });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Update Assigned Cash</h3>
                <div className="space-y-4">
                    {/* In a real scenario, you might want to disable these if they cannot be changed */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Teller</label>
                        <select name="userId" value={formData.userId} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-gray-100 rounded-md shadow-sm" disabled>
                            {tellers.map(t => <option key={t.id} value={t.id}>{t.names}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Currency</label>
                        <select name="currencyId" value={formData.currencyId} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-gray-100 rounded-md shadow-sm" disabled>
                            {currencies.map(c => <option key={c.id} value={c.id}>{c.code}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Initial Amount</label>
                        <input type="number" name="initialAmount" value={formData.initialAmount} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"/>
                    </div>
                </div>
                <div className="flex justify-end gap-4 mt-6">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancel</button>
                    <PrimaryButton onClick={handleUpdateClick}>Save Changes</PrimaryButton>
                </div>
            </div>
        </div>
    );
};


const ViewTellerBalancesPage = () => {
    const navigate = useNavigate();
    const [allBalances, setAllBalances] = useState([]);
    const [tellers, setTellers] = useState([]); // Needed for the modal
    const [currencies, setCurrencies] = useState([]); // Needed for the modal
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedBalance, setSelectedBalance] = useState(null);
    const [filterToday, setFilterToday] = useState(false);

    useEffect(() => {
        const fetchAllData = async () => {
            const token = localStorage.getItem('token');
            if (!token) { navigate('/login'); return; }
            const config = { headers: { 'Authorization': `Bearer ${token}` } };
            
            try {
                const [balancesRes, tellersRes, currenciesRes] = await Promise.all([
                    axios.get('http://localhost:7000/api/v1/teller/balance', config),
                    axios.get('http://localhost:7000/api/v1/auth/users', config),
                    axios.get('http://localhost:7000/api/v1/currency/view', config)
                ]);
                setAllBalances(balancesRes.data || []);
                setTellers(tellersRes.data || []);
                setCurrencies(currenciesRes.data || []);
            } catch (error) {
                toast.error("Failed to load page data.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchAllData();
    }, [navigate]);

    const handleUpdate = async (balanceId, updatedData) => {
        const token = localStorage.getItem('token');
        const API_URL = `http://localhost:7000/api/v1/teller/${balanceId}/update-balance`;
        const config = { headers: { 'Authorization': `Bearer ${token}` } };
        
        try {
            await axios.put(API_URL, updatedData, config);
            setAllBalances(allBalances.map(b => (b.id === balanceId ? { ...b, ...updatedData, user: b.user, currency: b.currency } : b)));
            toast.success("Balance updated successfully!");
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to update balance.");
        } finally {
            setIsModalOpen(false);
        }
    };
    
    // Format numbers with commas
    const formatCurrency = (amount) => parseFloat(amount).toLocaleString('en-US');
    const formatDate = (dateString) => new Date(dateString).toLocaleString();

    const displayedBalances = allBalances.filter(balance => {
        if (filterToday) {
            const assignmentDate = new Date(balance.createdAt).toDateString();
            const today = new Date().toDateString();
            return assignmentDate === today;
        }
        return true;
    });

    if (isLoading) {
        return <div className="text-center p-10">Loading Balances...</div>;
    }

    return (
        <>
            <ToastContainer />
            <div className="flex h-screen bg-gray-100 font-sans">
                <Sidebar />
                <div className="flex-1 flex flex-col">
                    <Header />
                    <main className="flex-1 p-4 sm:p-8 overflow-y-auto">
                        <TableContainer title="Teller Balances" buttonText="Assign New Cash" onButtonClick={() => navigate('/assign-cash')}>
                            <div className="flex items-center space-x-4 p-4 bg-gray-50 border-b">
                                <span className="text-sm font-semibold text-gray-600">Filter:</span>
                                <button onClick={() => setFilterToday(!filterToday)} className={`px-3 py-1 text-sm rounded-full ${filterToday ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}>
                                    {filterToday ? "Showing Today's Assignments" : "Showing All"}
                                </button>
                            </div>
                            <table className="w-full text-sm text-left text-gray-500">
                                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3">Teller</th>
                                        <th scope="col" className="px-6 py-3">Currency</th>
                                        <th scope="col" className="px-6 py-3">Initial Amount</th>
                                        <th scope="col" className="px-6 py-3">Current Amount</th>
                                        <th scope="col" className="px-6 py-3">Date Assigned</th>
                                        <th scope="col" className="px-6 py-3 text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {displayedBalances.length > 0 ? (
                                        displayedBalances.map((balance) => (
                                            <tr key={balance.id} className="bg-white border-b hover:bg-gray-50">
                                                <td className="px-6 py-4 font-medium text-gray-900">{balance.user?.names}</td>
                                                <td className="px-6 py-4">{balance.currency?.code}</td>
                                                <td className="px-6 py-4">{balance.currency?.symbol} {formatCurrency(balance.initialAmount)}</td>
                                                <td className="px-6 py-4 font-bold text-blue-600">{balance.currency?.symbol} {formatCurrency(balance.currentAmount)}</td>
                                                <td className="px-6 py-4">{formatDate(balance.createdAt)}</td>
                                                <td className="px-6 py-4 flex justify-center">
                                                    <button onClick={() => { setSelectedBalance(balance); setIsModalOpen(true); }} className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-800"><PencilSquareIcon className="h-4 w-4"/> Update</button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr><td colSpan="6" className="px-6 py-4 text-center text-gray-500">No balances found for the selected filter.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </TableContainer>
                    </main>
                </div>
            </div>
            <UpdateBalanceModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onUpdate={handleUpdate} balance={selectedBalance} tellers={tellers} currencies={currencies}/>
        </>
    );
}
export default ViewTellerBalancesPage;