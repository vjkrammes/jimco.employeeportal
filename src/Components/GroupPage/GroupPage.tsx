import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import {
  MdHome,
  MdAdd,
  MdSearch,
  MdSave,
  MdCancel,
  MdDelete,
} from 'react-icons/md';
import { FaArrowAltCircleLeft, FaArrowAltCircleRight } from 'react-icons/fa';
import { v4 as uuidv4 } from 'uuid';
import { useAuth0 } from '@auth0/auth0-react';
import { useUser } from '../../Contexts/UserContext';
import { useAlert } from '../../Contexts/AlertContext';
import { IUserModel } from '../../Interfaces/IUserModel';
import { ICompleteGroup } from '../../Interfaces/ICompleteGroup';
import { getCompleteGroups } from '../../Services/GroupService';
import { getUsers } from '../../Services/UserService';
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
  const [allGroups, setAllGroups] = useState<ICompleteGroup[]>([]);
  const [groups, setGroups] = useState<ICompleteGroup[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<ICompleteGroup | null>(
    null,
  );
  const [loading, setLoading] = useState<boolean>(true);
  const { isAuthenticated, getAccessTokenSilently } = useAuth0();
  const { isManagerPlus } = useUser();
  const navigate = useNavigate();
  const {
    register: userRegister,
    handleSubmit: handleUserSubmit,
    watch: userWatch,
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
  function doUserSearch(data: UserFormData) {}
  function doGroupSearch(data: GroupFormData) {}
  function groupSelected(group: ICompleteGroup) {
    setSelectedGroup(group);
    setUsersInGroup(group.users);
    let notin = [...allUsers];
    group.users.forEach((x) => {
      let ix = notin.findIndex((y) => y.id === x.id);
      notin.splice(ix, 1);
    });
    setUsersNotInGroup(notin);
  }
  function clearSelectedGroup() {
    setSelectedGroup(null);
    setUsersInGroup(null);
    setUsersNotInGroup(null);
  }
  return (
    <div className="container">
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
          onClick={() => {}}
        >
          <span>
            <MdAdd /> Create
          </span>
        </button>
      </div>
      <div className="gp__content">
        <div className="gp__container">
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
                <button className="squarebutton" type="submit">
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
                  onClick={() => {}}
                  title="Save Changes"
                  disabled={!selectedGroup}
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
                  onClick={() => {}}
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
                        onClick={() => {}}
                        buttonTitle="Remove from group"
                        buttonContent={
                          <span>
                            <FaArrowAltCircleRight />
                          </span>
                        }
                        height="30px"
                      />
                    </div>
                  ))}
              </>
            )}
          </div>
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
                />
                <button className="squarebutton" type="submit">
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
                      onClick={() => {}}
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
