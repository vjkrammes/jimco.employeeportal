import {
  Dispatch,
  SetStateAction,
  useState,
  useEffect,
  ChangeEvent,
} from 'react';
import {
  FaUserCog,
  FaUserClock,
  FaUserSecret,
  FaStoreAlt,
} from 'react-icons/fa';
import { MdCancel, MdSave } from 'react-icons/md';
import { useAuth0 } from '@auth0/auth0-react';
import { useAlert } from '../../Contexts/AlertContext';
import { updateUserModel } from '../../Services/UserService';
import { IUserModel } from '../../Interfaces/IUserModel';
import { IChangeProfileModel } from '../../Interfaces/IChangeProfileModel';
import {
  userIsVendor,
  userIsEmployee,
  userIsManager,
  userIsAdmin,
} from '../../Services/tools';
import './EditEmployeeWidget.css';
import { IApiResponse } from '../../Interfaces/IApiResponse';

type Props = {
  user: IUserModel | null;
  setSelectedUser: Dispatch<SetStateAction<IUserModel | null>>;
};

export default function EditEmployeeWidget({ user, setSelectedUser }: Props) {
  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [displayName, setDisplayName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [isVendor, setIsVendor] = useState<boolean>(false);
  const [isEmployee, setIsEmployee] = useState<boolean>(false);
  const [isManager, setIsManager] = useState<boolean>(false);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [helpText, setHelpText] = useState<string>('');
  const { setAlert } = useAlert();
  const { getAccessTokenSilently } = useAuth0();
  useEffect(() => {
    if (user) {
      setFirstName(user.firstName);
      setLastName(user.lastName);
      setDisplayName(user.displayName);
      setEmail(user.email);
      setIsVendor(userIsVendor(user));
      setIsEmployee(userIsEmployee(user));
      setIsManager(userIsManager(user));
      setIsAdmin(userIsAdmin(user));
    } else {
      setFirstName('');
      setLastName('');
      setDisplayName('');
      setEmail('');
      setIsVendor(false);
      setIsEmployee(false);
      setIsManager(false);
      setIsAdmin(false);
    }
  }, [user]);
  function hover(text: string) {
    setHelpText(text);
  }
  async function saveChanges() {
    if (user) {
      const model: IChangeProfileModel = {
        identifier: user.identifier,
        email: email,
        firstName: firstName,
        lastName: lastName,
        displayName: displayName,
        changeRoles: true,
        isVendor: isVendor,
        isEmployee: isEmployee,
        isManager: isManager,
        isAdmin: isAdmin,
      };
      const result = await updateUserModel(
        model,
        await getAccessTokenSilently(),
      );
      if (result.ok) {
        setSelectedUser(null);
        setAlert('User profile updated successfully', 'info');
      } else {
        setAlert(
          'Update failed: ' + (result.body as IApiResponse)?.message,
          'error',
          5000,
        );
      }
    }
  }
  if (!user) {
    return <div className="eew__noemployee">No User Selected</div>;
  }
  return (
    <div className="eew__container">
      <div className="eew__title">ID:&nbsp;{user.id}</div>
      <div className="eew__label eew__firstlabel">
        First<span className="redstar">*</span>
      </div>
      <input
        type="text"
        className="eew__input eew__firstnameinput"
        value={firstName}
        onChange={(e: ChangeEvent<HTMLInputElement>) => {
          setFirstName(e.target.value);
        }}
        placeholder="First Name"
        onMouseOver={() => hover('First Name')}
        onMouseLeave={() => hover('')}
      />
      <div className="eew__label eew__lastlabel">
        Last<span className="redstar">*</span>
      </div>
      <input
        type="text"
        className="eew__input eew__lastnameinput"
        value={lastName}
        onChange={(e: ChangeEvent<HTMLInputElement>) => {
          setLastName(e.target.value);
        }}
        placeholder="Last Name"
        onMouseOver={() => hover('Last Name')}
        onMouseLeave={() => hover('')}
      />
      <div className="eew__label eew__displaylabel">
        Full<span className="redstar">*</span>
      </div>
      <input
        type="text"
        className="eew__input eew__displayinput"
        value={displayName}
        onChange={(e: ChangeEvent<HTMLInputElement>) => {
          setDisplayName(e.target.value);
        }}
        placeholder="Display Name"
        onMouseOver={() => hover('Display Name')}
        onMouseLeave={() => hover('')}
      />
      <div className="eew__label eew__emaillabel">
        Email<span className="redstar">*</span>
      </div>
      <input
        type="email"
        className="eew__input eew__emailinput"
        value={email}
        onChange={(e: ChangeEvent<HTMLInputElement>) => {
          setEmail(e.target.value);
        }}
        placeholder="Email"
        onMouseOver={() => hover('Email Address')}
        onMouseLeave={() => hover('')}
      />
      <div
        className="eew__vendortick"
        onMouseOver={() => hover('User has the Vendor rolw')}
        onMouseLeave={() => hover('')}
      >
        <label className="eew__label">
          <input
            type="checkbox"
            checked={isVendor}
            onChange={() => setIsVendor(!userIsVendor)}
          />
          <FaStoreAlt title="Vendor" />
        </label>
      </div>
      <div
        className="eew__employeetick"
        onMouseOver={() => hover('User has the Employee role')}
        onMouseLeave={() => hover('')}
      >
        <label className="eew__label">
          <input
            type="checkbox"
            checked={isEmployee}
            onChange={() => setIsEmployee(!userIsEmployee)}
          />
          <FaUserClock title="Employee" />
        </label>
      </div>
      <div
        className="eew__managertick"
        onMouseOver={() => hover('User has the Manager role')}
        onMouseLeave={() => hover('')}
      >
        <label className="eew__label">
          <input
            type="checkbox"
            checked={isManager}
            onChange={() => setIsManager(!userIsManager)}
          />
          <FaUserCog title="Manager" />
        </label>
      </div>
      <div
        className="eew__admintick"
        onMouseOver={() => hover('User has the Admin role')}
        onMouseLeave={() => hover('')}
      >
        <label className="eew__label">
          <input
            type="checkbox"
            checked={isAdmin}
            onChange={() => setIsAdmin(!userIsAdmin)}
          />
          <FaUserSecret title="Admin" />
        </label>
      </div>
      <button
        type="button"
        className="primarybutton eew__savebutton"
        onClick={saveChanges}
        onMouseOver={() => hover('Save changes')}
        onMouseLeave={() => hover('')}
      >
        <span>
          <MdSave /> Save
        </span>
      </button>
      <button
        type="button"
        className="secondarybutton eew__cancelbutton"
        onClick={() => {
          setSelectedUser(null);
        }}
        onMouseOver={() => hover('Cancel changes')}
        onMouseLeave={() => hover('')}
      >
        <span>
          <MdCancel /> Cancel
        </span>
      </button>
      <div className="eew__helptext">{helpText}</div>
    </div>
  );
}
