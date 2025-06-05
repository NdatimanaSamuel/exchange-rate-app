import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { 
    HomeIcon, 
    UserGroupIcon, 
    BanknotesIcon, 
    ChartBarIcon, 
    PlusCircleIcon, 
    EyeIcon, 
    ArrowUpOnSquareStackIcon,
    ChevronDownIcon,
    ArrowRightOnRectangleIcon,
    // --- NEW: More relevant icons for better visual distinction ---
    ScaleIcon,           // For 'Rates', representing balance/exchange
    CurrencyDollarIcon,  // For 'Currencies', universally understood
} from '@heroicons/react/24/outline';
import { FXFlowIcon } from './FXFlowIcon'; // Assuming this is in the same folder

/**
 * A "dumb" or "controlled" component for the dropdown menu.
 * Its state (isOpen) and behavior (onClick) are controlled by its parent.
 */
const SidebarDropdown = ({ text, icon: Icon, children, isOpen, onClick }) => {
    return (
        <div>
            <button
                onClick={onClick} // The parent component now handles the click
                className="w-full flex items-center justify-between py-2.5 px-4 rounded-md text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
            >
                <span className="flex items-center">
                    <Icon className="h-5 w-5 mr-3" />
                    {text}
                </span>
                <ChevronDownIcon className={`h-5 w-5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {/* Visibility is now controlled by the `isOpen` prop from the parent */}
            {isOpen && (
                <div className="pl-8 mt-1 space-y-1">
                    {children}
                </div>
            )}
        </div>
    );
};

const SidebarMenuItem = ({ to, text, icon: Icon }) => (
    <NavLink
        to={to}
        end // Prevents matching parent routes
        className={({ isActive }) => 
            `flex items-center py-2.5 px-4 rounded-md text-sm font-medium transition-colors ${
                isActive 
                ? 'bg-purple-600 text-white' 
                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
            }`
        }
    >
        <Icon className="h-5 w-5 mr-3" />
        {text}
    </NavLink>
);

const Sidebar = () => {
    const navigate = useNavigate();
    const location = useLocation(); // Hook to get the current URL information

    // This state now controls which dropdown is open, creating an accordion effect.
    // It's initialized by a function that checks the current URL path to see if a dropdown
    // should be open by default when the page loads.
    const [openDropdown, setOpenDropdown] = useState(() => {
        const path = location.pathname;
        if (path.includes('/teller') && !path.includes('/teller-balances')) return 'tellers';
        if (path.includes('/rate')) return 'rates';
        if (path.includes('/currenc')) return 'currencies';
        if (path.includes('/assign-cash') || path.includes('/teller-balances')) return 'balance';
        return null; // No dropdown is open by default
    });

    // A single handler to manage opening/closing dropdowns
    const handleDropdownClick = (dropdownName) => {
        // If the clicked dropdown is already open, close it. Otherwise, open the new one.
        setOpenDropdown(openDropdown === dropdownName ? null : dropdownName);
    };

    const handleLogout = () => {
        if (window.confirm("Are you sure you want to log out?")) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            navigate('/login');
        }
    };

    return (
        <aside className="w-64 bg-gray-800 text-white flex-col hidden sm:flex">
            <div className="h-20 flex items-center justify-center gap-3 border-b border-gray-700">
                <FXFlowIcon className="h-8 w-8 text-purple-400" />
                <span className="text-xl font-bold">FXFlow Admin</span>
            </div>
            
            <nav className="flex-1 px-4 py-6 space-y-2">
                <SidebarMenuItem to="/admin-home" text="Dashboard" icon={HomeIcon} />

                {/* These dropdowns are now controlled by the main Sidebar component */}
                <SidebarDropdown text="Manage Tellers" icon={UserGroupIcon} isOpen={openDropdown === 'tellers'} onClick={() => handleDropdownClick('tellers')}>
                    <SidebarMenuItem to="/add-tellers" text="Add Teller" icon={PlusCircleIcon} />
                    <SidebarMenuItem to="/view-tellers" text="View Tellers" icon={EyeIcon} />
                </SidebarDropdown>
                
                <SidebarDropdown text="Manage Rates" icon={ScaleIcon} isOpen={openDropdown === 'rates'} onClick={() => handleDropdownClick('rates')}>
                    <SidebarMenuItem to="/add-rates" text="Add Rate" icon={PlusCircleIcon} />
                    <SidebarMenuItem to="/view-rates" text="View Rates" icon={EyeIcon} />
                </SidebarDropdown>

                <SidebarDropdown text="Manage Currencies" icon={CurrencyDollarIcon} isOpen={openDropdown === 'currencies'} onClick={() => handleDropdownClick('currencies')}>
                    <SidebarMenuItem to="/add-currency" text="Add Currency" icon={PlusCircleIcon} />
                    <SidebarMenuItem to="/view-currencies" text="View Currencies" icon={EyeIcon} />
                </SidebarDropdown>

                <SidebarDropdown text="Teller Balance" icon={BanknotesIcon} isOpen={openDropdown === 'balance'} onClick={() => handleDropdownClick('balance')}>
                    <SidebarMenuItem to="/assign-cash" text="Assign Cash" icon={ArrowUpOnSquareStackIcon} />
                    {/* CORRECTED: Link now points to the correct page */}
                    <SidebarMenuItem to="/teller-balances" text="View Balances" icon={EyeIcon} />
                </SidebarDropdown>

                <SidebarMenuItem to="/admin/reports/profit" text="View Profit" icon={ChartBarIcon} />
                <SidebarMenuItem to="/admin/reports/transactions" text="Transactions" icon={ChartBarIcon} />
            </nav>

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

export default Sidebar;