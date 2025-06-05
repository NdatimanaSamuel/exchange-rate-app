import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TableContainer } from '../../components/Reusable';
import { PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';
import Sidebar from '../../components/SidebarMenu';
import Header from '../../components/Header';
import axios from 'axios';
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// ====================================================================
// NEW: Edit Status Modal Component
// ====================================================================
const EditStatusModal = ({ isOpen, onClose, teller, onUpdate }) => {
    // State to hold the new status selected in the dropdown
    const [newStatus, setNewStatus] = useState(teller?.status || 'INACTIVE');

    // Effect to update the local state if the teller prop changes
    useEffect(() => {
        if (teller) {
            setNewStatus(teller.status);
        }
    }, [teller]);

    const handleUpdate = () => {
        // Call the onUpdate function passed from the parent with the teller's ID and new status
        onUpdate(teller.id, newStatus);
    };
    
    // Don't render the modal if it's not open
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Update Teller Status</h3>
                <div className="mb-4">
                    <p className="text-sm text-gray-600">
                        Editing status for: <span className="font-medium text-gray-800">{teller.names}</span>
                    </p>
                    <p className="text-sm text-gray-600">
                        Current Status: <span className="font-medium text-gray-800">{teller.status}</span>
                    </p>
                </div>

                <div className="mb-6">
                    <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">New Status</label>
                    <select
                        id="status"
                        value={newStatus}
                        onChange={(e) => setNewStatus(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    >
                        <option value="ACTIVE">ACTIVE</option>
                        <option value="INACTIVE">INACTIVE</option>
                    </select>
                </div>
                
                <div className="flex justify-end gap-4">
                    <button 
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleUpdate}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                    >
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
};


const ViewTellersPage = () => {
    const navigate = useNavigate();
    const [tellers, setTellers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // ====================================================================
    // NEW: State for managing the edit modal
    // ====================================================================
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTeller, setSelectedTeller] = useState(null);


    useEffect(() => {
        const fetchTellers = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                toast.error('Authentication error. Please log in again.');
                setIsLoading(false);
                navigate('/login');
                return;
            }

            const API_URL = 'http://localhost:7000/api/v1/auth/users';
            const config = { headers: { 'Authorization': `Bearer ${token}` } };

            try {
                const response = await axios.get(API_URL, config);
                setTellers(response.data || []); 
            } catch (error) {
                const errorMessage = error.response?.data?.message || 'Failed to fetch tellers.';
                toast.error(errorMessage);
                if (error.response?.status === 401 || error.response?.status === 403) {
                    navigate('/login');
                }
            } finally {
                setIsLoading(false);
            }
        };

        fetchTellers();
    }, [navigate]);

    // ====================================================================
    // NEW: Functions to handle modal visibility
    // ====================================================================
    const openEditModal = (teller) => {
        setSelectedTeller(teller);
        setIsModalOpen(true);
    };

    const closeEditModal = () => {
        setIsModalOpen(false);
        setSelectedTeller(null);
    };
    
    // ====================================================================
    // NEW: Function to handle the API call for updating status
    // ====================================================================
    const handleStatusUpdate = async (tellerId, newStatus) => {
        const token = localStorage.getItem('token');
        if (!token) {
            toast.error('Authentication token not found. Please log in.');
            return;
        }

        const API_URL = `http://localhost:7000/api/v1/auth/${tellerId}/status`;
        const payload = { status: newStatus };
        const config = { headers: { 'Authorization': `Bearer ${token}` } };

        try {
            await axios.put(API_URL, payload, config);
            
            // Update the tellers state locally for an instant UI update
            setTellers(tellers.map(teller => 
                teller.id === tellerId ? { ...teller, status: newStatus } : teller
            ));

            toast.success("Teller status updated successfully!");
            closeEditModal(); // Close the modal on success
        } catch (error) {
            const errorMessage = error.response?.data?.message || "Failed to update status.";
            toast.error(errorMessage);
        }
    };


    if (isLoading) {
        return <div className="text-center p-10">Loading Tellers...</div>;
    }

    return (
       <>
           <ToastContainer/>

           <div className="flex h-screen bg-gray-100 font-sans">
                <Sidebar /> 
                <div className="flex-1 flex flex-col">
                    <Header />
                    <main className="flex-1 p-4 sm:p-8 overflow-y-auto">
                        <TableContainer 
                            title="All Tellers" 
                            buttonText="Add New Teller" 
                            onButtonClick={() => navigate('/add-tellers')}
                        >
                            <table className="w-full text-sm text-left text-gray-500">
                                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3">Name</th>
                                        <th scope="col" className="px-6 py-3">Email</th>
                                        <th scope='col' className="px-6 py-3">Phone</th>
                                        <th scope="col" className="px-6 py-3">Status</th>
                                        <th scope="col" className="px-6 py-3 text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {tellers.length > 0 ? (
                                        tellers.map((teller) => (
                                            <tr key={teller.id} className="bg-white border-b hover:bg-gray-50">
                                                <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">{teller.names}</td>
                                                <td className="px-6 py-4">{teller.email}</td>
                                                <td className="px-6 py-4">{teller.phone}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-1 text-xs font-semibold leading-5 rounded-full capitalize ${
                                                        teller.status.toLowerCase() === 'active' 
                                                        ? 'bg-green-100 text-green-800' 
                                                        : 'bg-red-100 text-red-800'
                                                    }`}>
                                                        {teller.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 flex justify-center items-center gap-2">
                                                    {/* NEW: Updated onClick to open the modal */}
                                                    <button 
                                                        onClick={() => openEditModal(teller)}
                                                        className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-800"
                                                    >
                                                        <PencilSquareIcon className="h-4 w-4"/> Edit
                                                    </button>
                                                    {/* <button className="flex items-center gap-1 text-sm font-medium text-red-600 hover:text-red-800">
                                                        <TrashIcon className="h-4 w-4"/> Delete
                                                    </button> */}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr className="bg-white border-b">
                                            <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                                                No tellers found.
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
            {/* It only renders if a teller has been selected, preventing errors */}
            {selectedTeller && (
                <EditStatusModal
                    isOpen={isModalOpen}
                    onClose={closeEditModal}
                    teller={selectedTeller}
                    onUpdate={handleStatusUpdate}
                />
            )}
       </>
    );
}
export default ViewTellersPage;