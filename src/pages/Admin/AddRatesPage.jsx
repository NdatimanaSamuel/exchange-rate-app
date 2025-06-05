import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/SidebarMenu';
import Header from '../../components/Header';
import axios from 'axios';
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FormCard, FormInput, PrimaryButton } from '../../components/Reusable';

const AddRatePage = () => {
    // State to hold the rate form data
    const [formData, setFormData] = useState({
        base: '',
        target: '',
        buyRate: '',
        sellRate: '',
        provider: '',
    });

    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    // A single handler to update the form data state
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
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

        const API_URL = 'http://localhost:7000/api/v1/rate/add';
        const config = {
            headers: { 'Authorization': `Bearer ${token}` }
        };

        try {
            // The API expects numbers for rates, so convert them from strings
            const payload = {
                ...formData,
                buyRate: parseFloat(formData.buyRate),
                sellRate: parseFloat(formData.sellRate)
            };
            
            const response = await axios.post(API_URL, payload, config);

            const successMessage = response.data?.message || 'Rate added successfully!';
            toast.success(successMessage);
            
            // Navigate to the view rates page after success
            setTimeout(() => {
                navigate('/view-rates'); 
            }, 2000);

        } catch (error) {
            const errorMessage = error.response?.data?.message || 'An unexpected error occurred. Please try again.';
            toast.error(errorMessage);

            if (error.response?.status === 401 || error.response?.status === 403) {
                setTimeout(() => {
                    navigate('/login');
                }, 3000);
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
                        <FormCard title="Add New Exchange Rate">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                
                                <FormInput 
                                    label="Base Currency" 
                                    name="base"
                                    value={formData.base}
                                    onChange={handleChange}
                                    placeholder="e.g., USD" 
                                    required 
                                />
                                
                                <FormInput 
                                    label="Target Currency" 
                                    name="target"
                                    value={formData.target}
                                    onChange={handleChange}
                                    placeholder="e.g., EUR" 
                                    required 
                                />

                                <FormInput 
                                    label="Buy Rate" 
                                    type="number" // Use type="number" for rates
                                    step="any" // Allow decimals
                                    name="buyRate"
                                    value={formData.buyRate}
                                    onChange={handleChange}
                                    placeholder="e.g., 1.0825" 
                                    required 
                                />

                                <FormInput 
                                    label="Sell Rate" 
                                    type="number"
                                    step="any"
                                    name="sellRate"
                                    value={formData.sellRate}
                                    onChange={handleChange}
                                    placeholder="e.g., 1.1025"
                                    required 
                                />

                                <FormInput 
                                    label="Provider" 
                                    name="provider"
                                    value={formData.provider}
                                    onChange={handleChange}
                                    placeholder="e.g., fixer, an external API name"
                                    required 
                                />

                                <div className="flex justify-end pt-2">
                                    <PrimaryButton type="submit" disabled={isLoading}>
                                        {isLoading ? 'Adding...' : 'Add Rate'}
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

export default AddRatePage;