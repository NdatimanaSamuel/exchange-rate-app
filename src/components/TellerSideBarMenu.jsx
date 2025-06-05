/* eslint-disable no-unused-vars */

import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
    HomeIcon, 
    BanknotesIcon, 
    ArrowRightOnRectangleIcon,
    // --- NEW, more relevant icons for a teller's tasks ---
    PencilSquareIcon, // For "New Transaction"
    DocumentTextIcon, // For "Transaction History"
} from '@heroicons/react/24/outline';
import { FXFlowIcon } from './FXFlowIcon'; // Assuming this is in the same folder

/**
 * A reusable component for a single menu item in the sidebar.
 * It uses NavLink to automatically handle the "active" state styling.
 */
const SidebarMenuItem = ({ to, text, icon: Icon }) => (
    <NavLink
        to={to}
        end // Prevents matching parent routes
        className={({ isActive }) => 
            `flex items-center py-2.5 px-4 rounded-md text-sm font-medium transition-colors ${
                isActive 
                ? 'bg-purple-600 text-white' // Highlight color for the active page
                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
            }`
        }
    >
        <Icon className="h-5 w-5 mr-3" />
        {text}
    </NavLink>
);

const TellerSidebar = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        if (window.confirm("Are you sure you want to log out?")) {
            localStorage.clear(); // Safely clear all session data
            navigate('/login');
        }
    };

    return (
        <aside className="w-64 bg-gray-800 text-white flex-col hidden sm:flex">
            {/* Header section with branding */}
            <div className="h-20 flex items-center justify-center gap-3 border-b border-gray-700">
                <FXFlowIcon className="h-8 w-8 text-purple-400" />
                <span className="text-xl font-bold">FXFlow Teller</span>
            </div>
            
            {/* Navigation section with a flat, direct menu for teller tasks */}
            <nav className="flex-1 px-4 py-6 space-y-2">
                <SidebarMenuItem to="/teller-home" text="Dashboard" icon={HomeIcon} />
                <SidebarMenuItem to="/teller-workspace" text="Manage Transaction" icon={PencilSquareIcon} />
                <SidebarMenuItem to="/my-balances" text="My Balances" icon={BanknotesIcon} />
                <SidebarMenuItem to="/my-transaction-history" text="Transaction History" icon={DocumentTextIcon} />
            </nav>

             {/* Footer section with the logout button */}
             <div className="mt-auto p-4 border-t border-gray-700">
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center py-2.5 px-4 rounded-md text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
                >
                    <ArrowRightOnRectangleIcon className="h-5 w-5 mr-3"/>
                    Logout
                </button>
            </div>
        </aside>
    );
};

export default TellerSidebar;