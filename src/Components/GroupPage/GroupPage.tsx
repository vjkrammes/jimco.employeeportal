import { useState, useEffect, useCallback, ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import {
  MdHome,
  MdAdd,
  MdSearch,
  MdSave,
  MdCancel,
  MdDelete,
  MdCheck,
  MdClose,
} from 'react-icons/md';
import { FaArrowAltCircleLeft, FaArrowAltCircleRight } from 'react-icons/fa';
import { CgRename } from 'react-icons/cg';
import { v4 as uuidv4 } from 'uuid';
import { useAuth0 } from '@auth0/auth0-react';
import { useUser } from '../../Contexts/UserContext';
import { useAlert } from '../../Contexts/AlertContext';
import { IUserModel } from '../../Interfaces/IUserModel';
import { ICompleteGroup } from '../../Interfaces/ICompleteGroup';
import { IUpdateGroupResult } from '../../Interfaces/IUpdateGroupResult';
import {
  deleteGroup,
  getCompleteGroups,
  renameGroup,
  updateGroup,
} from '../../Services/GroupService';
import { getUsers } from '../../Services/UserService';
import { capitalize } from '../../Services/tools';
import Spinner from '../../Widgets/Spinner/Spinner';
import GroupWidget from '../../Widgets/Group/GroupWidget';
import GroupUserWidget from '../../Widgets/Group/GroupUserWidget';
import './GroupPage.css';

type UserFormData = {
  search: string;
};

type GroupFormData = {
  search: string;
};

export default function GroupPage() {
  const [allUsers, setAllUsers] = useState<IUserModel[]>([]);
  const [usersInGroup, setUsersInGroup] = useState<IUserModel[] | null>(null);
  const [usersNotInGroup, setUsersNotInGroup] = useState<IUserModel[] | null>(
    null,
  );
  const [matches, setMatches] = useState<IUserModel[]>([]);
  const [originalUsers, setOriginalUsers] = useState<string[]>([]);
  const [addedUsers, setAddedUsers] = useState<string[]>([]);
  const [removedUsers, setRemovedUsers] = useState<string[]>([]);
  const [changesMade, setChangesMade] = useState<boolean>(false);
  const [allGroups, setAllGroups] = useState<ICompleteGroup[]>([]);
  const [groups, setGroups] = useState<ICompleteGroup[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<ICompleteGroup | null>(
    null,
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [newname, setNewname] = useState<string>('');
  const [action, setAction] = useState<string>('');
  const [saveResults, setSaveResults] = useState<IUpdateGroupResult[]>([]);
  const { isAuthenticated, getAccessTokenSilently } = useAuth0();
  const { isManagerPlus } = useUser();
  const { setAlert } = useAlert();
  const navigate = useNavigate();
  const cdmodal = document.getElementById('cd__modal');
  const rgmodal = document.getElementById('rg__modal');
  const srmodal = document.getElementById('sr__modal');
  const sumodal = document.getElementById('su__modal');
  const {
    register: userRegister,
    handleSubmit: handleUserSubmit,
    watch: userWatch,
    setValue: userSetValue,
  } = useForm<UserFormData>({
    mode: 'onBlur',
    defaultValues: {
      search: '',
    },
  });
  const {
    register: groupRegister,
    handleSubmit: handleGroupSubmit,
    watch: groupWatch,
    setValue: groupSetValue,
  } = useForm<GroupFormData>({
    mode: 'onBlur',
    defaultValues: {
      search: '',
    },
  });
  const doLoadUsers = useCallback(async () => {
    const users = await getUsers(await getAccessTokenSilently());
    setAllUsers(users);
  }, [getAccessTokenSilently]);
  const doLoadGroups = useCallback(async () => {
    const groups = await getCompleteGroups(await getAccessTokenSilently());
    setAllGroups(groups);
    setGroups(groups);
  }, [getAccessTokenSilently]);
  useEffect(() => {
    if (!isAuthenticated || !isManagerPlus) {
      navigate('/Home');
    }
    doLoadUsers();
    doLoadGroups();
    setLoading(false);
  }, [isAuthenticated, isManagerPlus, navigate, doLoadUsers, doLoadGroups]);
  //
  // functions start here
  //
  // User Search
  //
  function doUserSearch(data: UserFormData) {
    if (data && data.search && usersNotInGroup) {
      const st = data.search.toLowerCase();
      const matches = usersNotInGroup.filter(
        (x) =>
          x.displayName.toLowerCase().indexOf(st) >= 0 ||
          x.firstName.toLowerCase().indexOf(st) >= 0 ||
          x.lastName.toLowerCase().indexOf(st) >= 0 ||
          x.email.toLowerCase().indexOf(st) >= 0,
      );
      if (matches && matches.length > 0) {
        setMatches(matches);
        // @ts-ignore
        sumodal.showModal();
      } else {
        setAlert('No matches found', 'warning');
      }
    }
  }
  function closeUserSearch() {
    // @ts-ignore
    sumodal.close();
  }
  //
  // Group Search
  //
  function doGroupSearch(data: GroupFormData) {
    if (data && data.search) {
      const group = allGroups.find(
        (x) => x.name.toLowerCase().indexOf(data.search.toLowerCase()) >= 0,
      );
      if (group) {
        groupSelected(group);
      } else {
        setAlert('No matching group found', 'warning', 5000);
      }
    }
  }
  //
  // create / rename group
  //
  function createClick() {
    setAction('Create');
    setNewname('');
    // @ts-ignore
    rgmodal.showModal();
  }
  function renameClick() {
    if (selectedGroup) {
      setAction('Rename');
      setNewname(selectedGroup.name);
      // @ts-ignore
      rgmodal.showModal();
    }
  }
  function cancelRename() {
    if (action === 'Create') {
      clearSelectedGroup();
    }
    setNewname('');
    // @ts-ignore
    rgmodal.close();
  }
  function groupNameChanged(e: ChangeEvent<HTMLInputElement>) {
    if (e && e.target && e.target.value) {
      setNewname(e.target.value);
    }
  }
  async function doRenameGroup() {
    if (newname) {
      if (selectedGroup && action === 'Rename') {
        const response = await renameGroup(
          selectedGroup?.name,
          newname,
          await getAccessTokenSilently(),
        );
        if (
          response.code === 0 &&
          !response.message &&
          (!response.messages || response.messages.length === 0)
        ) {
          clearSelectedGroup();
          // @ts-ignore
          rgmodal.close();
          doLoadGroups();
          setAlert('Group renamed successfully', 'info');
          return;
        }
        setAlert(response.message, 'error', 5000);
      } else if (action === 'Create') {
        const newgroup: ICompleteGroup = {
          id: '',
          name: capitalize(newname),
          users: [],
        };
        groupSelected(newgroup);
        // @ts-ignore
        rgmodal.close();
      }
    }
  }
  //
  // selected group changed
  //
  function groupSelected(group: ICompleteGroup) {
    setSelectedGroup(group);
    const empty: string[] = [];
    setAddedUsers(empty);
    setRemovedUsers(empty);
    setOriginalUsers(empty);
    setOriginalUsers(group.users.map((x) => x.id));
    setChangesMade(false);
    setUsersInGroup(group.users);
    let notin = [...allUsers];
    group.users.forEach((x) => {
      let ix = notin.findIndex((y) => y.id === x.id);
      notin.splice(ix, 1);
    });
    setUsersNotInGroup(notin);
  }
  //
  // add / remove users
  //
  function addUserToGroup(user: IUserModel) {
    let someInAdded = false;
    let someInRemoved = false;
    // first check if it's alredy in the group
    let ix = usersInGroup!.findIndex((x) => x.id === user.id);
    if (ix >= 0) {
      setAlert('That user is already in the group member list', 'error', 5000);
      return;
    }
    // add user to usersInGroup list
    let newUsers: IUserModel[] = [];
    newUsers = [...usersInGroup!];
    newUsers.push(user);
    setUsersInGroup(newUsers);
    // remove user from usersNotInGroup list
    let notin: IUserModel[] = [];
    notin = [...usersNotInGroup!];
    ix = notin.findIndex((x) => x.id === user.id);
    if (ix >= 0) {
      notin.splice(ix, 1);
      setUsersNotInGroup(notin);
    }
    // remove user from removed users list, if it's in there
    ix = removedUsers.findIndex((x) => x === user.id);
    if (ix >= 0) {
      let removed: string[] = [];
      removed = [...removedUsers];
      removed.splice(ix, 1);
      setRemovedUsers(removed);
      someInRemoved = removed.length > 0;
    }
    // if user is in original users list, do nothing more
    ix = originalUsers.findIndex((x) => x === user.id);
    if (ix >= 0) {
      return;
    }
    // if user is already in added users list, do nothing more
    ix = addedUsers.findIndex((x) => x === user.id);
    if (ix >= 0) {
      return;
    }
    // add user to added users list
    let newIds: string[] = [];
    newIds = [...addedUsers];
    newIds.push(user.id);
    setAddedUsers(newIds);
    someInAdded = newIds.length > 0;
    // set changes made
    setChangesMade(someInAdded || someInRemoved);
  }
  function removeUserFromGroup(user: IUserModel) {
    let someInAdded = false;
    let someInRemoved = false;
    // remove user from usersInGroup list
    let ix = usersInGroup?.findIndex((x) => x.id === user.id);
    if (ix !== undefined && ix >= 0) {
      let usersin: IUserModel[] = [];
      usersin = [...usersInGroup!];
      usersin.splice(ix, 1);
      setUsersInGroup(usersin);
    }
    // add user to usersNotInGroup list
    ix = usersNotInGroup?.findIndex((x) => x.id === user.id);
    if (ix === undefined || ix < 0) {
      let notin: IUserModel[] = [];
      notin = [...usersNotInGroup!];
      notin.push(user);
      setUsersNotInGroup(notin);
    }
    // remove userid from added users list, if it's there
    ix = addedUsers.findIndex((x) => x === user.id);
    if (ix >= 0) {
      let added: string[] = [];
      added = [...addedUsers];
      added.splice(ix, 1);
      setAddedUsers(added);
      someInAdded = added.length !== 0;
    }
    // add userid to removed users list, if it's not there if it's in the original user list
    ix = originalUsers.findIndex((x) => x === user.id);
    if (ix >= 0) {
      ix = removedUsers.findIndex((x) => x === user.id);
      if (ix < 0) {
        let removed: string[] = [];
        removed = [...removedUsers];
        removed.push(user.id);
        setRemovedUsers(removed);
        someInRemoved = removed.length !== 0;
      }
    }
    setChangesMade(someInAdded || someInRemoved);
  }
  async function doSaveChanges() {
    if (selectedGroup) {
      const response = await updateGroup(
        selectedGroup?.name,
        addedUsers,
        removedUsers,
        await getAccessTokenSilently(),
      );
      await doLoadGroups();
      clearSelectedGroup();
      let results: IUpdateGroupResult[] = [];
      results = [...response];
      setSaveResults(results);
      // @ts-ignore
      srmodal.showModal();
    }
  }
  function closeResults() {
    // @ts-ignore
    srmodal.close();
    const results: IUpdateGroupResult[] = [];
    setSaveResults(results);
  }
  //
  // clear the selected group and related values
  //
  function clearSelectedGroup() {
    setSelectedGroup(null);
    const empty: string[] = [];
    setAddedUsers(empty);
    setRemovedUsers(empty);
    setOriginalUsers(empty);
    setChangesMade(false);
    setUsersInGroup(null);
    setUsersNotInGroup(null);
    groupSetValue('search', '');
    userSetValue('search', '');
  }
  //
  // delete a group
  //
  function deleteClick() {
    if (selectedGroup) {
      // @ts-ignore
      cdmodal.showModal();
    }
  }
  function cancelDelete() {
    // @ts-ignore
    cdmodal.close();
  }
  async function doDelete() {
    if (selectedGroup) {
      const response = await deleteGroup(
        selectedGroup.name,
        await getAccessTokenSilently(),
      );
      if (
        response.code === 0 &&
        !response.message &&
        (!response.messages || response.messages.length === 0)
      ) {
        const name = selectedGroup.name;
        setSelectedGroup(null);
        await doLoadGroups();
        // @ts-ignore
        cdmodal.close();
        setAlert(`Group ${name} deleted successfully`, 'info');
        return;
      }
      setAlert(response.message, 'error', 5000);
    }
  }
  //
  // tools
  //
  function pluralize(count: number | unknown, item: string): string {
    if (count) {
      if (count === 1) {
        return item;
      }
      return item + 's';
    }
    return '';
  }
  //
  // JSX starts
  //
  return (
    <div className="container">
      {/* Search user results dialog */}
      <dialog className="modal gp__su__modal" id="su__modal">
        <div className="gp__su__container">
          <div className="gp__su__title">User Search Results</div>
          <div className="gp__su__userlist">
            {matches &&
              matches.length > 0 &&
              matches.map((x) => (
                <div className="gp__su__user" key={x.id}>
                  <GroupUserWidget
                    user={x}
                    showRoles={true}
                    onClick={(x) => addUserToGroup(x)}
                    buttonTitle="Add User to group"
                    buttonContent={<MdAdd />}
                    height="30px"
                    buttonDisabled={
                      (usersInGroup?.findIndex((y) => y.id === x.id) || -1) >= 0
                    }
                  />
                </div>
              ))}
            {(!matches || matches.length === 0) && (
              <div className="gp__su__nousers">No Matching Users</div>
            )}
          </div>
          <div className="buttoncontainer">
            <button
              type="button"
              className="primarybutton"
              onClick={closeUserSearch}
            >
              <span>
                <MdClose /> Close
              </span>
            </button>
          </div>
        </div>
      </dialog>
      {/* Save Results dialog */}
      <dialog className="modal gp__sr__modal" id="sr__modal">
        <div className="gp__sr__container">
          <div className="gp__sr__title">Update Results</div>
          <div className="gp__sr__resultscontainer">
            {saveResults &&
              saveResults.length > 0 &&
              saveResults.map((x) => (
                <div className="gp__sr__result" key={uuidv4()}>
                  {x.name} ... {<span>{x.result}</span>}
                </div>
              ))}
            {!saveResults ||
              (saveResults.length === 0 && (
                <div className="gp__sr__noresults">No Results Available</div>
              ))}
          </div>
          <div className="buttoncontainer">
            <button
              className="primarybutton"
              type="button"
              onClick={closeResults}
            >
              <span>
                <MdCheck /> Close
              </span>
            </button>
          </div>
        </div>
      </dialog>
      {/* Create / Rename Group Dialog */}
      <dialog className="modal gp__rg__modal" id="rg__modal">
        <div className="gp__rg__container">
          <div className="gp__rg__title">{action} Group</div>
          <input
            type="text"
            className="forminput gp__rg__input"
            value={newname}
            onChange={groupNameChanged}
            placeholder="Group Name"
          />
          <div className="buttoncontainer">
            <button
              className="primarybutton"
              type="button"
              onClick={doRenameGroup}
            >
              <span>
                <MdCheck /> Save
              </span>
            </button>
            <button
              className="secondarybutton"
              type="button"
              onClick={cancelRename}
            >
              <span>
                <MdCancel /> Cancel
              </span>
            </button>
          </div>
        </div>
      </dialog>
      {/* Confirm Delete Dialog */}
      <dialog className="modal gp__cd__modal" id="cd__modal">
        <div className="gp__cd__container">
          <div className="gp__cd__title">
            Delete Group {selectedGroup?.name}?
          </div>
          <div className="gp__cd__message">
            The group has {selectedGroup?.users.length}{' '}
            {pluralize(selectedGroup?.users.length, 'member')}. This action
            cannot be undone.
          </div>
          <div className="buttoncontainer">
            <button
              type="button"
              className="primarybutton"
              onClick={cancelDelete}
            >
              <span>
                <MdCancel /> No
              </span>
            </button>
            <button
              type="button"
              className="secondarybutton dangerbutton"
              onClick={doDelete}
            >
              <span>
                <MdCheck /> Yes
              </span>
            </button>
          </div>
        </div>
      </dialog>
      {/* Main body starts here */}
      {/* Header */}
      <div className="header">
        <div className="heading">Manage Groups</div>
        <button
          className="primarybutton headerbutton-left"
          type="button"
          onClick={() => navigate('/Home')}
        >
          <span>
            <MdHome /> Home
          </span>
        </button>
        <button
          className="secondarybutton headerbutton-right"
          type="button"
          onClick={createClick}
        >
          <span>
            <MdAdd /> Create
          </span>
        </button>
      </div>
      {/* Body */}
      <div className="gp__content">
        {/* Unsaved Changes Warning Banner */}
        {changesMade && (
          <div className="gp__warningbanner">Unsaved changes exist</div>
        )}
        <div className="gp__container">
          {/* Left column: Groups */}
          <div className="gp__column gp__left">
            <div className="gp__columnheader">Groups</div>
            <form
              onSubmit={handleGroupSubmit(doGroupSearch)}
              className="gp__firstline"
            >
              <div className="formitem">
                <input
                  className="forminput"
                  type="search"
                  {...groupRegister('search')}
                  placeholder="Search Groups"
                />
                <button
                  className="squarebutton"
                  type="submit"
                  disabled={!groupWatch('search')}
                >
                  <MdSearch />
                </button>
              </div>
            </form>
            <div className="gp__grouplistcontainer">
              {loading && (
                <div className="loading">
                  <Spinner /> Loading...
                </div>
              )}
              {!loading &&
                groups &&
                groups.length > 0 &&
                groups.map((x) => (
                  <GroupWidget
                    key={uuidv4()}
                    group={x}
                    onClick={groupSelected}
                    height="30px"
                  />
                ))}
            </div>
          </div>
          {/* Middle column: selected group and group members */}
          <div className="gp__column gp__middle">
            <div className="gp__columnheader">Selected Group</div>
            <div className="gp__firstline gp__groupcontainer">
              {selectedGroup && (
                <div className="gp__groupname gp__groupitem">
                  {selectedGroup.name}
                </div>
              )}
              {!selectedGroup && (
                <div className="gp__nogroup gp__groupitem">
                  No Group Selected
                </div>
              )}
              <div className="buttoncontainer gap-3">
                <button
                  className="squarebutton"
                  type="button"
                  onClick={renameClick}
                  title="Rename Group"
                  disabled={!selectedGroup}
                >
                  <CgRename />
                </button>
                <button
                  className="squarebutton"
                  type="button"
                  onClick={doSaveChanges}
                  title="Save Changes"
                  disabled={!selectedGroup || !changesMade}
                >
                  <MdSave />
                </button>
                <button
                  className="squarebutton"
                  type="button"
                  onClick={clearSelectedGroup}
                  title="Clear Selection"
                  disabled={!selectedGroup}
                >
                  <MdCancel />
                </button>
                <button
                  className="squarebutton dangerbutton"
                  type="button"
                  onClick={deleteClick}
                  title="Delete Group"
                  disabled={!selectedGroup}
                >
                  <MdDelete />
                </button>
              </div>
            </div>
            {selectedGroup && (
              <>
                {(!usersInGroup || usersInGroup.length === 0) && (
                  <div className="gp__nousers">No Members</div>
                )}
                {usersInGroup &&
                  usersInGroup.length > 0 &&
                  usersInGroup.map((x) => (
                    <div key={x.id}>
                      <GroupUserWidget
                        user={x}
                        showRoles={true}
                        onClick={(x) => removeUserFromGroup(x)}
                        buttonTitle="Remove from group"
                        buttonContent={
                          <span>
                            <FaArrowAltCircleRight />
                          </span>
                        }
                        buttonDisabled={usersInGroup.length === 1}
                        height="30px"
                      />
                    </div>
                  ))}
              </>
            )}
          </div>
          {/* Right column: non-member users */}
          <div className="gp__column gp__right">
            <div className="gp__columnheader">Users</div>
            <form
              onSubmit={handleUserSubmit(doUserSearch)}
              className="gp__firstline"
            >
              <div className="formitem">
                <input
                  className="forminput"
                  type="search"
                  {...userRegister('search')}
                  placeholder="Search Users"
                  disabled={!usersNotInGroup || usersNotInGroup.length === 0}
                />
                <button
                  className="squarebutton"
                  type="submit"
                  disabled={!userWatch('search')}
                >
                  <MdSearch />
                </button>
              </div>
            </form>
            <div className="gp__userlistcontainer">
              {usersNotInGroup &&
                usersNotInGroup.length > 0 &&
                usersNotInGroup.map((x) => (
                  <div key={x.id}>
                    <GroupUserWidget
                      user={x}
                      showRoles={true}
                      onClick={(x) => addUserToGroup(x)}
                      buttonTitle="Add to group"
                      buttonContent={<FaArrowAltCircleLeft />}
                      height="30px"
                    />
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
