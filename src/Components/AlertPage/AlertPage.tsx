import React, { useCallback, useEffect, useState } from 'react';
import { MdClose, MdHome, MdDelete } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { useUser } from '../../Contexts/UserContext';
import { useAlert } from '../../Contexts/AlertContext';
import { IAlert } from '../../Interfaces/IAlert';
import { IAlertIdentity } from '../../Interfaces/IAlertIdentity';
import { IAlertResponse } from '../../Interfaces/IAlertResponse';
import {
  getAlerts,
  deleteAlert,
  acknowledgeAlert,
  deleteAllAlerts,
} from '../../Services/AlertService';
import { isSuccessResult } from '../../Services/tools';
import AlertListItemWidget from '../../Widgets/Alert/AlertListItemWidget';
import AlertDetails from '../../Widgets/Alert/AlertDetails';
import HideWidget from '../../Widgets/Hide/HideWidget';
import Spinner from '../../Widgets/Spinner/Spinner';
import './AlertPage.css';

export default function AlertPage() {
  const [loading, setLoading] = useState<boolean>(true);
  const [alerts, setAlerts] = useState<IAlertResponse | null>(null);
  const [selectedAlert, setSelectedAlert] = useState<IAlert | null>(null);
  const [token, setToken] = useState<string>('');
  const { isAuthenticated, getAccessTokenSilently } = useAuth0();
  const { isAdmin, user } = useUser();
  const { setAlert } = useAlert();
  const navigate = useNavigate();
  const modal = document.getElementById('alert__modal');
  const loadAlerts = useCallback(async () => {
    if (user) {
      setLoading(true);
      const identity: IAlertIdentity = {
        identifier: user.identifier,
        roles: JSON.parse(user.jobTitles),
      };
      const response = await getAlerts(
        identity,
        await getAccessTokenSilently(),
      );
      if (response) {
        setAlerts(response);
        setLoading(false);
      } else {
        setAlerts(null);
      }
    } else {
      setAlerts(null);
    }
  }, [user, getAccessTokenSilently]);
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/Home');
    }
  }, [isAuthenticated, navigate]);
  useEffect(() => {
    async function doGetToken() {
      const t = await getAccessTokenSilently();
      setToken(t);
    }
    async function doGetAlerts() {
      await loadAlerts();
    }
    doGetToken();
    doGetAlerts();
    if (user && !isAdmin) {
      modal?.addEventListener('cancel', blockEscape);
    }
    return () => modal?.removeEventListener('cancel', blockEscape);
  }, [navigate, user, modal, isAdmin, loadAlerts, getAccessTokenSilently]);
  function blockEscape(event: Event) {
    event.preventDefault();
  }
  function pluralize(count: number, base: string): string {
    if (count === 1) {
      return count + ' ' + base;
    }
    return count + ' ' + base + 's';
  }
  function showAlert(alert: IAlert) {
    if (alert) {
      setSelectedAlert(alert);
      // @ts-ignore
      modal.showModal();
    } else {
      setSelectedAlert(null);
    }
  }
  async function delAlert(alert: IAlert) {
    if (alert.requiresAcknowledgement && !alert.acknowledged) {
      setAlert(
        'Alert must be acknowledged before it can be deleted',
        'error',
        5000,
      );
    } else {
      const result = await deleteAlert(alert, token);
      if (isSuccessResult(result)) {
        setAlert('Alert deleted', 'info');
        await loadAlerts();
        closeModal();
      } else {
        setAlert(result.message, 'error', 5000);
      }
    }
  }
  async function ackAlert(alert: IAlert) {
    if (!alert.requiresAcknowledgement) {
      setAlert('Alert does not require acknowledgement', 'error', 5000);
      return;
    }
    if (alert.acknowledged) {
      setAlert(
        `Alert was already acknowledged on ${new Date(
          alert.acknowledgedOn,
        ).toLocaleDateString()}`,
        'error',
        5000,
      );
      return;
    }
    const result = await acknowledgeAlert(alert, token);
    if (isSuccessResult(result)) {
      setAlert('Alert acknowledged', 'info');
      await loadAlerts();
      closeModal();
    } else {
      setAlert(result.message, 'error', 5000);
    }
  }
  function closeModal() {
    // @ts-ignore
    modal.close();
  }
  async function clearAllAlerts() {
    if (user) {
      const response = await deleteAllAlerts(user.identifier, token);
      if (response.code === 0) {
        setAlert(
          'All alerts which do not require acknowledgement have been deleted',
          'info',
          5000,
        );
        await loadAlerts();
      } else {
        setAlert(response.message, 'error', 5000);
      }
    }
  }
  return (
    <div className="container">
      <dialog className="modal" id="alert__modal">
        <div className="alert__body">
          <AlertDetails alert={selectedAlert!} acknowledge={ackAlert} />
          <div className="buttoncontainer">
            <button
              type="button"
              className="primarybutton"
              onClick={closeModal}
              disabled={
                selectedAlert?.requiresAcknowledgement &&
                !selectedAlert.acknowledged
              }
            >
              <span>
                <MdClose /> Close
              </span>
            </button>
            {selectedAlert?.identifier &&
              (!selectedAlert.requiresAcknowledgement ||
                selectedAlert.acknowledged) && (
                <button
                  type="button"
                  className="secondarybutton"
                  onClick={async () => await delAlert(selectedAlert)}
                >
                  <span>
                    <MdDelete /> Delete
                  </span>
                </button>
              )}
          </div>
        </div>
      </dialog>
      <div className="header">
        <div className="heading">Your Alerts and Notifications</div>
        <button
          className="primarybutton headerbutton-left"
          onClick={() => navigate('/Home')}
        >
          <span>
            <MdHome /> Home
          </span>
        </button>
      </div>
      <div className="content">
        {loading && (
          <div className="loading">
            <Spinner /> Loading...
          </div>
        )}
        {!loading &&
          (!alerts ||
            (alerts.alerts.length === 0 && alerts.notices.length === 0)) && (
            <div className="noitemsfound">
              You have no Alerts or Notifications
            </div>
          )}
        {!loading &&
          alerts &&
          (alerts.alerts.length !== 0 || alerts.notices.length !== 0) && (
            <div className="alert__alertlist">
              <HideWidget
                label="Alerts"
                content={
                  <div className="flex-row spread-row">
                    <span>
                      You have {pluralize(alerts.alerts.length, 'Alert')}
                    </span>
                    <button
                      className="secondarybutton"
                      onClick={clearAllAlerts}
                      disabled={
                        !alerts || !alerts.alerts || alerts.alerts.length === 0
                      }
                      title="Delete all Acknowleded Alerts"
                    >
                      <span>
                        <MdDelete /> Delete All
                      </span>
                    </button>
                  </div>
                }
              >
                {alerts.alerts.length &&
                  alerts.alerts.map((x) => (
                    <div key={x.id} className="alert__alertitem">
                      <AlertListItemWidget
                        alert={x}
                        handler={() => showAlert(x)}
                      />
                    </div>
                  ))}
              </HideWidget>
              <HideWidget
                label="Notices"
                content={`You have ${pluralize(
                  alerts.notices.length,
                  'Notice',
                )}`}
              >
                {alerts.notices.map((x) => (
                  <div key={x.id} className="alert__alertitem">
                    <AlertListItemWidget
                      alert={x}
                      handler={() => showAlert(x)}
                    />
                  </div>
                ))}
              </HideWidget>
            </div>
          )}
      </div>
    </div>
  );
}
