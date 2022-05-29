import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdCancel, MdLogout, MdSave } from 'react-icons/md';
import { useForm } from 'react-hook-form';
import { useAuth0 } from '@auth0/auth0-react';
import { useUser } from '../../Contexts/UserContext';
import { useAlert } from '../../Contexts/AlertContext';
import { updateUserModel } from '../../Services/UserService';
import { IChangeProfileModel } from '../../Interfaces/IChangeProfileModel';
import './ProfilePage.css';

type FormData = {
  firstName: string;
  lastName: string;
  displayName: string;
  isEmployee: boolean;
  isManager: boolean;
  isAdmin: boolean;
};

export default function ProfilePage() {
  const { isAuthenticated, getAccessTokenSilently, logout } = useAuth0();
  const { user, isEmployee, isManager, isAdmin } = useUser();
  const { setAlert } = useAlert();
  const navigate = useNavigate();
  const modal = document.getElementById('prof__modal');
  const { register, handleSubmit, reset } = useForm<FormData>({
    mode: 'onBlur',
    defaultValues: {
      firstName: '',
      lastName: '',
      displayName: '',
      isEmployee: true,
      isManager: false,
      isAdmin: false,
    },
  });
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/Home');
    }
  }, [isAuthenticated, navigate]);
  useEffect(() => {
    reset({
      firstName: user?.firstName,
      lastName: user?.lastName,
      displayName: user?.displayName,
      isEmployee: isEmployee,
      isManager: isManager,
      isAdmin: isAdmin,
    });
  }, [reset, user, isEmployee, isManager, isAdmin]);
  async function doSave(data: FormData) {
    const model: IChangeProfileModel = {
      ...data,
      identifier: user!.identifier,
      changeRoles: isManager || isAdmin,
      email: user!.email,
      isVendor: false,
    };
    const result = await updateUserModel(model, await getAccessTokenSilently());
    if (result.ok) {
      setAlert('Profile updated successfully', 'info');
      if (modal) {
        // @ts-ignore
        modal.showModal();
      }
    } else {
      setAlert(result.body?.message, 'error', 5000);
    }
  }
  function goHome() {
    navigate('/Home');
  }
  function doLogout() {
    //@ts-ignore
    modal.close();
    logout({ returnTo: window.location.origin });
    goHome();
  }
  return (
    <div className="container">
      <div className="header">
        <div className="heading">Manage Your Profile</div>
        <button
          className="primarybutton headerbutton-left"
          onClick={goHome}
          type="button"
          title="Cancel"
        >
          <MdCancel /> Cancel
        </button>
      </div>
      <div className="content">
        <dialog className="modal prof__modal" id="prof__modal">
          <div className="prof__modalcontainer">
            <div className="prof__modaltitle">
              Your profile has been updated.
            </div>
            <div className="prof__modalmessage">
              Please sign out to complete the update.
            </div>
            <button type="button" className="primarybutton" onClick={doLogout}>
              <span>
                <MdLogout /> Sign&nbsp;Out
              </span>
            </button>
          </div>
        </dialog>
        <form
          onSubmit={handleSubmit(doSave)}
          className="form-outline prof__editform"
        >
          <div className="formitem prof__headitem">
            <div className="formlabel">Email</div>
            <div className="forminput prof__email">{user?.email}</div>
          </div>
          <div className="formitem">
            <label className="formlabel" htmlFor="firstName">
              First&nbsp;Name
            </label>
            <input
              className="forminput"
              id="firstName"
              {...register('firstName')}
              placeholder="First Name"
            />
          </div>
          <div className="formitem">
            <label className="formlabel" htmlFor="lastName">
              Last&nbsp;Name
            </label>
            <input
              className="forminput"
              id="lastName"
              {...register('lastName')}
              placeholder="Last Name"
            />
          </div>
          <div className="formitem">
            <label className="formlabel" htmlFor="displayName">
              Display&nbsp;Name
            </label>
            <input
              className="forminput"
              id="displayName"
              {...register('displayName')}
              placeholder="Display Name"
            />
          </div>
          {(isManager || isAdmin) && (
            <div className="prof__rolescontainer">
              <div className="formitem">
                <label htmlFor="isEmployee" className="formlabel">
                  Employee
                </label>
                <input
                  className="forminput"
                  id="isEmployee"
                  type="checkbox"
                  {...register('isEmployee')}
                />
              </div>
              <div className="formitem">
                <label htmlFor="isManager" className="formlabel">
                  Manager
                </label>
                <input
                  className="forminput"
                  id="isManager"
                  type="checkbox"
                  {...register('isManager')}
                />
              </div>
              <div className="formitem">
                <label htmlFor="isAdmin" className="formlabel">
                  Admin
                </label>
                <input
                  className="forminput"
                  id="isAdmin"
                  type="checkbox"
                  {...register('isAdmin')}
                />
              </div>
            </div>
          )}
          <div className="buttoncontainer">
            <button className="primarybutton" type="submit">
              <span>
                <MdSave /> Save
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
