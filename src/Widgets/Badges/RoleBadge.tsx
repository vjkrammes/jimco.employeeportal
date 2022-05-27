import { useUser } from '../../Contexts/UserContext';
import {
  FaUserCog,
  FaUserClock,
  FaUserSecret,
  FaStoreAlt,
} from 'react-icons/fa';
import './RoleBadge.css';

export default function RoleBadge() {
  const { isValid, isVendor, isEmployee, isManager, isAdmin } = useUser();
  if (!isValid) {
    return <></>;
  }
  return (
    <div className="rb__container">
      {isVendor && <FaStoreAlt title="User has Vendor role" />}
      {isEmployee && <FaUserClock title="User has Employee role" />}
      {isManager && <FaUserCog title="User has Manager role" />}
      {isAdmin && <FaUserSecret title="User has Admin role" />}
    </div>
  );
}
