import { Dispatch, SetStateAction } from 'react';
import { MdPushPin, MdEdit } from 'react-icons/md';
import { IUserModel } from '../../Interfaces/IUserModel';
import RoleBadge from '../Badges/RoleBadge';
import './EmployeeWidget.css';

type Props = {
  user: IUserModel;
  pin: (user: IUserModel) => void;
  setSelectedEmployee: Dispatch<SetStateAction<IUserModel | null>>;
};

export default function EmployeeWidget({
  user,
  pin,
  setSelectedEmployee,
}: Props) {
  return (
    <div className="ew__container">
      <div className="ew__roles">
        <RoleBadge />
      </div>
      <div className="ew__name">{user.displayName}</div>
      <div className="ew__buttoncontainer">
        <button className="ew__button" onClick={() => pin(user)}>
          <span>
            <MdPushPin /> Pin
          </span>
        </button>
        <button
          className="ew__button"
          onClick={() => setSelectedEmployee(user)}
          disabled={!user.identifier}
          title={
            user.identifier
              ? 'Edit User'
              : 'A User who has never logged in cannot be edited'
          }
        >
          <span>
            <MdEdit /> Edit
          </span>
        </button>
      </div>
    </div>
  );
}
