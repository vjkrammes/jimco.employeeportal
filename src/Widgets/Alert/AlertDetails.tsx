import { useState, useEffect } from 'react';
import { IAlert } from '../../Interfaces/IAlert';
import { RoleList } from '../RoleList/RoleList';
import { getNameFromEmail } from '../../Services/UserService';
import { useAuth0 } from '@auth0/auth0-react';
import './AlertDetails.css';

type Props = {
  alert: IAlert;
  acknowledge: (alert: IAlert) => void;
};

export default function AlertDetails({ alert, acknowledge }: Props) {
  const [name, setName] = useState<string>('');
  const [token, setToken] = useState<string>('');
  const { isLoading, getAccessTokenSilently } = useAuth0();
  useEffect(() => {
    async function getToken() {
      if (!isLoading) {
        const t = await getAccessTokenSilently();
        if (t) {
          setToken(t);
        }
      }
    }
    getToken();
  }, [isLoading, getAccessTokenSilently]);
  useEffect(() => {
    async function getName() {
      if (!isLoading && alert && token) {
        const n = await getNameFromEmail(alert.creator, token);
        setName(n);
      }
    }
    getName();
  }, [isLoading, alert, token]);
  function displayDate(date: Date): string {
    if (date && date.getFullYear() >= 2020) {
      return date.toLocaleDateString();
    }
    return '';
  }
  if (!alert) {
    return <></>;
  }
  return (
    <div className="ald__container">
      <div className="ald__header">
        <div className="ald__heading">
          {alert.identifier && 'Alert'}
          {!alert.identifier && 'Notification'}
        </div>
        {!alert.identifier && (
          <div className="ald__roles">
            <RoleList roles={alert.roles} className="ald__rolelist" />
          </div>
        )}
      </div>
      <div className="ald__details">
        <div className="ald__griddate" title="Date created">
          {new Date(alert.createDate).toLocaleDateString()}
        </div>
        <div className="ald__gridcreator" title="Author">
          {name}
        </div>
        <div className="ald__gridtitle" title="Title">
          {alert.title}
        </div>
        <div className="ald__gridtext" title="Message">
          {alert.text}
        </div>
        <div className="ald__gridstart" title="Notice valid from">
          {displayDate(new Date(alert.startDate))}
        </div>
        <div className="ald__gridend" title="Notice valid to">
          {displayDate(new Date(alert.endDate))}
        </div>
        <div className="ald__ra" title="Alert requires acknowledgement">
          {alert.requiresAcknowledgement && (
            <span>
              <img
                className="ald__checkmark"
                src="/images/checkmark-32.png"
                alt="Alert requires acknowledgement"
              />{' '}
              Requires Acknowledgement
            </span>
          )}
        </div>
        <div className="ald__ack" title="Alert has been acknowledged">
          {alert.requiresAcknowledgement && alert.acknowledged && (
            <span>
              <img
                className="ald__checkmark"
                src="/images/checkmark-32.png"
                alt="Alert has been acknowledged"
              />{' '}
              Acknowledged
            </span>
          )}
        </div>
        <div className="ald__ackdate" title="Acknowledgment date">
          {alert.requiresAcknowledgement &&
            displayDate(new Date(alert.acknowledgedOn))}
        </div>
        {alert.requiresAcknowledgement && (
          <button
            type="button"
            className="secondarybutton ald__ackbutton"
            disabled={!alert.requiresAcknowledgement || alert.acknowledged}
            onClick={() => acknowledge(alert)}
          >
            <span>Acknowledge</span>
          </button>
        )}
      </div>
    </div>
  );
}
