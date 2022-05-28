import { useAuth0 } from '@auth0/auth0-react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// pages
import AboutPage from './AboutPage/AboutPage';
import ArchitecturePage from './AboutPage/ArchitecturePage';
import DisclaimerPage from './DisclaimerPage/DisclaimerPage';
import HomePage from './HomePage/HomePage';
import MainPage from './MainPage/MainPage';
import NotFoundPage from './NotFoundPage/NotFoundPage';
import SearchPage from './SearchPage/SearchPage';
// providers
import { AlertProvider } from '../Contexts/AlertContext';
import { UserProvider } from '../Contexts/UserContext';
// miscellaneous
import AlertPopup from '../Widgets/AlertPopup/AlertPopup';
import Header from './Header/Header';
import Footer from './Footer/Footer';
import Spinner from '../Widgets/Spinner/Spinner';
// CSS
import './App.css';

function App() {
  const { isLoading, error } = useAuth0();
  if (isLoading) {
    return (
      <div className="loading">
        <Spinner />
        <span>Loading...</span>
      </div>
    );
  }
  if (error) {
    return <div className="errorpage">Oops... {error.message}</div>;
  }
  return (
    <AlertProvider>
      <UserProvider>
        <Router>
          <header>
            <Header />
          </header>
          <main>
            <div className="page">
              <Routes>
                <Route path="" element={<HomePage />} />
                <Route path="/" element={<HomePage />} />
                <Route path="/About" element={<AboutPage />} />
                <Route path="/Architecture" element={<ArchitecturePage />} />
                <Route path="/Disclaimer" element={<DisclaimerPage />} />
                <Route path="/Home" element={<HomePage />} />
                <Route
                  path="/Main"
                  element={
                    <>
                      <AlertPopup />
                      <MainPage />
                    </>
                  }
                />
                <Route
                  path="/Search/:category/:text"
                  element={<SearchPage />}
                />
                <Route path="/Search/:text" element={<SearchPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </div>
          </main>
          <footer>
            <Footer />
          </footer>
        </Router>
      </UserProvider>
    </AlertProvider>
  );
}

export default App;
