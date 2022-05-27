import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { IUserModel } from '../Interfaces/IUserModel';
import { getUserModel } from '../Services/UserService';

type UserContextType = {
  isValid: boolean;
  user: IUserModel | null;
  isVendor: boolean;
  isEmployee: boolean;
  isManager: boolean;
  isAdmin: boolean;
  isManagerPlus: boolean;
  isJimCo: boolean;
};

const UserContext = createContext<UserContextType>({
  isValid: false,
  user: null,
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

function findTitle(titles: string, title: string): boolean {
  return titles.toLowerCase().indexOf(title.toLowerCase()) >= 0;
}

export const UserProvider = ({ children }: Props) => {
  const {
    isLoading,
    isAuthenticated,
    user: auth0User,
    getAccessTokenSilently,
  } = useAuth0();
  const [isValid, setIsValid] = useState<boolean>(false);
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
        const email = auth0User.email;
        if (identifier && email) {
          const user = await getUserModel(
            email,
            identifier,
            await getAccessTokenSilently(),
          );
          if (user) {
            setUser(user);
            const vendor = findTitle(user.jobTitles, 'vendor');
            const employee = findTitle(user.jobTitles, 'employee');
            const manager = findTitle(user.jobTitles, 'manager');
            const admin = findTitle(user.jobTitles, 'admin');
            setIsVendor(vendor);
            setIsEmployee(employee);
            setIsManager(manager);
            setIsAdmin(admin);
            setIsManagerPlus(manager || admin);
            setIsJimCo(employee || manager || admin);
            setIsValid(true);
          } else {
            console.error(
              "Failed to retrieve user with email '" +
                email +
                "' and identifier '" +
                identifier +
                "'",
            );
          }
        }
      }
    }
    getUser();
  }, [isLoading, isAuthenticated, auth0User, getAccessTokenSilently]);
  return (
    <UserContext.Provider
      value={{
        isValid: isValid,
        user: user,
        isVendor: isVendor,
        isEmployee: isEmployee,
        isManager: isManager,
        isAdmin: isAdmin,
        isManagerPlus: isManagerPlus,
        isJimCo: isJimCo,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);

export default UserContext;
