import { ChangeEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdAddBox, MdClear } from 'react-icons/md';
import { FaUserCog } from 'react-icons/fa';
import { useAuth0 } from '@auth0/auth0-react';
import { useUser } from '../../Contexts/UserContext';
import { useAlert } from '../../Contexts/AlertContext';
import { IAlert } from '../../Interfaces/IAlert';
import { createAlert } from '../../Services/AlertService';
import { IApiResponse } from '../../Interfaces/IApiResponse';
import { alertLevelFromValue } from '../../Services/tools';
import './NoteWidget.css';

export default function NoteWidget() {
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [alertLevel, setAlertLevel] = useState<number>(0);
  const [subject, setSubject] = useState<string>('');
  const [text, setText] = useState<string>('');
  const [forVendor, setForVendor] = useState<boolean>(false);
  const [forEmployee, setForEmployee] = useState<boolean>(true);
  const [forManager, setForManager] = useState<boolean>(false);
  const [forAdmin, setForAdmin] = useState<boolean>(false);
  const { user } = useUser();
  const { getAccessTokenSilently } = useAuth0();
  const { setAlert } = useAlert();
  const navigate = useNavigate();
  function resetForm() {
    setStartDate('');
    setEndDate('');
    setSubject('');
    setText('');
    setForVendor(false);
    setForEmployee(true);
    setForManager(false);
    setForAdmin(false);
  }
  async function createNotice() {
    const roles: string[] = [];
    if (forVendor) {
      roles.push('Vendor');
    }
    if (forEmployee) {
      roles.push('Employee');
    }
    if (forManager) {
      roles.push('Manager');
    }
    if (forAdmin) {
      roles.push('Admin');
    }
    const start = startDate === '' ? '0001-01-01T00:00:00' : startDate;
    const end = endDate === '' ? '9999-12-31T23:59:59' : endDate;
    const alert: IAlert = {
      id: '',
      level: alertLevel,
      roles: JSON.stringify(roles),
      identifier: '',
      title: subject,
      text: text,
      createDate: new Date().toISOString(),
      creator: user!.displayName,
      startDate: start,
      endDate: end,
      requiresAcknowledgement: false,
      acknowledged: false,
      acknowledgedOn: '0001-01-01T00:00:00',
    };
    const response = await createAlert(alert, await getAccessTokenSilently());
    if (response.ok) {
      setAlert('Notification created', 'info');
      resetForm();
    } else {
      const result = response.body as IApiResponse;
      setAlert(
        result?.message ? result.message : 'An error occurred',
        'error',
        5000,
      );
    }
  }
  function levelChanged(event: ChangeEvent<HTMLSelectElement>) {
    setAlertLevel(Number(event.target.value));
  }
  return (
    <div className="nw__container">
      <div className="nw__title">Notifications</div>
      <div className="nw__managebuttoncontainer">
        <button
          className="nw__button nw__managebutton nw__smallerbutton"
          onClick={() => navigate('/Notices')}
        >
          <span>
            <FaUserCog /> Manage
          </span>
        </button>
      </div>
      <div className="nw__from">
        <div className="nw__label nw__fromlabel">From</div>
        <div className="nw__frompicker">
          <input
            type="date"
            className="nw__datepicker nw__frompicker"
            value={startDate}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setStartDate(e.target.value)
            }
          />
        </div>
      </div>
      <div className="nw__to">
        <div className="nw__label nw__tolabel">To</div>
        <div className="nw__topicker">
          <input
            type="date"
            className="nw__datepicker nw__topicker"
            value={endDate}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setEndDate(e.target.value)
            }
          />
        </div>
      </div>
      <div className="nw__label nw__levellabel">Level</div>
      <select
        className="nw__levelselect"
        value={alertLevel}
        onChange={levelChanged}
      >
        <option value="0">{alertLevelFromValue(0)}</option>
        <option value="1">{alertLevelFromValue(1)}</option>
        <option value="2">{alertLevelFromValue(2)}</option>
      </select>
      <div className="nw__subject">
        <div className="nw__label nw__subjectlabel">Subject</div>
        <input
          type="text"
          className="nw__subjectinput"
          placeholder="Subject"
          value={subject}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setSubject(e.target.value)
          }
        />
      </div>
      <div className="nw__textinput">
        <textarea
          className="nw__textarea"
          placeholder="Text"
          value={text}
          onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
            setText(e.target.value)
          }
        />
      </div>
      <div className="nw__vendortick">
        <label className="nw__label">
          <input
            type="checkbox"
            checked={forVendor}
            onChange={() => setForVendor(!forVendor)}
          />
          Vendors
        </label>
      </div>
      <div className="nw__employeetick">
        <label className="nw__label">
          <input
            type="checkbox"
            checked={forEmployee}
            onChange={() => setForEmployee(!forEmployee)}
          />
          Employees
        </label>
      </div>
      <div className="nw__managertick">
        <label className="nw__label">
          <input
            type="checkbox"
            checked={forManager}
            onChange={() => setForManager(!forManager)}
          />
          Managers
        </label>
      </div>
      <div className="nw__admintick">
        <label className="nw__label">
          <input
            type="checkbox"
            checked={forAdmin}
            onChange={() => setForAdmin(!forAdmin)}
          />
          Admins
        </label>
      </div>
      <button
        type="button"
        className="secondarybutton nw__resetbutton"
        id="nw__resetbutton"
        onClick={resetForm}
      >
        <span>
          <MdClear /> Reset
        </span>
      </button>
      <button
        type="button"
        className="primarybutton nw__createbutton"
        id="nw__createbutton"
        onClick={createNotice}
        disabled={!subject || !text}
      >
        <span>
          <MdAddBox /> Create
        </span>
      </button>
    </div>
  );
}
