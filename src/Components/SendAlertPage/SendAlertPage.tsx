import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { MdCancel, MdEmail, MdHome, MdClear } from 'react-icons/md';
import { IUserModel } from '../../Interfaces/IUserModel';
import { IAlertResult } from '../../Interfaces/IAlertResult';
import { IAlert } from '../../Interfaces/IAlert';
import { useAuth0 } from '@auth0/auth0-react';
import { useUser } from '../../Contexts/UserContext';
import { createAlert } from '../../Services/AlertService';
import { alertLevelFromValue } from '../../Services/tools';
import { IApiResponse } from '../../Interfaces/IApiResponse';
import AlertResultsWidget from '../../Widgets/Alert/AlertResultsWidget';
import Spinner from '../../Widgets/Spinner/Spinner';
import './SendAlertPage.css';

type Props = {
  employeeList: IUserModel[] | null;
};

type FormData = {
  level: number;
  title: string;
  text: string;
  requiresAcknowledgement: boolean;
};

export default function SendAlertPage({ employeeList }: Props) {
  const [results, setResults] = useState<IAlertResult[]>([]);
  const [sent, setSent] = useState<number>(0);
  const { isAuthenticated, getAccessTokenSilently } = useAuth0();
  const { isManagerPlus, user } = useUser();
  const navigate = useNavigate();
  const { register, handleSubmit, reset, watch } = useForm<FormData>({
    mode: 'onBlur',
    defaultValues: {
      level: 0,
      title: '',
      text: '',
      requiresAcknowledgement: false,
    },
  });
  useEffect(() => {
    if (!isAuthenticated || !isManagerPlus) {
      navigate('/Home');
    }
  }, [navigate, isManagerPlus, isAuthenticated]);
  useEffect(() => {
    reset({
      level: 0,
      title: '',
      text: '',
      requiresAcknowledgement: false,
    });
    if (employeeList && employeeList.length > 0) {
      const r: IAlertResult[] = [];
      employeeList.map((x) => r.push({ name: x.displayName, message: '' }));
      setResults([...r]);
    }
  }, [employeeList, reset]);
  function resetForm() {
    reset({
      level: 0,
      title: '',
      text: '',
      requiresAcknowledgement: false,
    });
    setResults([]);
    setSent(0);
  }
  function setResult(name: string, message: string) {
    const r = !results || results.length === 0 ? [] : [...results];
    const entry = r.find((x) => x.name === name);
    if (entry) {
      entry.message = message;
    }
    setResults([...r]);
  }
  async function formClick(data: FormData) {
    if (employeeList) {
      setResults([]);
      setSent(0);
      for (let i = 0; i < employeeList.length; i++) {
        const alert: IAlert = {
          id: '',
          level: Number(data.level),
          roles: '',
          identifier: employeeList[i].identifier,
          title: data.title,
          text: data.text,
          createDate: new Date().toISOString(),
          creator: user!.email,
          startDate: '0001-01-01',
          endDate: '0001-01-01',
          requiresAcknowledgement: data.requiresAcknowledgement,
          acknowledged: false,
          acknowledgedOn: '0001-01-01',
        };
        const result = await createAlert(alert, await getAccessTokenSilently());
        if (result && result.ok) {
          setSent(sent + 1);
          setResult(employeeList[i].displayName, 'success');
        } else {
          setResult(
            employeeList[i].displayName,
            (result?.body as IApiResponse)?.message,
          );
        }
      }
    }
  }
  return (
    <div className="container">
      <div className="header">
        <div className="heading">Send an Alert</div>
        <button
          type="button"
          className="primarybutton headerbutton-left"
          onClick={() => navigate('/Home')}
        >
          <span>
            <MdHome /> Home
          </span>
        </button>
      </div>
      <div className="content">
        {(!employeeList || employeeList.length === 0) && (
          <div className="noitemsfound">No Employees Selected</div>
        )}
        {employeeList && employeeList.length > 0 && (
          <div className="sap__alertform">
            <form className="form" onSubmit={handleSubmit(formClick)}>
              <div className="sap__formbody">
                <div className="sap__formheader">Alert Details</div>
                <div className="formitem">
                  <label className="formlabel" htmlFor="level">
                    Level
                  </label>
                  <select
                    className="forminput sap__levelselect"
                    id="level"
                    {...register('level')}
                  >
                    <option key={0} value={0}>
                      {alertLevelFromValue(0)}
                    </option>
                    <option key={1} value={1}>
                      {alertLevelFromValue(1)}
                    </option>
                    <option key={2} value={2}>
                      {alertLevelFromValue(2)}
                    </option>
                  </select>
                </div>
                <div className="formitem">
                  <label
                    className="formlabel"
                    htmlFor="requiresAcknowledgement"
                  >
                    Require&nbsp;Acknowledgement
                  </label>
                  <input
                    className="forminput sap__racheck"
                    type="checkbox"
                    {...register('requiresAcknowledgement')}
                  />
                </div>
                <div className="formitem">
                  <label className="formlabel" htmlFor="title">
                    Title
                  </label>
                  <input
                    className="forminput"
                    id="title"
                    {...register('title')}
                    placeholder="Title"
                  />
                </div>
                <div className="formitem">
                  <label className="formlabel" htmlFor="text">
                    Text
                  </label>
                  <textarea
                    className="forminput sap__text"
                    id="text"
                    {...register('text')}
                    placeholder="Alert Text"
                  />
                </div>
                <div className="buttoncontainer">
                  <button
                    className="primarybutton sap__okbutton"
                    type="submit"
                    disabled={!watch('title') || !watch('text')}
                  >
                    <span>
                      <MdEmail /> Send
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="secondarybutton sap__resetbutton"
                  >
                    <span>
                      <MdClear /> Reset
                    </span>
                  </button>
                  <button
                    className="secondarybutton sap__cancelbutton"
                    type="button"
                    onClick={() => navigate('/Employees')}
                  >
                    <span>
                      <MdCancel /> Back
                    </span>
                  </button>
                  <button
                    className="secondarybutton sap__homebutton"
                    type="button"
                    onClick={() => navigate('/Home')}
                  >
                    <span>
                      <MdHome /> Home
                    </span>
                  </button>
                </div>
              </div>
            </form>
            <div className="sap__recipients">
              <div className="sap__r__heading">Recipient(s)</div>
              <div className="sap__r__list">
                <AlertResultsWidget results={results!}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'center',
                    }}
                  >
                    <Spinner /> Sending
                  </div>
                </AlertResultsWidget>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
