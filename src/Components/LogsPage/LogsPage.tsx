import { useState, useEffect, ChangeEvent, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import {
  MdArrowLeft,
  MdArrowRight,
  MdClear,
  MdClose,
  MdHome,
  MdSearch,
} from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { useUser } from '../../Contexts/UserContext';
import { ILogModel } from '../../Interfaces/ILogModel';
import { get, dates } from '../../Services/LogService';
import { v4 as uuidv4 } from 'uuid';
import { toLevel, prettify } from '../../Services/tools';
import Spinner from '../../Widgets/Spinner/Spinner';
import Pager from '../../Widgets/Pager/Pager';
import LogWidget from '../../Widgets/Log/LogWidget';
import './LogsPage.css';

type FormData = {
  date: Date | string | undefined;
};

type Props = {
  itemsPerPage: number;
};

export default function LogsPage({ itemsPerPage }: Props) {
  const [logDates, setLogDates] = useState<Date[]>([]);
  const [allLogs, setAllLogs] = useState<ILogModel[]>([]);
  const [logs, setLogs] = useState<ILogModel[]>([]);
  const [selectedLog, setSelectedLog] = useState<ILogModel | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [highestPage, setHighestPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(12);
  const { isAuthenticated, getAccessTokenSilently } = useAuth0();
  const { isAdmin } = useUser();
  const navigate = useNavigate();
  const modal = document.getElementById('lp__modal');
  const { register, handleSubmit, watch, reset } = useForm<FormData>({
    mode: 'onBlur',
    defaultValues: {
      date: new Date(),
    },
  });
  useEffect(() => {
    if (!isAuthenticated || !isAdmin) {
      navigate('/Home');
    }
  }, [isAuthenticated, isAdmin, navigate]);
  useEffect(() => {
    async function doGetDates() {
      const ret = await dates(await getAccessTokenSilently());
      setLogDates(ret || []);
    }
    doGetDates();
  }, [getAccessTokenSilently]);
  const doLoadLogs = useCallback(async () => {
    setLoading(true);
    const l = await get(await getAccessTokenSilently());
    if (l) {
      setAllLogs(l);
    }
    setLoading(false);
    setCurrentPage(1);
  }, [getAccessTokenSilently]);
  useEffect(() => {
    doLoadLogs();
    setCurrentPage(1);
    setPageSize(itemsPerPage <= 0 ? 8 : itemsPerPage > 20 ? 8 : itemsPerPage);
    setHighestPage(Math.ceil(allLogs.length / pageSize));
  }, [itemsPerPage, pageSize, allLogs.length, doLoadLogs]);
  useEffect(() => {
    const offset = (currentPage - 1) * pageSize;
    setLogs(allLogs.slice(offset, offset + pageSize));
  }, [allLogs, pageSize, currentPage]);
  function pageChanged(newPage: number) {
    if (newPage >= 1 && newPage <= highestPage) {
      setCurrentPage(newPage);
    }
  }
  function locateLog(date: string) {
    const firstlog = allLogs.find(
      (x) => new Date(x.timestamp).toISOString().split('T')[0] === date,
    );
    if (firstlog) {
      const ix = allLogs.findIndex((x) => x.id === firstlog?.id);
      if (ix > -1) {
        const newpage = Math.floor(ix / pageSize) + 1;
        setCurrentPage(newpage);
      }
    }
  }
  function dateChanged(e: ChangeEvent<HTMLSelectElement>) {
    if (e && e.target && e.target.value) {
      locateLog(e.target.value);
    }
  }
  function doSearch(data: FormData) {
    if (data && data.date) {
      locateLog(new Date(data.date).toISOString().split('T')[0]);
    }
  }
  function doReset() {
    reset({
      date: '',
    });
    setCurrentPage(1);
  }
  function showDetails(log: ILogModel) {
    setSelectedLog(null);
    if (log) {
      setSelectedLog(log);
      // @ts-ignore
      modal.showModal();
    }
  }
  function closeModal() {
    // @ts-ignore
    modal.close();
    setSelectedLog(null);
  }
  return (
    <div className="container">
      <dialog className="modal lp__modal" id="lp__modal">
        <div className="lp__m__container">
          <div className="lp__m__heading">Log Details</div>
          <div className="lp__m__detailscontainer">
            <div className="lp__m__item">
              <div className="lp__m__label">Id</div>
              <div className="lp__m__value">{selectedLog?.id}</div>
            </div>
            <div className="lp__m__item">
              <div className="lp__m__label">Timestamp</div>
              <div className="lp__m__value">
                {new Date(selectedLog?.timestamp || '')?.toString()}
              </div>
            </div>
            <div className="lp__m__item">
              <div className="lp__m__label">Level</div>
              <div className="lp__m__value">
                {toLevel(selectedLog?.level || 0)}
              </div>
            </div>
            <div className="lp__m__item">
              <div className="lp__m__label">IP</div>
              <div className="lp__m__value">{selectedLog?.ip}</div>
            </div>
            <div className="lp__m__item">
              <div className="lp__m__label">Identifier</div>
              <div className="lp__m__value">{selectedLog?.identifier}</div>
            </div>
            <div className="lp__m__item">
              <div className="lp__m__label">Source</div>
              <div className="lp__m__value">{selectedLog?.source}</div>
            </div>
            <div className="lp__m__item">
              <div className="lp__m__label">Description</div>
              <div className="lp__m__value">{selectedLog?.description}</div>
            </div>
            <div className="lp__m__details">
              <div className="lp__m__d__heading">Log Item Details</div>
              <div className="lp__m__d__content">
                <pre>{prettify(selectedLog?.data || '')}</pre>
              </div>
            </div>
          </div>
          <div className="buttoncontainer">
            <button
              className="primarybutton"
              onClick={closeModal}
              type="button"
            >
              <span>
                <MdClose /> Close
              </span>
            </button>
          </div>
        </div>
      </dialog>
      <div className="header">
        <div className="heading">Logs</div>
        <div
          className="primarybutton headerbutton-left"
          onClick={() => navigate('/Home')}
        >
          <span>
            <MdHome /> Home
          </span>
        </div>
      </div>
      <div className="content">
        <Pager
          numItems={allLogs.length}
          itemsPerPage={pageSize}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          prevButtonContent={
            <span className="lp__pagerbuttoncontent">
              <MdArrowLeft /> Prev
            </span>
          }
          nextButtonContent={
            <span className="lp__pagerbuttoncontent">
              Next <MdArrowRight />
            </span>
          }
          onPageChanged={pageChanged}
          showPages={true}
          onReset={() => {
            doLoadLogs();
          }}
        >
          <div className="lp__pagercontent">
            <div className="lp__pc__searchform">
              <div className="lp__pc__name">Search</div>
              <form className="lp__pc__form" onSubmit={handleSubmit(doSearch)}>
                <div className="formitem">
                  <input
                    type="date"
                    className="forminput"
                    {...register('date')}
                  />
                  <button
                    type="submit"
                    className="squarebutton"
                    disabled={!watch('date')}
                  >
                    <MdSearch />
                  </button>
                </div>
              </form>
              <span>Or Select:</span>
              <select
                className="forminput"
                defaultValue="0"
                onChange={dateChanged}
              >
                <option key={uuidv4()} value="0">
                  Select a Date
                </option>
                {logDates.map((x) => (
                  <option
                    key={uuidv4()}
                    value={new Date(x).toISOString().split('T')[0]}
                  >
                    {new Date(x).toISOString().split('T')[0]}
                  </option>
                ))}
              </select>
              <button
                className="squarebutton space-left"
                onClick={doReset}
                title="Reset"
              >
                <MdClear />
              </button>
            </div>
          </div>
        </Pager>
        {loading && (
          <div className="loading">
            <Spinner /> Loading...
          </div>
        )}
        {!loading && (!logs || logs.length === 0) && (
          <div className="noitemsfound">No Logs Found</div>
        )}
        {!loading && logs && logs.length > 0 && (
          <div className="lp__body">
            <div className="lp__logscontainer">
              {logs.map((x) => (
                <LogWidget key={uuidv4()} log={x} onDetails={showDetails} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
