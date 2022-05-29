// hooks
import {
  useState,
  useEffect,
  ChangeEvent,
  Dispatch,
  SetStateAction,
  useCallback,
} from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { useUser } from '../../Contexts/UserContext';
import { useAlert } from '../../Contexts/AlertContext';
import { useForm } from 'react-hook-form';
// icons
import {
  MdHome,
  MdCancel,
  MdSave,
  MdSearch,
  MdSpeakerNotes,
  MdClear,
  MdList,
  MdClose,
  MdCheck,
} from 'react-icons/md';
import {
  FaPlus,
  FaUserCog,
  FaUserClock,
  FaUserSecret,
  FaStoreAlt,
} from 'react-icons/fa';
// interfaces
import { IApiResponse } from '../../Interfaces/IApiResponse';
import { IGroup } from '../../Interfaces/IGroup';
import { ISaveResult } from '../../Interfaces/ISaveResult';
import { IUserModel } from '../../Interfaces/IUserModel';
// local services
import { getUsers, createUser } from '../../Services/UserService';
import { readGroup, addUserToGroup } from '../../Services/GroupService';
import { capitalize } from '../../Services/tools';
// widgets
import SaveResultsWidget from '../../Widgets/SaveResults/SaveResultsWidget';
import Spinner from '../../Widgets/Spinner/Spinner';
import EmployeeWidget from '../../Widgets/Employee/EmployeeWidget';
import NoteWidget from '../../Widgets/Note/NoteWidget';
import EditEmployeeWidget from '../../Widgets/Employee/EditEmployeeWidget';
import PinnedEmployeeWidget from '../../Widgets/Employee/PinnedEmployeeWidget';
// css
import './EmployeePage.css';

type FormData = {
  search: string;
};

type CreateData = {
  email: string;
  firstName: string;
  lastName: string;
  displayName: string;
  isVendor: boolean;
  isEmployee: boolean;
  isManager: boolean;
  isAdmin: boolean;
};

type Props = {
  setEmployeeList: Dispatch<SetStateAction<IUserModel[] | null>>;
};

