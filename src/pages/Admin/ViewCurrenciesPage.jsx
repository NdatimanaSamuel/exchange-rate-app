import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TableContainer } from '../../components/Reusable';
import { PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';
import Sidebar from '../../components/SidebarMenu';
import Header from '../../components/Header';
import axios from 'axios';
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FormInput, PrimaryButton } from '../../components/Reusable';

// ====================================================================
// Reusable Update Modal for Currencies
// ====================================================================
const UpdateCurrencyModal = ({ isOpen, onClose, onUpdate, currency }) => {
    const [formData, setFormData] = useState({ code: '', name: '', symbol: '' });

    // When the `currency` prop changes (i.e., when the modal is opened), populate the form
    useEffect(() => {
        if (currency) {
            setFormData({
                code: currency.code || '',
                name: currency.name || '',
                symbol: currency.symbol || '',
            });
        }
    }, [currency]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: name === 'code' ? value.toUpperCase() : value }));
    };

    const handleUpdateClick = () => {
        // Pass the updated data and the currency ID back to the parent
        onUpdate(currency.id, formData);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Update Currency</h3>
                <div className="space-y-4">
                    <FormInput label="Currency Code" name="code" value={formData.code} onChange={handleChange} maxLength="3" required />
                    <FormInput label="Currency Name" name="name" value={formData.name} onChange={handleChange} required />
                    <FormInput label="Currency Symbol" name="symbol" value={formData.symbol} onChange={handleChange} required />
                </div>
                <div className="flex justify-end gap-4 mt-6">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancel</button>
                    <PrimaryButton onClick={handleUpdateClick}>Save Changes</PrimaryButton>
                </div>
            </div>
        </div>
    );
};

const ViewCurrenciesPage = () => {
    const navigate = useNavigate();
    const [currencies, setCurrencies] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCurrency, setSelectedCurrency] = useState(null);

    useEffect(() => {
        const fetchCurrencies = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                toast.error('Authentication error. Please log in again.');
                setIsLoading(false);
                navigate('/login');
                return;
            }

            const API_URL = 'http://localhost:7000/api/v1/currency/view';
            const config = { headers: { 'Authorization': `Bearer ${token}` } };

            try {
                const response = await axios.get(API_URL, config);
                setCurrencies(response.data || []);
            } catch (error) {
                toast.error(error.response?.data?.message || 'Failed to fetch currencies.');
                if (error.response?.status === 401) navigate('/login');
            } finally {
                setIsLoading(false);
            }
        };

        fetchCurrencies();
    }, [navigate]);

    const openUpdateModal = (currency) => {
        setSelectedCurrency(currency);
        setIsModalOpen(true);
    };

    const handleUpdate = async (currencyId, updatedData) => {
        const token = localStorage.getItem('token');
        const API_URL = `http://localhost:7000/api/v1/currency/update/${currencyId}`;
        const config = { headers: { 'Authorization': `Bearer ${token}` } };
        
        try {
            await axios.put(API_URL, updatedData, config);
            
            setCurrencies(currencies.map(c => 
                c.id === currencyId ? { ...c, ...updatedData } : c
            ));
            
            toast.success("Currency updated successfully!");
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to update currency.");
        } finally {
            setIsModalOpen(false);
            setSelectedCurrency(null);
        }
    };
    
    const formatDate = (dateString) => new Date(dateString).toLocaleDateString();

    if (isLoading) {
        return <div className="text-center p-10">Loading Currencies...</div>;
    }

    return (
        <>
            <ToastContainer />
            <div className="flex h-screen bg-gray-100 font-sans">
                <Sidebar />
                <div className="flex-1 flex flex-col">
                    <Header />
                    <main className="flex-1 p-4 sm:p-8 overflow-y-auto">
                        <TableContainer 
                            title="All Currencies" 
                            buttonText="Add New Currency" 
                            onButtonClick={() => navigate('/add-currency')}
                        >
                            <table className="w-full text-sm text-left text-gray-500">
                                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3">Code</th>
                                        <th scope="col" className="px-6 py-3">Name</th>
                                        <th scope="col" className="px-6 py-3">Symbol</th>
                                        <th scope="col" className="px-6 py-3">Date Added</th>
                                        <th scope="col" className="px-6 py-3 text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currencies.length > 0 ? (
                                        currencies.map((currency) => (
                                            <tr key={currency.id} className="bg-white border-b hover:bg-gray-50">
                                                <td className="px-6 py-4 font-medium text-gray-900">{currency.code}</td>
                                                <td className="px-6 py-4">{currency.name}</td>
                                                <td className="px-6 py-4">{currency.symbol}</td>
                                                <td className="px-6 py-4">{formatDate(currency.createdAt)}</td>
                                                <td className="px-6 py-4 flex justify-center items-center gap-2">
                                                    <button onClick={() => openUpdateModal(currency)} className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-800"><PencilSquareIcon className="h-4 w-4"/> Edit</button>
                                                    <button className="flex items-center gap-1 text-sm font-medium text-red-600 hover:text-red-800"><TrashIcon className="h-4 w-4"/> Delete</button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr className="bg-white border-b">
                                            <td colSpan="5" className="px-6 py-4 text-center text-gray-500">No currencies found.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </TableContainer>
                    </main>
                </div>
            </div>
            <UpdateCurrencyModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onUpdate={handleUpdate}
                currency={selectedCurrency}
            />
        </>
    );
}
export default ViewCurrenciesPage;