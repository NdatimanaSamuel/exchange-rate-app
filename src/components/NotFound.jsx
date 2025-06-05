import { Link } from "react-router-dom"
import React from 'react'; // Add this line

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center">
    <h1 className="text-3xl font-bold text-gray-800 mb-4">404 - Page Not Found</h1>
    <p className="text-gray-600 mb-8">Oops! The page you are looking for does not exist.</p>
    <Link to='/' className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded">
      Go to Home
    </Link>
  </div>
  )
}

export default NotFound