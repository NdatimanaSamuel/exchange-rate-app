import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TableContainer } from '../../components/Reusable';
import Sidebar from '../../components/SidebarMenu';
import Header from '../../components/Header';
import axios from 'axios';
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { BanknotesIcon } from '@heroicons/react/24/solid';

const AdminProfitReport = () => {
    const navigate = useNavigate();
    
    const [profitData, setProfitData] = useState([]);
    const [tellers, setTellers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedTellerId, setSelectedTellerId] = useState('all');

    // --- NEW: Simplified and Corrected Data Fetching Logic ---
    useEffect(() => {
        let isMounted = true;
        const source = axios.CancelToken.source();

        const fetchAllData = async () => {
            setIsLoading(true);
            const token = localStorage.getItem('token');
            if (!token) { navigate('/login'); return; }
            const config = { headers: { 'Authorization': `Bearer ${token}` }, cancelToken: source.token };

            try {
                // Step 1: Always fetch the list of tellers (only happens once if not already fetched)
                if (tellers.length === 0) {
                    const tellersRes = await axios.get('http://localhost:7000/api/v1/auth/users', config);
                    if (isMounted) setTellers(tellersRes.data || []);
                }
                
                // Step 2: Determine URL and fetch the relevant profit data
                const profitUrl = selectedTellerId === 'all'
                    ? 'http://localhost:7000/api/v1/transactions/admin/profit/today/all'
                    : `http://localhost:7000/api/v1/transactions/admin/profit/today/${selectedTellerId}`;

                const profitRes = await axios.get(profitUrl, config);
                const data = Array.isArray(profitRes.data) ? profitRes.data : [profitRes.data];
                if (isMounted) setProfitData(data);

            } catch (error) {
                if (!axios.isCancel(error)) {
                    toast.error(error.response?.data?.message || "Failed to fetch data.");
                }
            } finally {
                if (isMounted) setIsLoading(false);
            }
        };

        fetchAllData();

        return () => {
            isMounted = false;
            source.cancel("Component unmounted");
        };
    }, [selectedTellerId, navigate, tellers.length]);


    const formatValue = (amount) => parseFloat(amount).toLocaleString('en-US', { minimumFractionDigits: 2 });
    const totalProfit = profitData.reduce((acc, item) => acc + (item.profit || item.totalProfit || 0), 0);

    return (
        <>
            <ToastContainer />
            <div className="flex h-screen bg-gray-100 font-sans">
                <Sidebar />
                <div className="flex-1 flex flex-col">
                    <Header />
                    <main className="flex-1 p-4 sm:p-8 overflow-y-auto">
                        <TableContainer title="Today's Profit Report">
                            <div className="flex justify-between items-center p-4 bg-gray-50 border-b">
                                <div className="flex items-center space-x-4">
                                    <label htmlFor="tellerFilter" className="text-sm font-semibold text-gray-600">Filter by Teller:</label>
                                    <select
                                        id="tellerFilter"
                                        value={selectedTellerId}
                                        onChange={(e) => setSelectedTellerId(e.target.value)}
                                        className="px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                                    >
                                        <option value="all">All Tellers</option>
                                        {tellers.map(teller => (
                                            <option key={teller.id} value={teller.id}>{teller.names}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-gray-600">Total Profit (Filtered)</p>
                                    <p className="text-xl font-bold text-green-600 flex items-center gap-1"><BanknotesIcon className="h-6 w-6"/> {formatValue(totalProfit)} RWF</p>
                                </div>
                            </div>
                            <table className="w-full text-sm text-left text-gray-500">
                                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3">Teller Name</th>
                                        <th scope="col" className="px-6 py-3">Email</th>
                                        <th scope="col" className="px-6 py-3 text-right">Total Profit (RWF)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {isLoading ? (
                                        <tr><td colSpan="3" className="text-center p-6">Loading...</td></tr>
                                    ) : profitData.length > 0 && profitData[0] ? (
                                        profitData.map((item) => (
                                            <tr key={item.tellerId} className="bg-white border-b hover:bg-gray-50">
                                                <td className="px-6 py-4 font-medium text-gray-900">{item.tellerName || item.teller?.names}</td>
                                                <td className="px-6 py-4 text-gray-600">{item.teller?.email}</td>
                                                <td className="px-6 py-4 text-right font-bold text-green-700">{formatValue(item.profit || item.totalProfit)}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr><td colSpan="3" className="px-6 py-4 text-center text-gray-500">No profit data found for the selected filter.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </TableContainer>
                    </main>
                </div>
            </div>
        </>
    );
}
export default AdminProfitReport;