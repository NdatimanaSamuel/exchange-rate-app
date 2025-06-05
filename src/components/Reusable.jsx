import React from 'react';
import { PlusCircleIcon } from '@heroicons/react/24/outline';

// Stat Card for the dashboard
export const StatCard = ({ title, value, icon: Icon, color }) => {
    const colors = {
        green: 'bg-green-100 text-green-600',
        purple: 'bg-purple-100 text-purple-600',
        blue: 'bg-blue-100 text-blue-600',
        yellow: 'bg-yellow-100 text-yellow-600',
    };
    return (
        <div className="bg-white p-6 rounded-lg shadow-md flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-gray-500">{title}</p>
                <p className="text-3xl font-bold text-gray-800">{value}</p>
            </div>
            <div className={`p-3 rounded-full ${colors[color]}`}>
                <Icon className="h-7 w-7" />
            </div>
        </div>
    );
};

// A standard container for forms
export const FormCard = ({ title, children }) => (
    <div className="bg-white p-8 rounded-lg shadow-md max-w-2xl mx-auto">
        <h2 className="text-xl font-bold mb-6 text-gray-800">{title}</h2>
        {children}
    </div>
);

// A standard form input field
export const FormInput = ({ label, type = 'text', ...props }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700">{label}</label>
        <input type={type} {...props} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500" />
    </div>
);

// A standard form select dropdown
export const FormSelect = ({ label, children, ...props }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700">{label}</label>
        <select {...props} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500">
            {children}
        </select>
    </div>
);

// The main action button for forms
export const PrimaryButton = ({ children, ...props }) => (
     <button type="submit" {...props} className="px-6 py-2 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:bg-purple-300">
        {children}
    </button>
);

// A standard container for tables
export const TableContainer = ({ title, buttonText, onButtonClick, children }) => (
    <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
            {buttonText && onButtonClick && (
                <button onClick={onButtonClick} className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white font-semibold rounded-lg text-sm hover:bg-purple-700">
                    <PlusCircleIcon className="h-5 w-5" />
                    {buttonText}
                </button>
            )}
        </div>
        <div className="overflow-x-auto">
            {children}
        </div>
    </div>
);