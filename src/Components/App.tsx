import { useAuth0 } from '@auth0/auth0-react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// pages
import HomePage from './HomePage/HomePage';
// providers
import { AlertProvider } from '../Contexts/AlertContext';
// miscellaneous
import Spinner from '../Widgets/Spinner';
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
      <Router>
        <header>Header goes here</header>
        <main>
          <div className="page">
            <Routes>
              <Route path="" element={<HomePage />} />
              <Route path="/" element={<HomePage />} />
            </Routes>
          </div>
        </main>
        <footer>Footer goes here</footer>
      </Router>
    </AlertProvider>
  );
}

export default App;
