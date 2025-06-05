import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/SidebarMenu'; // I've renamed it Sidebar
import Header from '../../components/Header';
import axios from 'axios';
import {  toast,ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FormCard, FormInput, PrimaryButton } from '../../components/Reusable'; // Assuming Reusable.js is in components

const AddTellerPage = () => {
    // State to hold the form data
    const [formData, setFormData] = useState({
        names: '',
        email: '',
        phone: '',
        password: '',
    });

    // State to manage loading status during API call
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
// --- UPDATED handleSubmit FUNCTION ---
 // --- REVISED handleSubmit FUNCTION TO HANDLE YOUR SPECIFIC API RESPONSES ---
    const handleSubmit = async (e) => {
        e.preventDefault();

        const token = localStorage.getItem('token');
        if (!token) {
            toast.error('Authentication error. Please log in again.');
            return;
        }

        setIsLoading(true);

        const API_URL = 'http://localhost:7000/api/v1/auth/signup';
        const config = {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        };

        try {
            // Make the API call
            const response = await axios.post(API_URL, formData, config);

            // **1. Get the SUCCESS message from your API response**
            // Example: `{"message": "Account created successfully", ...}`
            const successMessage = response.data?.message || 'Teller added successfully!';
            toast.success(successMessage);
            
            // **2. Correct the navigation path**
            setTimeout(() => {
                navigate('/view-tellers');
            }, 2000); // 2 seconds is a good delay

        } catch (error) {
            // **3. Get the DYNAMIC ERROR message from your API response**
            // Example: `{"message": "Email or phone number already exists", ...}`
            // Or: `{"message": "Unauthorized", ...}`
            const errorMessage = error.response?.data?.message || 'An unexpected error occurred. Please try again.';

            toast.error(errorMessage);

            // Optional: You can still have special handling for 401/403 errors
            if (error.response?.status === 401 || error.response?.status === 403) {
                // This will show the "Unauthorized" message and then navigate
                setTimeout(() => {
                    navigate('/login'); // Force re-login
                }, 3000);
            }

        } finally {
            setIsLoading(false);
        }
    };

    return (
        // The component now ONLY returns the form card.
        // The Sidebar and Header are provided by the HomeAdmin layout.
        <>
         <ToastContainer/>
      
       
            <div className="flex h-screen bg-gray-100 font-sans">
            
            {/* Using the dark sidebar */}
            <Sidebar /> 
            <div className="flex-1 flex flex-col">
                <Header />
                <main className="flex-1 p-4 sm:p-8 overflow-y-auto">
                    {/* The Outlet renders the component for the current route */}
                         <FormCard title="Add New Teller">
            <form onSubmit={handleSubmit} className="space-y-6">
                
                <FormInput 
                    label="Full Name" 
                    name="names" // Must match the state and API key
                    value={formData.names}
                    onChange={handleChange}
                    placeholder="John Doe" 
                    required 
                />
                
                <FormInput 
                    label="Email Address" 
                    type="email" 
                    name="email" // Must match the state and API key
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="john.doe@example.com" 
                    required 
                />

                <FormInput 
                    label="Phone Number" 
                    type="tel" // Use type="tel" for phone numbers
                    name="phone" // Must match the state and API key
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+250781110785" 
                    required 
                />

                <FormInput 
                    label="Initial Password" 
                    type="password" 
                    name="password" // Must match the state and API key
                    value={formData.password}
                    onChange={handleChange}
                    required 
                />

                {/* The "Status" dropdown is not in your API, so I've removed it.
                    If your API supports it, you can add it back to the state and form. */}

                <div className="flex justify-end pt-2">
                    <PrimaryButton type="submit" disabled={isLoading}>
                        {isLoading ? 'Adding...' : 'Add Teller'}
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

export default AddTellerPage;