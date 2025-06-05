import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { StatCard } from '../../components/Reusable';
// NEW: Imported a new icon for the "Active Tellers" card for better visual distinction
import { ChartBarIcon, UserGroupIcon, BanknotesIcon, ArrowUpOnSquareStackIcon, CheckBadgeIcon } from '@heroicons/react/24/outline';
import { toast } from "react-toastify";

const DashboardOverview = () => {
    const navigate = useNavigate();

    // MODIFIED: Added state for the active teller count
    const [totalTellerCount, setTotalTellerCount] = useState(0);
    const [activeTellerCount, setActiveTellerCount] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
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

                if (response.data && Array.isArray(response.data)) {
                    const allTellers = response.data;
                    
                    // ====================================================================
                    // NEW: Filtering logic to count only active tellers
                    // We filter the array of tellers to include only those whose status,
                    // converted to lowercase, is 'active'.
                    // ====================================================================
                    const activeTellers = allTellers.filter(
                        (teller) => teller.status && teller.status.toLowerCase() === 'active'
                    );

                    // Update both state variables with the new counts
                    setTotalTellerCount(allTellers.length);
                    setActiveTellerCount(activeTellers.length);
                }
            } catch (error) {
                console.error("Failed to fetch dashboard data:", error);
                if (error.response?.status === 401 || error.response?.status === 403) {
                    toast.error("Session expired. Please log in again.");
                    navigate('/login');
                } else {
                    // Set counts to an error state if fetching fails
                    setTotalTellerCount('Error');
                    setActiveTellerCount('Error');
                }
            } finally {
                // Set loading to false after the request is complete
                setIsLoading(false);
            }
        };

        fetchData();
    }, [navigate]);

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                
                {/* MODIFIED: This card now shows the TOTAL number of tellers */}
                <StatCard 
                    title="Total Tellers" 
                    value={isLoading ? '...' : totalTellerCount} 
                    icon={UserGroupIcon} 
                    color="purple" 
                />

                {/* NEW: This card shows only the ACTIVE tellers */}
                <StatCard 
                    title="Active Tellers" 
                    value={isLoading ? '...' : activeTellerCount} 
                    icon={CheckBadgeIcon} 
                    color="green" 
                />
                
                <StatCard title="Transactions (Today)" value="152" icon={BanknotesIcon} color="blue" />
                <StatCard title="Cash Assigned" value="$45,000" icon={ArrowUpOnSquareStackIcon} color="yellow" />
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
               <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Activity</h3>
               <p className="text-gray-500">Activity feed will be displayed here.</p>
            </div>
        </div>
    );
};

export default DashboardOverview;