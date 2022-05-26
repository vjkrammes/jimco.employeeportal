import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { IUserModel } from '../Interfaces/IUserModel';

const UserContext = createContext({
  getUser: () => {},
  setUser: {},
  isVendor: false,
  isEmployee: false,
  isManager: false,
  isAdmin: false,
  isManagerPlus: false,
  isJimCo: false,
});

type Props = {
  children: JSX.Element;
};

export const UserProvider = ({ children }: Props) => {
  const { isLoading, isAuthenticated, user: auth0User } = useAuth0();
  const [user, setUser] = useState<IUserModel | null>(null);
  const [isVendor, setIsVendor] = useState<boolean>(false);
  const [isEmployee, setIsEmployee] = useState<boolean>(false);
  const [isManager, setIsManager] = useState<boolean>(false);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isManagerPlus, setIsManagerPlus] = useState<boolean>(false);
  const [isJimCo, setIsJimCo] = useState<boolean>(false);
  useEffect(() => {
    async function getUser() {
      if (!isLoading && isAuthenticated && auth0User) {
        const identifier = auth0User.sub;
        if (identifier) {
          //TODO: Load user from user service
        }
      }
    }
    getUser();
  }, [isLoading, isAuthenticated, auth0User]);
  const getUser = () => {
    return user;
  };
  return (
    <UserContext.Provider
      value={{
        getUser,
        setUser,
        isVendor,
        isEmployee,
        isManager,
        isAdmin,
        isManagerPlus,
        isJimCo,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);

export default UserContext;
