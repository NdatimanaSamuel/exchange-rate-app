import React from 'react'; // Add this line
import { BrowserRouter, Route, Routes } from "react-router-dom";
import NotFound from "../components/NotFound";
import Login from '../pages/Login';
import MainPage from '../pages/MainPage';
import HomeAdmin from '../pages/Admin/HomeAdmin';
import TellerDashboard from '../pages/Teller/TellerDashboard';
import ProtectedRoute from '../components/ProtectedRoute';// Assuming this is the correct path
import AddTellerPage from '../pages/Admin/AddTellerPage';
import ViewTellersPage from '../pages/Admin/ViewTellersPage';
import AddRatePage from '../pages/Admin/AddRatesPage';
import ViewRatesPage from '../pages/Admin/ViewRatesPage';
import ViewCurrenciesPage from '../pages/Admin/ViewCurrenciesPage';
import AddCurrencyPage from '../pages/Admin/AddCurrencyPage';
import ViewTellerBalancesPage from '../pages/Admin/ViewTellerBalancesPage';
import AssignCashPage from '../pages/Admin/AssignCashPage';
import TellerWorkspacePage from '../pages/Teller/TellerWorkspacePage';
import MyBalancesPage from '../pages/Teller/MyBalancesPage';
import TransactionHistoryPage from '../pages/Teller/TransactionHistoryPage';
import AdminTransactionsReport from '../pages/Admin/AdminTransactionsReport';
import AdminProfitReport from '../pages/Admin/AdminProfitReport';
const AppRouter=()=>{
    return(
        <BrowserRouter>
            <Routes>


          
                 <Route path="*" element={<NotFound />} />
                 <Route path="/" element={<MainPage />} />
                <Route path="/login" element={<Login />} />
                {/* Protected Admin Route */}
                <Route 
                path="/admin-home" 
                element={
                    <ProtectedRoute allowedRoles={['ADMIN']}>
                    <HomeAdmin />
                    </ProtectedRoute>
                } 
                />

                <Route 
                path="/add-tellers" 
                element={
                    <ProtectedRoute allowedRoles={['ADMIN']}>
                    <AddTellerPage />
                    </ProtectedRoute>
                } 
                />

                 <Route 
                path="/view-tellers" 
                element={
                    <ProtectedRoute allowedRoles={['ADMIN']}>
                    <ViewTellersPage />
                    </ProtectedRoute>
                } 
                />

                <Route 
                path="/add-rates" 
                element={
                    <ProtectedRoute allowedRoles={['ADMIN']}>
                    <AddRatePage />
                    </ProtectedRoute>
                } 
                />

                <Route 
                path="/view-rates" 
                element={
                    <ProtectedRoute allowedRoles={['ADMIN']}>
                    <ViewRatesPage />
                    </ProtectedRoute>
                } 
                />

                 <Route 
                path="/add-currency" 
                element={
                    <ProtectedRoute allowedRoles={['ADMIN']}>
                    <AddCurrencyPage />
                    </ProtectedRoute>
                } 
                />

                 <Route 
                path="/view-currencies" 
                element={
                    <ProtectedRoute allowedRoles={['ADMIN']}>
                    <ViewCurrenciesPage />
                    </ProtectedRoute>
                } 
                /> 
                 <Route 
                path="/assign-cash" 
                element={
                    <ProtectedRoute allowedRoles={['ADMIN']}>
                    <AssignCashPage />
                    </ProtectedRoute>
                } 
                /> 

                  <Route 
                path="/teller-balances" 
                element={
                    <ProtectedRoute allowedRoles={['ADMIN']}>
                    <ViewTellerBalancesPage />
                    </ProtectedRoute>
                } 
                />
               
                <Route 
                path="/teller-balances" 
                element={
                    <ProtectedRoute allowedRoles={['ADMIN']}>
                    <ViewTellerBalancesPage />
                    </ProtectedRoute>
                } 
                />
                 <Route 
                path="/admin/reports/profit" 
                element={
                    <ProtectedRoute allowedRoles={['ADMIN']}>
                    <AdminProfitReport />
                    </ProtectedRoute>
                } 
                />

                 <Route 
                path="/admin/reports/transactions" 
                element={
                    <ProtectedRoute allowedRoles={['ADMIN']}>
                    <AdminTransactionsReport />
                    </ProtectedRoute>
                } 
                />

                 {/* Protected Teller Route */} 
                <Route 
                path="/teller-home" 
                element={
                    <ProtectedRoute allowedRoles={['TELLER']}>
                    <TellerDashboard />
                    </ProtectedRoute> 
                } 
                />

                 <Route 
                path="/teller-workspace" 
                element={
                    <ProtectedRoute allowedRoles={['TELLER']}>
                    <TellerWorkspacePage />
                    </ProtectedRoute> 
                } 
                />

                  <Route 
                path="/my-balances" 
                element={
                    <ProtectedRoute allowedRoles={['TELLER']}>
                    <MyBalancesPage />
                    </ProtectedRoute> 
                } 
                />

                   <Route 
                path="/my-transaction-history" 
                element={
                    <ProtectedRoute allowedRoles={['TELLER']}>
                    <TransactionHistoryPage />
                    </ProtectedRoute> 
                } 
                />
                    {/* Add more routes as needed */}
           
              
                </Routes>
        </BrowserRouter>
    )
}

export default AppRouter;