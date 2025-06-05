import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
    MagnifyingGlassIcon, 
    BellIcon, 
    UserCircleIcon, 
    ArrowRightOnRectangleIcon 
} from '@heroicons/react/24/outline';

// A helper function to get a user-friendly title from the URL path
const getTitleFromPathname = (pathname) => {
    switch (pathname) {
        case '/': return 'Dashboard';
        case '/tellers/add': return 'Add New Teller';
        case '/tellers/view': return 'View All Tellers';
        case '/cash/assign': return 'Assign Cash to Teller';
        case '/cash/view': return 'View Assigned Cash';
        case '/profit': return 'View Profit';
        default: return 'Dashboard';
    }
};

const Header = () => {
    const [isProfileMenuOpen, setProfileMenuOpen] = useState(false);
    const profileMenuRef = useRef(null);
    const navigate = useNavigate();
    const location = useLocation();

    const pageTitle = getTitleFromPathname(location.pathname);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
                setProfileMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleLogout = () => {
        if (window.confirm("Are you sure you want to log out?")) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            navigate('/login');
        }
    };

    return (
        <header className="h-20 bg-white border-b flex justify-between items-center px-4 sm:px-8">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800">{pageTitle}</h1>
            <div className="flex items-center gap-4 sm:gap-6">
                <div className="relative hidden md:block">
                    <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute top-1/2 left-3 -translate-y-1/2" />
                    <input type="text" placeholder="Search..." className="pl-10 pr-4 py-2 rounded-lg border bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500" />
                </div>
                <BellIcon className="h-6 w-6 text-gray-500 hover:text-purple-600 cursor-pointer" />
                <div className="relative" ref={profileMenuRef}>
                    <img onClick={() => setProfileMenuOpen(!isProfileMenuOpen)} src="https://i.pravatar.cc/40" alt="Admin" className="h-10 w-10 rounded-full cursor-pointer" />
                    {isProfileMenuOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                            <a href="#" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                <UserCircleIcon className="h-5 w-5 mr-3" />
                                Your Profile
                            </a>
                            <button onClick={handleLogout} className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                <ArrowRightOnRectangleIcon className="h-5 w-5 mr-3" />
                                Logout
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;