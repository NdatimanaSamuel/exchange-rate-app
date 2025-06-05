import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/SidebarMenu';
import Header from '../../components/Header';
import axios from 'axios';
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FormCard, FormInput, PrimaryButton } from '../../components/Reusable';

const AddCurrencyPage = () => {
    // State to hold the currency form data
    const [formData, setFormData] = useState({
        code: '',
        name: '',
        symbol: '',
    });

    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            // Convert currency code to uppercase automatically for consistency
            [name]: name === 'code' ? value.toUpperCase() : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        if (!token) {
            toast.error('Authentication error. Please log in again.');
            return;
        }

        setIsLoading(true);

        const API_URL = 'http://localhost:7000/api/v1/currency/add';
        const config = { headers: { 'Authorization': `Bearer ${token}` } };

        try {
            const response = await axios.post(API_URL, formData, config);
            const successMessage = response.data?.message || 'Currency added successfully!';
            toast.success(successMessage);
            
            // Navigate to the view currencies page after success
            setTimeout(() => {
                navigate('/view-currencies'); 
            }, 2000);

        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to add currency.';
            toast.error(errorMessage);
            if (error.response?.status === 401 || error.response?.status === 403) {
                navigate('/login');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <ToastContainer />
            <div className="flex h-screen bg-gray-100 font-sans">
                <Sidebar />
                <div className="flex-1 flex flex-col">
                    <Header />
                    <main className="flex-1 p-4 sm:p-8 overflow-y-auto">
                        <FormCard title="Add New Currency">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <FormInput 
                                    label="Currency Code" 
                                    name="code"
                                    value={formData.code}
                                    onChange={handleChange}
                                    placeholder="e.g., RWF, USD, EUR"
                                    maxLength="3" // Standard currency codes are 3 letters
                                    required 
                                />
                                <FormInput 
                                    label="Currency Name" 
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="e.g., Rwandan Franc" 
                                    required 
                                />
                                <FormInput 
                                    label="Currency Symbol" 
                                    name="symbol"
                                    value={formData.symbol}
                                    onChange={handleChange}
                                    placeholder="e.g., FRw, $" 
                                    required 
                                />
                                <div className="flex justify-end pt-2">
                                    <PrimaryButton type="submit" disabled={isLoading}>
                                        {isLoading ? 'Adding...' : 'Add Currency'}
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

export default AddCurrencyPage;