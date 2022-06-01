import { Link, useNavigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { MdLogin, MdLogout, MdSettings } from 'react-icons/md';
import { useUser } from '../../Contexts/UserContext';
import RoleBadge from '../../Widgets/Badges/RoleBadge';
import Spinner from '../../Widgets/Spinner/Spinner';
import './Header.css';

export default function Header() {
  const { isValid, user } = useUser();
  const { isLoading, isAuthenticated, loginWithRedirect, logout } = useAuth0();
  const navigate = useNavigate();
  return (
    <div className="h__container">
      <Link to="/" className="h__logo">
        <img
          className="h__logoimage"
          src="/images/logo64.png"
          alt="JimCo Logo"
        />
      </Link>
      <div className="h__welcome">Welcome to the JimCo Employee Portal</div>
      <div className="h__linkcontainer">
        {isLoading && (
          <span>
            <Spinner /> Loading...
          </span>
        )}
        {!isLoading && isAuthenticated && !isValid && (
          <span>
            <Spinner /> Loading&nbsp;User...
          </span>
        )}
        {!isLoading &&
          (isValid && isAuthenticated ? (
            <div className="h__buttoncontainer">
              <RoleBadge />
              <div className="h__name">{user?.displayName}</div>
              <button
                type="button"
                className="headerfooterbutton"
                onClick={() => navigate('/Profile')}
              >
                <span>
                  <MdSettings /> Profile
                </span>
              </button>
              <button
                type="button"
                className="headerfooterbutton"
                onClick={() => logout({ returnTo: window.location.origin })}
              >
                <span>
                  <MdLogout /> Sign&nbsp;Out
                </span>
              </button>
            </div>
          ) : (
            <div className="h__buttoncontainer">
              <button
                type="button"
                className="headerfooterbutton"
                onClick={loginWithRedirect}
              >
                <span>
                  <MdLogin /> Sign&nbsp;In
                </span>
              </button>
            </div>
          ))}
      </div>
    </div>
  );
}
