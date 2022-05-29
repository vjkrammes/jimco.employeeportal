import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import {
  MdCancel,
  MdHome,
  MdThumbDown,
  MdThumbUp,
  MdSave,
  MdDelete,
} from 'react-icons/md';
import { IAlert } from '../../Interfaces/IAlert';
import { useAuth0 } from '@auth0/auth0-react';
import { useUser } from '../../Contexts/UserContext';
import { useAlert } from '../../Contexts/AlertContext';
import { getNameFromEmail } from '../../Services/UserService';
import {
  getAllAlerts,
  deleteAlert,
  updateAlert,
  deleteExpired,
} from '../../Services/AlertService';
import { alertLevel, getAudience } from '../../Services/tools';
import Spinner from '../../Widgets/Spinner/Spinner';
import MgrNotificationListItem from '../../Widgets/Manager/MgrNotificationListItem';
import './NoticesPage.css';
import { FaPlus } from 'react-icons/fa';

type FormData = {
  title: string;
  text: string;
};

export default function NoticesPage() {
  const [allAlerts, setAllAlerts] = useState<IAlert[] | null>(null);
  const [notifications, setNotifications] = useState<IAlert[] | null>(null);
  const [selectedAlert, setSelectedAlert] = useState<IAlert | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [forVendors, setForVendors] = useState<boolean>(false);
  const [forEmployees, setForEmployees] = useState<boolean>(false);
  const [forManagers, setForManagers] = useState<boolean>(false);
  const [forAdmins, setForAdmins] = useState<boolean>(false);
  const [creator, setCreator] = useState<string>('');
  const [token, setToken] = useState<string>('');
  const { isAuthenticated, getAccessTokenSilently } = useAuth0();
  const { isManagerPlus } = useUser();
  const { setAlert } = useAlert();
  const { register, handleSubmit, reset, watch } = useForm<FormData>({
    mode: 'onBlur',
    defaultValues: {
      title: selectedAlert?.title,
      text: selectedAlert?.text,
    },
  });
  const navigate = useNavigate();
  const deleteDialog = document.getElementById('np__deletedialog');
  const editDialog = document.getElementById('np__editdialog');
  const loadAlerts = useCallback(async () => {
    setLoading(true);
    const result = await getAllAlerts(await getAccessTokenSilently());
    setAllAlerts(result);
    setLoading(false);
  }, [getAccessTokenSilently]);
  useEffect(() => {
    async function doGetToken() {
      const t = await getAccessTokenSilently();
      setToken(t);
    }
    async function doLoadAlerts() {
      await loadAlerts();
    }
    if (!isAuthenticated || !isManagerPlus) {
      navigate('/Home');
    }
    doGetToken();
    doLoadAlerts();
  }, [
    isManagerPlus,
    navigate,
    isAuthenticated,
    getAccessTokenSilently,
    loadAlerts,
  ]);
  useEffect(() => {
    if (allAlerts) {
      const n = allAlerts.filter((x) => x.identifier === '');
      setNotifications(n);
    }
  }, [allAlerts]);
  useEffect(() => {
    async function getCreatorName() {
      if (selectedAlert) {
        setCreator(
          (await getNameFromEmail(selectedAlert.creator, token)) ||
            selectedAlert.creator,
        );
      } else {
        setCreator('');
      }
    }
    if (selectedAlert) {
      const r = selectedAlert.roles.toLowerCase();
      setForVendors(r.indexOf('vendor') >= 0);
      setForEmployees(r.indexOf('employee') >= 0);
      setForManagers(r.indexOf('manager') >= 0);
      setForAdmins(r.indexOf('admins') >= 0);
      reset({
        title: selectedAlert.title,
        text: selectedAlert.text,
      });
    } else {
      setForVendors(false);
      setForEmployees(false);
      setForManagers(false);
      setForAdmins(false);
      reset({
        title: '',
        text: '',
      });
    }
    getCreatorName();
  }, [selectedAlert, reset, token]);
  async function confirmDelete() {
    if (selectedAlert) {
      const response = await deleteAlert(selectedAlert, token);
      if (response.code === 0) {
        setAlert('Notification Deleted', 'info');
        await loadAlerts();
      } else {
        setAlert(response.message, 'error', 5000);
      }
    }
    // @ts-ignore
    deleteDialog.close();
  }
  function cancelDelete() {
    // @ts-ignore
    deleteDialog.close();
  }
  function deleteClick(alert: IAlert) {
    setSelectedAlert(alert);
    // @ts-ignore
    deleteDialog.showModal();
  }
  function editClick(alert: IAlert) {
    setSelectedAlert(alert);
    // @ts-ignore
    editDialog.showModal();
  }
  async function submitClick(data: FormData) {
    const alert: IAlert = {
      ...selectedAlert!,
      title: data.title,
      text: data.text,
    };
    const response = await updateAlert(alert, token);
    if (response.code === 0) {
      await loadAlerts();
      setSelectedAlert(null);
      setAlert('Alert Updated', 'info');
      // @ts-ignore
      editDialog.close();
      return;
    }
    setAlert(response.message, 'error', 5000);
  }
  function cancelEdit() {
    setSelectedAlert(null);
    // @ts-ignore
    editDialog.close();
  }
  async function deleteAllExpired() {
    await deleteExpired(token);
    await loadAlerts();
    setAlert('All Expired Notices Deleted', 'info');
  }
  return (
    <div className="container">
      <dialog className="modal np__deletedialog" id="np__deletedialog">
        <div className="np__dd__body">
          {selectedAlert && (
            <div className="np__dd__content">
              <div className="np__dd__header">
                <div className="np__dd__heading">
                  Delete the selected dialog?
                </div>
              </div>
              <div className="np__dd__details">
                <div className="np__dd__item">
                  <div className="np__dd__label">Level</div>
                  <div className="np__dd__value">
                    {alertLevel(selectedAlert)}
                  </div>
                </div>
                <div className="np__dd__item">
                  <div className="np__dd__label">Audience</div>
                  <div className="np__dd__value">
                    {getAudience(
                      forVendors,
                      forEmployees,
                      forManagers,
                      forAdmins,
                      'np__dd',
                    )}
                  </div>
                </div>
                <div className="np__dd__item">
                  <div className="np__dd__label">Created</div>
                  <div className="np__dd__value">
                    {new Date(selectedAlert.createDate).toLocaleDateString()}
                  </div>
                </div>
                <div className="np__dd__item">
                  <div className="np__dd__label">Creator</div>
                  <div className="np__dd__value">{creator}</div>
                </div>
                <div className="np__dd__item">
                  <div className="np__dd__label">Title</div>
                  <div className="np__dd__value">{selectedAlert.title}</div>
                </div>
                <div className="np__dd__item">
                  <div className="np__dd__label">Text</div>
                  <div className="np__dd__value">{selectedAlert.text}</div>
                </div>
              </div>
            </div>
          )}
          {!selectedAlert && (
            <div className="np__dd__noalert">No Alert Selected</div>
          )}
          <div className="buttoncontainer">
            <button
              className="primarybutton np__dd__okbutton"
              onClick={confirmDelete}
            >
              <span>
                <MdThumbUp /> Yes
              </span>
            </button>
            <button
              className="secondarybutton np__dd__cancelbutton"
              onClick={cancelDelete}
            >
              <span>
                <MdThumbDown /> No
              </span>
            </button>
          </div>
        </div>
      </dialog>
      <dialog className="modal np__editdialog" id="np__editdialog">
        <div className="np__ed__container">
          <div className="np__ed__header">
            <div className="np__ed__heading">Edit Notice</div>
          </div>
          <div className="np__ed__body">
            <form onSubmit={handleSubmit(submitClick)}>
              <div className="np__ed__formitem">
                <label className="np__ed__formlabel" htmlFor="title">
                  Title
                </label>
                <input
                  className="np__ed__forminput"
                  id="title"
                  {...register('title')}
                />
              </div>
              <div className="np__ed__formitem">
                <label className="np__ed__formlabel" htmlFor="text">
                  Text
                </label>
                <textarea
                  className="np__ed__forminput np__ed__formtext"
                  id="text"
                  {...register('text')}
                />
              </div>
              <div className="np__ed__buttoncontainer">
                <button
                  className="primarybutton np__ed__savebutton"
                  type="submit"
                  disabled={!watch('title') || !watch('text')}
                >
                  <span>
                    <MdSave /> Save
                  </span>
                </button>
                <button
                  className="secondarybutton np__ed__cancelbutton"
                  type="button"
                  onClick={cancelEdit}
                >
                  <span>
                    <MdCancel /> Cancel
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </dialog>
      <div className="header">
        <div className="heading">Manage Notices</div>
        <button
          className="primarybutton headerbutton-left"
          onClick={() => navigate('/Home')}
        >
          <span>
            <MdHome /> Home
          </span>
        </button>
        <button
          className="secondarybutton headerbutton-right dangerbutton"
          onClick={deleteAllExpired}
          title="Delete all notices that do not require acknowledgement"
        >
          <span>
            <MdDelete /> Expired
          </span>
        </button>
        <button
          className="secondarybutton np__createbutton"
          onClick={() => navigate('/Employees')}
          title="Create a Notice (redirects to the Employees page)"
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
      {!loading && (!notifications || notifications.length === 0) && (
        <div className="noitemsfound">No Notices Found</div>
      )}
      {!loading && notifications && notifications.length > 0 && (
        <div className="content np__body">
          {notifications && notifications.length > 0 && (
            <div className="np__notifications">
              {notifications.map((x) => (
                <MgrNotificationListItem
                  key={x.id}
                  alert={x}
                  editHandler={(alert: IAlert) => {
                    editClick(alert);
                  }}
                  deleteHandler={(alert: IAlert) => deleteClick(alert)}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
