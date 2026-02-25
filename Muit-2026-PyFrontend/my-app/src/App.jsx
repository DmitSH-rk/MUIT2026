import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { authApi } from './api/auth';
import { useAuthStore } from './store/useAuthStore';

// Импорт компонентов
import Navbar from './components/layout/Navbar';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import ClubList from './pages/Clubs/ClubList'; // Наша новая страница
import ClubDetails from './pages/Clubs/ClubDetails'; // Импортируем новый компонент
import CampaignList from './pages/Funding/CampaignList';
import CreateCampaign from './pages/Funding/CreateCampaign';
import CampaignDetails from './pages/Funding/CampaignDetails';
import ProtectedRoute from './components/ProtectedRoute';
import Profile from './pages/Profile/Profile';
import NewsList from './pages/News/NewsList';
import CreateNews from './pages/News/CreateNews';
import NewsDetails from './pages/News/NewsDetails';
import CompetitionsList from './pages/Competitions/CompetitionsList';
import CreateCompetition from './pages/Competitions/CreateCompetitions';
import CompetitionDetails from './pages/Competitions/CompetitionDetails';
import Home from './pages/Home/Home';
import './App.css';

function App() {
  const [isInitializing, setIsInitializing] = useState(true);
  const setAuth = useAuthStore((state) => state.setAuth);
  const logout = useAuthStore((state) => state.logout);

  useEffect(() => {
    const initSession = async () => {
      const token = localStorage.getItem('access_token');
      if (token) {
        try {
          const userData = await authApi.getMe(); //
          setAuth(userData, { access_token: token }); 
        } catch (err) {
          logout();
        }
      }
      setIsInitializing(false);
    };
    initSession();
  }, [setAuth, logout]);

  if (isInitializing) return <div className="loader">Загрузка...</div>;

  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* НОВЫЙ МАРШРУТ: Список клубов доступен всем */}
        <Route path="/clubs" element={<ClubList />} />
        <Route path="/clubs/:id" element={<ClubDetails />} />

        <Route path="/funding" element={<CampaignList />} />
        <Route path="/funding/create" element={
          <ProtectedRoute allowedRoles={['club']}>
            <CreateCampaign />
          </ProtectedRoute>
        } />

        <Route path="/funding/:id" element={<CampaignDetails />} />
        <Route path="/profile" element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } />

        <Route path="/news" element={<NewsList />} />
        <Route path="/news/create" element={
          <ProtectedRoute allowedRoles={['club']}>
            <CreateNews />
          </ProtectedRoute>
        } />
        <Route path="/news/:id" element={<NewsDetails />} />

        <Route path="/competitions" element={<CompetitionsList />} />
        <Route path="/competitions/create" element={<CreateCompetition />} />
        <Route path="/competitions/:id" element={<CompetitionDetails />} />
      </Routes>
    </Router>
  );
}

export default App;