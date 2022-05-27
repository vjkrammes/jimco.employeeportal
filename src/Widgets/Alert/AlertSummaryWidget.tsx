import { useNavigate } from 'react-router-dom';
import { IoNavigateCircle } from 'react-icons/io5';
import { IAlertResponse } from '../../Interfaces/IAlertResponse';
import './AlertSummaryWidget.css';

type Props = {
  alerts: IAlertResponse;
  href: string;
};

export default function AlertSummaryWidget({ alerts, href }: Props) {
  const navigate = useNavigate();
  function pluralize(count: number, base: string): string {
    return count + ' ' + base + (count === 1 ? '' : 's');
  }
  return (
    <div className="asw__container">
      <div className="asw__info">
        {alerts.alerts.length === 0 && alerts.notices.length === 0 && (
          <span className="asw__text">You have no notices or alerts</span>
        )}
        {alerts.alerts.length === 0 && alerts.notices.length !== 0 && (
          <span className="asw__text">
            You have {pluralize(alerts.notices.length, 'Notice')}
          </span>
        )}
        {alerts.alerts.length !== 0 && alerts.notices.length === 0 && (
          <span className="asw__text">
            You have {pluralize(alerts.alerts.length, 'Alert')}
          </span>
        )}
        {alerts.alerts.length !== 0 && alerts.notices.length !== 0 && (
          <span className="asw__text">
            You have {pluralize(alerts.alerts.length, 'Alert')} and{' '}
            {pluralize(alerts.notices.length, 'Notice')}
          </span>
        )}
      </div>
      <button
        disabled={!(alerts.alerts.length !== 0 || alerts.notices.length !== 0)}
        type="button"
        className="primarybutton asw__button"
        onClick={() => navigate(href)}
      >
        <span>
          <IoNavigateCircle /> View
        </span>
      </button>
    </div>
  );
}
