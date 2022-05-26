import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import './HomePage.css';

export default function HomePage() {
  const { isAuthenticated } = useAuth0();
  const navigate = useNavigate();
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/Main');
    }
  }, [isAuthenticated, navigate]);
  if (!isAuthenticated) {
    return (
      <div className="hp__container">
        <img src="/images/logo500.png" alt="JimCo Logo" />
        <div className="hp__message">Please Sign In</div>
      </div>
    );
  } else {
    return <></>;
  }
}