export default function EmployeePage({ setEmployeeList }: Props) {
  const [employees, setEmployees] = useState<IUserModel[] | null>(null);
  const [pinnedEmployees, setPinnedEmployees] = useState<IUserModel[]>([]);
  const [matchedEmployees, setMatchedEmployees] = useState<IUserModel[] | null>(
    null,
  );
  const [selectedEmployee, setSelectedEmployee] = useState<IUserModel | null>(
    null,
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [groupName, setGroupName] = useState<string>('');
  const [saveResults, setSaveResults] = useState<ISaveResult[]>([]);
  const [token, setToken] = useState<string>('');
  const { setAlert } = useAlert();
  const { isAuthenticated, getAccessTokenSilently } = useAuth0();
  const { isManagerPlus } = useUser();
  const navigate = useNavigate();
  const savedialog = document.getElementById('pinnedresultsdialog');
  const createdialog = document.getElementById('createmodal');
  const { register, handleSubmit, watch, reset } = useForm<FormData>({
    mode: 'onBlur',
    defaultValues: {
      search: '',
    },
  });
  const {
    register: createRegister,
    handleSubmit: handleCreateSubmit,
    watch: createWatch,
    reset: createReset,
    setValue: createSetvalue,
  } = useForm<CreateData>({
    mode: 'onBlur',
    defaultValues: {
      email: '',
      firstName: '',
      lastName: '',
      displayName: '',
      isVendor: false,
      isEmployee: true,
      isManager: false,
      isAdmin: false,
    },
  });
  const doGetUsers = useCallback(async () => {
    setLoading(true);
    if (token) {
      const users = await getUsers(token);
      if (users) {
        setEmployees(users);
      }
    }
    setLoading(false);
  }, [token]);
  useEffect(() => {
    async function doGetToken() {
      const t = await getAccessTokenSilently();
      setToken(t);
    }
    if (!isAuthenticated || !isManagerPlus) {
      navigate('/Home');
    }
    doGetToken();
    doGetUsers();
  }, [
    navigate,
    isAuthenticated,
    isManagerPlus,
    getAccessTokenSilently,
    doGetUsers,
  ]);
  //
  // ******** PIN BLOCK RELATED FUNCTIONS ********
  //
  // Pin a user to the pin block
  //
  function pin(user: IUserModel) {
    if (user) {
      if (!pinnedEmployees.find((x) => x.id === user.id)) {
        setPinnedEmployees([...pinnedEmployees, user]);
      } else {
        setAlert('User is already pinned', 'warning');
      }
    }
  }
  //
  // Unpin a user from the pin block
  //
  function unpin(user: IUserModel) {
    const index = pinnedEmployees.findIndex((x) => x.id === user.id);
    if (index >= 0) {
      pinnedEmployees.splice(index, 1);
      setPinnedEmployees([...pinnedEmployees]);
    }
  }
  //
  // save pinned user(s) to a group
  //
  async function saveToGroup() {
    setSaveResults([]);
    if (pinnedEmployees && pinnedEmployees.length > 0) {
      for (let i = 0; i < pinnedEmployees.length; i++) {
        const result = await addUserToGroup(
          pinnedEmployees[i].identifier,
          groupName,
          token,
        );
        if (!result.ok) {
          const apiresult = result.body as IApiResponse;
          setSaveResults([
            ...saveResults,
            {
              user: pinnedEmployees[i].displayName,
              success: false,
              error: apiresult.message,
            },
          ]);
        } else {
          setSaveResults([
            ...saveResults,
            { user: pinnedEmployees[i].displayName, success: true, error: '' },
          ]);
        }
      }
      // @ts-ignore
      savedialog.showModal();
    }
  }
  //
  // close the save resultd dialog
  //
  function closeResultsDialog() {
    // @ts-ignore
    savedialog.close();
    setSaveResults([]);
  }
  //
  // load users from a group to the pin block
  //
  async function loadFromGroup() {
    if (groupName) {
      let notadded = false;
      const response = await readGroup(groupName, token);
      if (response === null) {
        setAlert('Group not found', 'info');
      } else if (response.ok) {
        const group = response.body as IGroup;
        if (group && group.users && group.users.length > 0) {
          let newusers = [...pinnedEmployees];
          for (let i = 0; i < group.users.length; i++) {
            if (!newusers.find((x) => x.id === group.users[i].id)) {
              newusers = [...newusers, group.users[i]];
            } else {
              notadded = true;
            }
          }
          setPinnedEmployees([...newusers]);
          if (notadded) {
            setAlert(
              'One of more of the group members was alredy pinned',
              'info',
              5000,
            );
          }
        }
      } else {
        const result = response.body as IApiResponse;
        setAlert(
          result?.message
            ? result.message
            : `Unexpected Error (${result.code || 0})`,
          'error',
          5000,
        );
      }
    }
  }
  //
  // send alert to pinned user(s)
  //
  function sendAlerts() {
    setEmployeeList(pinnedEmployees);
    navigate('/SendAlert');
  }
  //
  // handle changes to the group name input
  //
  function groupNameChanged(event: ChangeEvent<HTMLInputElement>) {
    setGroupName(event.target.value);
  }
  //
  // ******** EMPLOYEE SEARCH RELATED FUNCTIONS ********
  //
  // returns true if the user's first name, last name, display name or email contain the search text
  //
  function match(user: IUserModel, t: string): boolean {
    const txt = t.toLowerCase();
    if (user.firstName.toLowerCase().indexOf(txt) >= 0) {
      return true;
    }
    if (user.lastName.toLowerCase().indexOf(txt) >= 0) {
      return true;
    }
    if (user.displayName.toLowerCase().indexOf(txt) >= 0) {
      return true;
    }
    if (user.email.toLowerCase().indexOf(txt) >= 0) {
      return true;
    }
    return false;
  }
  //
  // search for users matching the search text and add to matched users array
  //
  function doSearch(data: FormData) {
    setMatchedEmployees(null);
    if (employees && data.search) {
      const matches = employees.filter((x) => match(x, data.search));
      if (matches && matches.length > 0) {
        setMatchedEmployees(matches);
      }
    }
  }
  //
  // clear the matched user list
  //
  async function clearSearch(reload?: boolean) {
    setMatchedEmployees(null);
    setSelectedEmployee(null);
    reset({
      search: '',
    });
    if (reload) {
      await doGetUsers();
    }
  }
  //
  // functions related to create user
  //
  function firstNameChanged(e: ChangeEvent<HTMLInputElement>) {
    if (e && e.target && e.target.value) {
      createSetvalue(
        'displayName',
        `${capitalize(e.target.value)} ${capitalize(createWatch('lastName'))}`,
        { shouldDirty: true, shouldTouch: true },
      );
    }
  }
  function lastNameChanged(e: ChangeEvent<HTMLInputElement>) {
    if (e && e.target && e.target.value) {
      createSetvalue(
        'displayName',
        `${capitalize(createWatch('firstName'))} ${capitalize(e.target.value)}`,
        { shouldDirty: true, shouldTouch: true },
      );
    }
  }
  function doCreate() {
    createReset({
      email: '',
      firstName: '',
      lastName: '',
      displayName: '',
      isVendor: false,
      isEmployee: true,
      isManager: false,
      isAdmin: false,
    });
    // @ts-ignore
    createdialog.showModal();
    document.getElementById('email')?.focus();
  }
  async function doCreateUser(data: CreateData) {
    const roles: string[] = [];
    if (data.isVendor) {
      roles.push('Vendor');
    }
    if (data.isEmployee) {
      roles.push('Employee');
    }
    if (data.isManager) {
      roles.push('Manager');
    }
    if (data.isAdmin) {
      roles.push('Admin');
    }
    const jobs = JSON.stringify(roles);
    let user: IUserModel = {
      ...data,
      jobTitles: jobs,
      dateJoined: new Date().toISOString(),
      id: '',
      identifier: '',
    };
    user.firstName = capitalize(data.firstName);
    user.lastName = capitalize(data.lastName);
    const response = await createUser(user, token);
    if (response && response.ok) {
      // @ts-ignore
      createdialog.close();
      await doGetUsers();
      setAlert('User Created Successfully', 'info');
      return;
    }
    if (response && !response.ok && response.body) {
      setAlert((response.body as IApiResponse).message, 'error', 5000);
      return;
    }
    setAlert(`Unexpected Error (${response.code || 0})`, 'error', 5000);
  }
  function doResetUser() {
    createReset({
      email: '',
      firstName: '',
      lastName: '',
      displayName: '',
      isVendor: false,
      isEmployee: true,
      isManager: false,
      isAdmin: false,
    });
    document.getElementById('email')?.focus();
  }
  function cancelCreateUser() {
    // @ts-ignore
    createdialog.close();
  }
  //
  // ******** TSX ********
  //
  return (
    <div className="container">
      {/* Dialog for user creation */}
      <dialog className="modal createmodal" id="createmodal">
        <div className="cm__container">
          <form
            className="cm__form"
            onSubmit={handleCreateSubmit(doCreateUser)}
          >
            <div className="formitem">
              <label className="formlabel" htmlFor="email">
                Email<span className="redstar">*</span>
              </label>
              <input
                className="forminput"
                type="email"
                id="email"
                {...createRegister('email')}
                placeholder="Email"
                required
              />
            </div>
            <div className="formitem">
              <label className="formlabel" htmlFor="firstName">
                First&nbsp;Name<span className="redstar">*</span>
              </label>
              <input
                className="forminput"
                type="text"
                id="firstName"
                {...createRegister('firstName')}
                placeholder="First Name"
                onChange={firstNameChanged}
                required
              />
            </div>
            <div className="formitem">
              <label className="formlabel" htmlFor="lastName">
                Last&nbsp;Name<span className="redstar">*</span>
              </label>
              <input
                className="forminput"
                type="text"
                id="lastName"
                {...createRegister('lastName')}
                placeholder="Last Name"
                onChange={lastNameChanged}
                required
              />
            </div>
            <div className="formitem">
              <label className="formlabel" htmlFor="displayName">
                Display&nbsp;Name<span className="redstar">*</span>
              </label>
              <input
                className="forminput"
                type="text"
                id="displayName"
                {...createRegister('displayName')}
                placeholder="Display Name"
                required
              />
            </div>
            <div className="formitem">
              <label className="formlabel">Roles</label>
              <div className="forminput">
                <div className="ce__rolelist">
                  <div className="ce__vendortick">
                    <label className="ce__label">
                      <input
                        className="ce__tick"
                        type="checkbox"
                        {...createRegister('isVendor')}
                      />
                      <FaStoreAlt title="Vendor" />
                    </label>
                  </div>
                  <div className="ce__employeetick">
                    <label className="ce__label">
                      <input
                        className="ce__tick"
                        type="checkbox"
                        {...createRegister('isEmployee')}
                      />
                      <FaUserClock title="Employee" />
                    </label>
                  </div>
                  <div className="ce__managertick">
                    <label className="ce__label">
                      <input
                        className="ce__tick"
                        type="checkbox"
                        {...createRegister('isManager')}
                      />
                      <FaUserCog title="Manager" />
                    </label>
                  </div>
                  <div className="ce__admintick">
                    <label className="ce__label">
                      <input
                        className="ce__tick"
                        type="checkbox"
                        {...createRegister('isAdmin')}
                      />
                      <FaUserSecret title="Admin" />
                    </label>
                  </div>
                </div>
              </div>
            </div>
            <div className="buttoncontainer">
              <button className="primarybutton" type="submit">
                <span>
                  <MdCheck /> Create
                </span>
              </button>
              <button
                className="secondarybutton"
                type="button"
                onClick={doResetUser}
              >
                <span>
                  <MdClear /> Reset
                </span>
              </button>
              <button
                className="secondarybutton"
                type="button"
                onClick={cancelCreateUser}
              >
                <span>
                  <MdCancel /> Cancel
                </span>
              </button>
            </div>
          </form>
        </div>
      </dialog>
      {/* Dialog box for reporting 'save to group' results */}
      <dialog className="modal pinnedresultsdialog" id="pinnedresultsdialog">
        <div className="prdbody">
          <div className="prdheader">
            <div className="prdheading">Save Operation Results</div>
          </div>
          <div className="prdmessages">
            {saveResults && saveResults.length > 0 && (
              <div className="prdresultlist">
                <SaveResultsWidget results={saveResults} />
              </div>
            )}
          </div>
          <button
            className="primarybutton prdclosebutton"
            onClick={closeResultsDialog}
          >
            <span>
              <MdClose /> Close
            </span>
          </button>
        </div>
      </dialog>
      {/* page header with home and create buttons */}
      <div className="header">
        <div className="heading">Manage Users</div>
        <button
          className="primarybutton headerbutton-left"
          onClick={() => navigate('/Home')}
        >
          <span>
            <MdHome /> Home
          </span>
        </button>
        <button
          className="secondarybutton headerbutton-right"
          type="button"
          onClick={doCreate}
        >
          <span>
            <FaPlus /> Create
          </span>
        </button>
      </div>
      {loading && (
        <div className="loading">
          <Spinner /> Loading...
        </div>
      )}
      {!loading && (
        <div className="content">
          <div className="ep__body">
            {/* Notification Block */}
            <div className="ep__noteblock ep__bordered">
              <NoteWidget />
            </div>
            {/* Employee Search Block */}
            <div className="ep__searchblock ep__bordered">
              <div className="ep__sb__form">
                <form onSubmit={handleSubmit(doSearch)}>
                  <div className="ep__sb__formitem">
                    <label htmlFor="search" className="ep__sb__formlabel">
                      Search
                    </label>
                    <input
                      {...register('search')}
                      type="search"
                      className="ep__sb__forminput"
                      placeholder="User name or email"
                    />
                    <button
                      type="submit"
                      className="ep__sb__formbutton"
                      disabled={!watch('search')}
                    >
                      <span>
                        <MdSearch />
                      </span>
                    </button>
                    <button
                      type="button"
                      className="ep__sb__formbutton"
                      disabled={
                        !matchedEmployees || matchedEmployees.length === 0
                      }
                      onClick={async () => clearSearch()}
                    >
                      <span>
                        <MdClear />
                      </span>
                    </button>
                  </div>
                </form>
              </div>
              <div className="ep__sb__matches">
                {matchedEmployees &&
                  matchedEmployees.length > 0 &&
                  matchedEmployees.map((x) => (
                    <div className="ep__sb__employee" key={x.id}>
                      <EmployeeWidget
                        user={x}
                        pin={pin}
                        setSelectedEmployee={setSelectedEmployee}
                      />
                    </div>
                  ))}
                {(!matchedEmployees || matchedEmployees.length === 0) && (
                  <div className="ep__sb__nomatches">No Matching Users</div>
                )}
              </div>
            </div>
            {/* Edit Employee Block */}
            <div className="ep__editblock ep__bordered">
              <EditEmployeeWidget
                user={selectedEmployee}
                setSelectedUser={setSelectedEmployee}
                onSave={() => clearSearch(true)}
              />
            </div>
            {/* Pinned Employees Block */}
            <div className="ep__pinblock ep__bordered">
              <div className="ep__pb__header">
                <div className="ep__pb__heading">Pinned Users</div>
                <button
                  className="ep__pb__button"
                  onClick={sendAlerts}
                  disabled={!pinnedEmployees || pinnedEmployees.length === 0}
                >
                  <span>
                    <MdSpeakerNotes /> Alert
                  </span>
                </button>
                <button
                  className="ep__pb__button"
                  onClick={() => setPinnedEmployees([])}
                  disabled={!pinnedEmployees || pinnedEmployees.length === 0}
                >
                  <span>
                    <MdCancel /> Clear
                  </span>
                </button>
              </div>
              <div className="ep__pb__pinlist">
                {(!pinnedEmployees || pinnedEmployees.length === 0) && (
                  <div className="ep__pb__nopinned">No Pinned Users</div>
                )}
                {pinnedEmployees &&
                  pinnedEmployees.length > 0 &&
                  pinnedEmployees.map((x) => (
                    <div className="ep__pb__name" key={x.id}>
                      <PinnedEmployeeWidget user={x} onRemove={unpin} />
                    </div>
                  ))}
              </div>
              <div className="ep__pb__footer">
                <div className="ep__pb__groupform">
                  <input
                    type="search"
                    className="ep__pb__groupinput"
                    value={groupName}
                    onChange={groupNameChanged}
                    placeholder="Group Name"
                  />
                </div>
                <div className="ep__pb__footerbuttons">
                  <button
                    className="ep__pb__button"
                    onClick={saveToGroup}
                    disabled={
                      !groupName ||
                      !pinnedEmployees ||
                      pinnedEmployees.length === 0
                    }
                  >
                    <span>
                      <MdSave />
                      Save&nbsp;to&nbsp;Group
                    </span>
                  </button>
                  <button
                    className="ep__pb__button"
                    onClick={loadFromGroup}
                    disabled={!groupName}
                  >
                    <span>
                      <MdList />
                      Load&nbsp;From&nbsp;Group
                    </span>
                  </button>
                  <button
                    className="ep__pb__button"
                    onClick={() => navigate('/Groups')}
                  >
                    <span>
                      <FaUserCog /> Manage&nbsp;Groups
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
