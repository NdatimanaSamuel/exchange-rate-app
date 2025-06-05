// ===> Import useEffect and useMemo in addition to useState
import React, { useState, useEffect, useMemo } from 'react';
import { ChevronDownIcon, GlobeAltIcon, ScaleIcon, BoltIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';

// --- Reusable Icon Components (No Changes Here) ---
const FXFlowIcon = ({ className }) => (
    <svg className={className} width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M16 16.01V18H8V16.01H16ZM16 13V15H8V13H16ZM10 3H8V2H10V3ZM12 3H14V2H12V3ZM6 5H4V6H2V8H4V9H6V11H4V12H2V14H4V15H6V17H4V18H2V20H4V21H6V22H8V21H16V22H18V21H20V20H22V18H20V17H18V15H20V14H22V12H20V11H18V9H20V8H22V6H20V5H18V3H16V5H8V3H6V5ZM18 7V8H16V7H18ZM10 5V6H8V5H10ZM12 5V6H14V5H12ZM16 5V6H18V5H16ZM16 9V10H18V9H16ZM8 7V8H6V7H8ZM8 9V10H6V9H8ZM6 19V20H8V19H6ZM18 19V20H16V19H18Z" fill="currentColor"/>
      <path d="M11 7H13V11H11V7Z" fill="currentColor"/>
    </svg>
);


// --- Main HomePage Component ---
const MainPage = () => {
  // ===> USE YOUR ACTUAL API KEY HERE
  const API_KEY = '34af789fa40dd188b958b99d';

  // Your list of primary currencies
  const supportedCurrencies = [
    { code: 'USD', name: 'United States Dollar', flag: '🇺🇸' },
    { code: 'EUR', name: 'Euro', flag: '🇪🇺' },
    { code: 'GBP', name: 'British Pound', flag: '🇬🇧' },
    { code: 'RWF', name: 'Rwandan Franc', flag: '🇷🇼' }, // Changed from RWF to RWF for consistency
    { code: 'KES', name: 'Kenyan Shilling', flag: '🇰🇪' },
    { code: 'NGN', name: 'Nigerian Naira', flag: '🇳🇬' },
    { code: 'JPY', name: 'Japanese Yen', flag: '🇯🇵' },
    { code: 'CAD', name: 'Canadian Dollar', flag: '🇨🇦' },
  ];

  const features = [
    { icon: ScaleIcon, title: 'Best Exchange Rates', description: 'We provide competitive, real-time rates to maximize the value of your conversion.' },
    { icon: BoltIcon, title: 'Fast & Secure Transfers', description: 'Your funds are transferred quickly and protected with industry-leading security protocols.' },
    { icon: GlobeAltIcon, title: 'Global Reach', description: 'Convert and send money to dozens of countries with our ever-expanding network.' },
  ];

  // ===> State for the converter and API data
  const [amount, setAmount] = useState(1000);
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('RWF');
  const [rates, setRates] = useState(null); // Will store all exchange rates from the API
  const [isLoading, setIsLoading] = useState(true); // For loading state
  const [error, setError] = useState(null); // For error handling

  // ===> Fetch exchange rates from the API when the component loads
  useEffect(() => {
    const fetchRates = async () => {
      try {
        setIsLoading(true);
        setError(null);
        // We fetch with USD as the base, which gives us all other currency values against 1 USD
        const response = await fetch(`https://v6.exchangerate-api.com/v6/${API_KEY}/latest/USD`);
        if (!response.ok) {
          throw new Error('Failed to fetch exchange rates. Please check your API key or network.');
        }
        const data = await response.json();
        if (data.result === 'success') {
          setRates(data.conversion_rates);
        } else {
          throw new Error(data['error-type'] || 'An unknown API error occurred.');
        }
      } catch (err) {
        setError(err.message);
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRates();
  }, [API_KEY]); // The effect runs once when the component mounts

  // ===> Calculate the exchange rate and converted amount dynamically
  const { exchangeRate, convertedAmount } = useMemo(() => {
    if (!rates) {
      return { exchangeRate: 0, convertedAmount: 0 };
    }
    // Formula to convert between any two currencies when the base is USD
    const rateFrom = rates[fromCurrency]; // e.g., 1 USD = 1 USD
    const rateTo = rates[toCurrency];     // e.g., 1 USD = 1295.5 RWF
    
    const calculatedRate = rateTo / rateFrom;
    
    return {
      exchangeRate: calculatedRate,
      convertedAmount: (amount * calculatedRate).toFixed(2),
    };
  }, [amount, fromCurrency, toCurrency, rates]);


  // ===> A small component to display key rates (Idea for your customers)
  const KeyRatesDisplay = () => {
    if (isLoading || !rates) return null; // Don't show if loading or no rates
    return (
        <div className="flex flex-wrap justify-center gap-4 md:gap-8 mt-6 text-sm text-gray-600">
            <span>1 USD = <strong>{rates.RWF.toFixed(2)} RWF</strong></span>
            <span>1 EUR = <strong>{(rates.RWF / rates.EUR).toFixed(2)} RWF</strong></span>
            <span>1 USD = <strong>{rates.EUR.toFixed(4)} EUR</strong></span>
        </div>
    );
  };


  return (
    <div className="bg-white text-gray-800 font-sans">
      {/* Navbar (No Changes) */}
      <header className="border-b">
        <div className="container mx-auto flex justify-between items-center p-4">
          <a href="#" className="flex items-center gap-2 text-purple-600">
            <FXFlowIcon className="h-7 w-7" />
            <span className="text-xl font-bold">FXFlow</span>
          </a>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <Link to="#" className="text-gray-600 hover:text-purple-600">Home</Link>
            <Link to="#" className="text-gray-600 hover:text-purple-600">Services</Link>
            <Link to="#" className="text-gray-600 hover:text-purple-600">About Us</Link>
            <Link to="#" className="text-gray-600 hover:text-purple-600">Contact</Link>
          </nav>
          <div className="flex items-center gap-3"></div>
        </div>
      </header>

      {/* Main Content */}
      <main>
        {/* Hero Section */}
        <section className="bg-gray-50 py-20 lg:py-32">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-gray-900">
              Fast, Secure Currency Exchange
            </h1>
            <p className="mt-6 text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
              Convert your money with confidence. Get the best rates for your international transfers, from USD to EUR, RWF, and beyond.
            </p>
            
            {/* ===> Currency Converter Card - MODIFIED TO BE DYNAMIC */}
            <div className="mt-10 mx-auto max-w-xl bg-white rounded-xl shadow-lg p-6 md:p-8 border">
                {isLoading ? (
                    <div className="text-gray-500">Loading live rates...</div>
                ) : error ? (
                    <div className="text-red-500">{error}</div>
                ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                        <div>
                            <label htmlFor="amount" className="block text-sm font-medium text-left text-gray-700">You send</label>
                            <div className="relative mt-1">
                                <input 
                                    type="number" 
                                    id="amount"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    className="w-full rounded-md border-gray-300 py-3 pl-4 pr-24 text-lg focus:border-purple-500 focus:ring-purple-500"
                                />
                                <div className="absolute inset-y-0 right-0 flex items-center">
                                    <select 
                                      value={fromCurrency}
                                      onChange={(e) => setFromCurrency(e.target.value)}
                                      className="h-full rounded-md border-transparent bg-transparent py-0 pl-2 pr-7 text-gray-500 focus:ring-0 sm:text-sm"
                                    >
                                      {supportedCurrencies.map(c => <option key={c.code}>{c.code}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-left text-gray-700">They receive</label>
                            <div className="relative mt-1">
                                <input 
                                    type="text"
                                    readOnly
                                    value={convertedAmount}
                                    className="w-full rounded-md border-gray-300 py-3 pl-4 pr-24 text-lg bg-gray-50 cursor-default"
                                />
                                <div className="absolute inset-y-0 right-0 flex items-center">
                                    <select
                                      value={toCurrency}
                                      onChange={(e) => setToCurrency(e.target.value)}
                                      className="h-full rounded-md border-transparent bg-transparent py-0 pl-2 pr-7 text-gray-500 focus:ring-0 sm:text-sm"
                                    >
                                      {supportedCurrencies.map(c => <option key={c.code}>{c.code}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="text-sm text-gray-500 mt-4">
                      Live rate: 1 {fromCurrency} = {exchangeRate.toFixed(4)} {toCurrency}
                    </div>
                </>
                )}
                 <button className="mt-6 w-full rounded-lg bg-purple-600 px-6 py-3.5 text-base font-semibold text-white shadow-sm hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2">
                    Get Started
                </button>
            </div>
            {/* ===> Here we call the new KeyRatesDisplay component */}
            <KeyRatesDisplay />
          </div>
        </section>

        {/* The rest of your page (Supported Currencies, Features, etc.) remains unchanged */}
        <section className="py-16 lg:py-24">
            <div className="container mx-auto px-4">
                <div className="text-center">
                    <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Currencies We Support</h2>
                    <p className="mt-4 text-lg text-gray-600">A growing list of global and local currencies at your disposal.</p>
                </div>
                <div className="mt-12 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
                    {supportedCurrencies.map((currency) => (
                        <div key={currency.code} className="flex items-center gap-3 p-4 rounded-lg bg-gray-50 border border-gray-200">
                           <span className="text-3xl">{currency.flag}</span>
                           <div>
                            <p className="font-semibold text-gray-900">{currency.code}</p>
                            <p className="text-xs text-gray-500 hidden sm:block">{currency.name}</p>
                           </div>
                        </div>
                    ))}
                     <div className="flex items-center justify-center p-4 rounded-lg bg-gray-100 border border-gray-200 text-gray-500">
                        <p className="font-semibold">+ many more</p>
                     </div>
                </div>
            </div>
        </section>
        
        <section className="bg-gray-50 py-16 lg:py-24">
            <div className="container mx-auto px-4">
                <div className="text-center max-w-3xl mx-auto">
                    <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">The Smartest Way to Exchange Money</h2>
                    <p className="mt-4 text-lg text-gray-600">
                        We built FXFlow to give you a fair, fast, and transparent experience every time you convert funds.
                    </p>
                </div>
                <div className="mt-16 grid grid-cols-1 gap-y-12 md:grid-cols-3 md:gap-x-8">
                    {features.map((feature) => (
                        <div key={feature.title} className="text-center">
                            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 text-purple-600">
                                <feature.icon className="h-6 w-6" aria-hidden="true" />
                            </div>
                            <h3 className="mt-5 text-lg font-semibold leading-6 text-gray-900">{feature.title}</h3>
                            <p className="mt-2 text-base text-gray-600">{feature.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>

        <section className="py-16 lg:py-24">
            <div className="container mx-auto px-4 text-center">
                <h2 className="text-3xl font-bold tracking-tight text-gray-900">Ready to start converting?</h2>
                <p className="mt-4 text-lg text-gray-600">Create an account in minutes and join thousands of satisfied users.</p>
                <a href="#" className="mt-8 inline-block rounded-lg bg-purple-600 px-8 py-3.5 text-base font-semibold text-white shadow-sm hover:bg-purple-700">
                    Create Free Account
                </a>
            </div>
        </section>
      </main>

      <footer className="bg-gray-800 text-white">
        <div className="container mx-auto px-4 py-12">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <div className="md:col-span-1">
                    <a href="#" className="flex items-center gap-2">
                        <FXFlowIcon className="h-7 w-7 text-white" />
                        <span className="text-xl font-bold">FXFlow</span>
                    </a>
                    <p className="mt-4 text-sm text-gray-400">The best way to exchange currencies worldwide.</p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 md:col-span-3 gap-8">
                    <div>
                        <h3 className="text-sm font-semibold tracking-wider uppercase">Platform</h3>
                        <ul className="mt-4 space-y-2">
                            <li><a href="#" className="text-sm text-gray-400 hover:text-white">Rates</a></li>
                            <li><a href="#" className="text-sm text-gray-400 hover:text-white">Features</a></li>
                            <li><a href="#" className="text-sm text-gray-400 hover:text-white">Security</a></li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold tracking-wider uppercase">Company</h3>
                        <ul className="mt-4 space-y-2">
                            <li><a href="#" className="text-sm text-gray-400 hover:text-white">About Us</a></li>
                            <li><a href="#" className="text-sm text-gray-400 hover:text-white">Careers</a></li>
                            <li><a href="#" className="text-sm text-gray-400 hover:text-white">Contact</a></li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold tracking-wider uppercase">Legal</h3>
                        <ul className="mt-4 space-y-2">
                            <li><a href="#" className="text-sm text-gray-400 hover:text-white">Privacy Policy</a></li>
                            <li><a href="#" className="text-sm text-gray-400 hover:text-white">Terms of Service</a></li>
                        </ul>
                    </div>
                </div>
            </div>
            <div className="mt-8 border-t border-gray-700 pt-8 text-center text-sm text-gray-400">
                <p>© {new Date().getFullYear()} FXFlow, Inc. All rights reserved.</p>
            </div>
        </div>
      </footer>
    </div>
  );
};

export default MainPage;