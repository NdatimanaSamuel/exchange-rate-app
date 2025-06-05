import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TableContainer } from '../../components/Reusable';
import { PencilSquareIcon, TrashIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import Sidebar from '../../components/SidebarMenu';
import Header from '../../components/Header';
import axios from 'axios';
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// ====================================================================
// NEW: Confirmation Modal for Status Update
// ====================================================================
const UpdateStatusModal = ({ isOpen, onClose, onConfirm, rate }) => {
    if (!isOpen) return null;

    const isActivating = !rate.isActive;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Confirm Status Change</h3>
                <p className="text-sm text-gray-600 mb-4">
                    Are you sure you want to {isActivating ? 'ACTIVATE' : 'DEACTIVATE'} the rate for{' '}
                    <span className="font-bold">{rate.base}/{rate.target}</span>?
                </p>
                <div className="flex justify-end gap-4">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className={`px-4 py-2 text-white rounded-md ${isActivating ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}
                    >
                        {isActivating ? 'Yes, Activate' : 'Yes, Deactivate'}
                    </button>
                </div>
            </div>
        </div>
    );
};


const ViewRatesPage = () => {
    const navigate = useNavigate();
    
    // State to hold the full list of rates from the API
    const [allRates, setAllRates] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // NEW: State for the confirmation modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedRate, setSelectedRate] = useState(null);

    // NEW: State for filtering the displayed rates
    const [showActiveOnly, setShowActiveOnly] = useState(true); // Default to showing only active rates
    const [filterToday, setFilterToday] = useState(false);

    useEffect(() => {
        const fetchRates = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                toast.error('Authentication error. Please log in again.');
                setIsLoading(false);
                navigate('/login');
                return;
            }

            const API_URL = 'http://localhost:7000/api/v1/rate/view';
            const config = { headers: { 'Authorization': `Bearer ${token}` } };

            try {
                const response = await axios.get(API_URL, config);
                setAllRates(response.data || []);
            } catch (error) {
                toast.error(error.response?.data?.message || 'Failed to fetch rates.');
                if (error.response?.status === 401 || error.response?.status === 403) {
                    navigate('/login');
                }
            } finally {
                setIsLoading(false);
            }
        };

        fetchRates();
    }, [navigate]);

    // NEW: Function to handle opening the confirmation modal
    const handleEditClick = (rate) => {
        setSelectedRate(rate);
        setIsModalOpen(true);
    };
    
    // NEW: Function to handle the actual status update API call
    const handleConfirmUpdate = async () => {
        if (!selectedRate) return;

        const token = localStorage.getItem('token');
        const newStatus = !selectedRate.isActive;
        const API_URL = `http://localhost:7000/api/v1/rate/${selectedRate.id}/update-status`;
        const payload = { status: newStatus };
        const config = { headers: { 'Authorization': `Bearer ${token}` } };
        
        try {
            await axios.put(API_URL, payload, config);
            
            // Update the state locally for an instant UI refresh
            setAllRates(allRates.map(rate => 
                rate.id === selectedRate.id ? { ...rate, isActive: newStatus } : rate
            ));

            toast.success(`Rate successfully ${newStatus ? 'activated' : 'deactivated'}!`);
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to update status.");
        } finally {
            // Close the modal
            setIsModalOpen(false);
            setSelectedRate(null);
        }
    };


    // Helper to format date strings
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleString('en-US', {
            year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    };

    // NEW: Filtering logic applied before rendering
    const displayedRates = allRates.filter(rate => {
        // Filter for active status
        if (showActiveOnly && !rate.isActive) { // Note: 'isActive' being true or '1'
            return false;
        }

        // Filter for today's rates
        if (filterToday) {
            const rateDate = new Date(rate.updatedAt).toDateString();
            const todayDate = new Date().toDateString();
            if (rateDate !== todayDate) {
                return false;
            }
        }
        return true;
    });

    if (isLoading) {
        return <div className="text-center p-10">Loading Rates...</div>;
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
                            title="Exchange Rates" 
                            buttonText="Add New Rate" 
                            onButtonClick={() => navigate('/add-rateS')}
                        >
                            {/* NEW: Filter controls */}
                            <div className="flex items-center space-x-4 p-4 bg-gray-50 border-b">
                                <span className="text-sm font-semibold text-gray-600">Filters:</span>
                                <button
                                    onClick={() => setShowActiveOnly(!showActiveOnly)}
                                    className={`px-3 py-1 text-sm rounded-full ${showActiveOnly ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                                >
                                    {showActiveOnly ? 'Showing Active Only' : 'Showing All'}
                                </button>
                                <button
                                    onClick={() => setFilterToday(!filterToday)}
                                    className={`px-3 py-1 text-sm rounded-full ${filterToday ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                                >
                                    {filterToday ? "Today's Rates Only" : 'All Dates'}
                                </button>
                            </div>

                            <table className="w-full text-sm text-left text-gray-500">
                                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3">Status</th>
                                        <th scope="col" className="px-6 py-3">Base/Target</th>
                                        <th scope="col" className="px-6 py-3">Buy Rate</th>
                                        <th scope="col" className="px-6 py-3">Sell Rate</th>
                                        <th scope="col" className="px-6 py-3">Provider</th>
                                        <th scope="col" className="px-6 py-3">Last Updated</th>
                                        <th scope="col" className="px-6 py-3 text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {displayedRates.length > 0 ? (
                                        displayedRates.map((rate) => (
                                            <tr key={rate.id} className="bg-white border-b hover:bg-gray-50">
                                                {/* NEW: Visual status indicator */}
                                                <td className="px-6 py-4">
                                                    {rate.isActive ? (
                                                        <span className="flex items-center gap-1 text-green-600"><CheckCircleIcon className="h-5 w-5"/> Active</span>
                                                    ) : (
                                                        <span className="flex items-center gap-1 text-red-600"><XCircleIcon className="h-5 w-5"/> Inactive</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 font-medium text-gray-900">{rate.base}/{rate.target}</td>
                                                <td className="px-6 py-4 text-green-700 font-semibold">{rate.buyRate}</td>
                                                <td className="px-6 py-4 text-red-700 font-semibold">{rate.sellRate}</td>
                                                <td className="px-6 py-4">{rate.provider}</td>
                                                <td className="px-6 py-4">{formatDate(rate.updatedAt)}</td>
                                                <td className="px-6 py-4 flex justify-center items-center gap-2">
                                                    {/* MODIFIED: Edit button now opens the modal and has dynamic text */}
                                                    <button 
                                                        onClick={() => handleEditClick(rate)}
                                                        className={`flex items-center gap-1 text-sm font-medium ${rate.isActive ? 'text-yellow-600 hover:text-yellow-800' : 'text-green-600 hover:text-green-800'}`}
                                                    >
                                                        <PencilSquareIcon className="h-4 w-4"/> {rate.isActive ? 'Deactivate' : 'Activate'}
                                                    </button>
                                                    <button className="flex items-center gap-1 text-sm font-medium text-red-600 hover:text-red-800"><TrashIcon className="h-4 w-4"/> Delete</button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr className="bg-white border-b">
                                            <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                                                No rates match the current filters.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </TableContainer>
                    </main>
                </div>
            </div>
            
            {/* NEW: Render the modal */}
            <UpdateStatusModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={handleConfirmUpdate}
                rate={selectedRate}
            />
        </>
    );
}
export default ViewRatesPage;