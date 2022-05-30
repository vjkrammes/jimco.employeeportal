import { useState, useEffect } from 'react';
import {
  FaUserCog,
  FaUserClock,
  FaUserSecret,
  FaStoreAlt,
} from 'react-icons/fa';
import {
  userIsVendor,
  userIsEmployee,
  userIsManager,
  userIsAdmin,
} from '../../Services/tools';
import { IUserModel } from '../../Interfaces/IUserModel';
import './UserRoleBadge.css';

type Props = {
  user: IUserModel;
};

export default function UserRoleBadge({ user }: Props) {
  const [isVendor, setIsVendor] = useState<boolean>(false);
  const [isEmployee, setIsEmployee] = useState<boolean>(false);
  const [isManager, setIsManager] = useState<boolean>(false);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  useEffect(() => {
    setIsVendor(userIsVendor(user));
    setIsEmployee(userIsEmployee(user));
    setIsManager(userIsManager(user));
    setIsAdmin(userIsAdmin(user));
  }, [user]);
  return (
    <div className="urb__container">
      {isVendor && <FaStoreAlt title="User has the vendor role" />}
      {!isVendor && <div className="urb__takespace">&nbsp;</div>}
      {isEmployee && <FaUserClock title="User has the employee role" />}
      {!isEmployee && <div className="urb__takespace">&nbsp;</div>}
      {isManager && <FaUserCog title="User has the manager role" />}
      {!isManager && <div className="urb__takespace">&nbsp;</div>}
      {isAdmin && <FaUserSecret title="User has the admin role" />}
      {!isAdmin && <div className="urb__takespace">&nbsp;</div>}
    </div>
  );
}
