import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Header from './components/Header';
import Home from './pages/Home';
import NewsFeed from './pages/NewsFeed';
import Profile from './pages/Profile';
import LoginModal from './components/LoginModal';
import RegisterModal from './components/RegisterModal';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Header />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/news" element={<NewsFeed />} />
              <Route path="/profile" element={<Profile />} />
            </Routes>
          </main>
          <LoginModal />
          <RegisterModal />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;