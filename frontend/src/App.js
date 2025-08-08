import React from 'react';
import './styles/tailwind.output.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ProtectedAdminRoute, ProtectedRENRoute } from './components/ProtectedRoute';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './components/HomePage';
import SearchResults from './components/SearchResults';
import AffordabilityCalculator from './components/AffordabilityCalculator';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import RenDashboard from './components/RenDashboard';
import SubmitNewPropertyForm from './components/SubmitNewPropertyForm';
import AdminDashboard from './components/oldAdminDashboard';
import PropertyManagement from './components/tailwind/PropertyManagement';
import ComparisonPage from './components/tailwind/ComparisonPage';
import FavoritePages from './components/tailwind/FavoritePages';
import { FavoritesProvider } from './components/FavoritesContext';
import PropertyDetails from './components/tailwind/PropertyDetails';
import About from './components/tailwind/About';
import AdminCreateUser from './components/AdminCreateUser';
import ProfilePage from './components/ProfilePage';
import ChatPage from './components/tailwind/Chat';

function App() {
  return (
    <FavoritesProvider>
      <Router>
        <div className="App">
          <Header />
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/search-results" element={<SearchResults />} />
            <Route path="/property/:id" element={<PropertyDetails />} />
            <Route path="/comparison" element={<ComparisonPage />} />
            <Route path="/affordability-calculator" element={<AffordabilityCalculator />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/favourites" element={<FavoritePages />} />
            <Route path="/about" element={<About />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/chat" element={<ChatPage />} />
            {/* Protected Admin Routes */}
            <Route 
              path="/admin-dashboard" 
              element={
                <ProtectedAdminRoute>
                  <AdminDashboard />
                </ProtectedAdminRoute>
              } 
            />

            <Route 
              path="/admin-PropertyManagement" 
              element={
                <ProtectedAdminRoute>
                  <PropertyManagement />
                </ProtectedAdminRoute>
              } 
            />

            {/* Protected REN Routes */}
            <Route 
              path="/ren-dashboard" 
              element={
                <ProtectedRENRoute>
                  <RenDashboard />
                </ProtectedRENRoute>
              } 
            />
            
            <Route 
              path="/submit-new-property" 
              element={
                <ProtectedRENRoute>
                  <SubmitNewPropertyForm />
                </ProtectedRENRoute>
              } 
            />

            <Route 
              path="/admin/create-user" 
              element={
                <ProtectedAdminRoute>
                  <AdminCreateUser />
                </ProtectedAdminRoute>
              } 
            />
          </Routes>
          <Footer />
        </div>
      </Router>
    </FavoritesProvider>
  );
}

export default App;