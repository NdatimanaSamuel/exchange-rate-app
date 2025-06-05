import React from 'react';
import Sidebar from '../../components/SidebarMenu'; // I've renamed it Sidebar
import Header from '../../components/Header';
import DashboardOverview from './DashboardOverview';

// 1. Import ToastContainer and its CSS
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


const HomeAdmin = () => {
    return (
        <div className="flex h-screen bg-gray-100 font-sans">

             <ToastContainer
                position="top-right"
                autoClose={5000} // Close after 5 seconds
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
            />

            {/* Using the dark sidebar */}
            <Sidebar /> 
            <div className="flex-1 flex flex-col">
                <Header />
                <main className="flex-1 p-4 sm:p-8 overflow-y-auto">
                    {/* The Outlet renders the component for the current route */}
                    <DashboardOverview/>
                    {/* <Outlet /> */}
                </main>
            </div>
        </div>
    );
};

export default HomeAdmin;