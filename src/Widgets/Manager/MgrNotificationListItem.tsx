import { useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { MdAdd, MdDelete } from 'react-icons/md';
import { FaEdit } from 'react-icons/fa';
import { IAlert } from '../../Interfaces/IAlert';
import { alertIcon, alertLevel } from '../../Services/tools';
import { getNameFromEmail } from '../../Services/UserService';
import { getAudience } from '../../Services/tools';
import './MgrNotificationListItem.css';

type Props = {
  alert: IAlert;
  editHandler: (alert: IAlert) => void;
  deleteHandler: (alert: IAlert) => void;
};

export default function MgrNotificationListItem({
  alert,
  editHandler,
  deleteHandler,
}: Props) {
  const [name, setName] = useState<string>('');
  const [isForVendor, setIsForVendor] = useState<boolean>(false);
  const [isForEmployee, setIsForEmployee] = useState<boolean>(false);
  const [isForManager, setIsForManager] = useState<boolean>(false);
  const [isForAdmin, setIsForAdmin] = useState<boolean>(false);
  const [showText, setShowText] = useState<boolean>(false);
  const [isExpired, setIsExpired] = useState<boolean>(false);
  const { getAccessTokenSilently } = useAuth0();
  useEffect(() => {
    async function getName() {
      const name = await getNameFromEmail(
        alert.creator,
        await getAccessTokenSilently(),
      );
      setName(name || alert.creator);
    }
    getName();
    const r = alert.roles.toLowerCase();
    setIsForVendor(r.indexOf('vendor') >= 0);
    setIsForEmployee(r.indexOf('employee') >= 0);
    setIsForManager(r.indexOf('manager') >= 0);
    setIsForAdmin(r.indexOf('admin') >= 0);
    setIsExpired(new Date(alert.endDate) < new Date());
  }, [alert, getAccessTokenSilently]);
  return (
    <div
      className="mnli__container"
      style={
        isExpired ? { backgroundColor: 'rgba(255,212,17,0.4)' } : undefined
      }
    >
      <div className="mnli__body">
        <div className="mnli__icon">
          <img src={alertIcon(alert)} alt="" title={alertLevel(alert)} />
        </div>
        {getAudience(
          isForVendor,
          isForEmployee,
          isForManager,
          isForAdmin,
          'mnli',
        )}
        <div className="mnli__date">
          {new Date(alert.createDate).toLocaleDateString()}
        </div>
        <div className="mnli__author">{name}</div>
        <div className="mnli__title">{alert.title}</div>
        <div className="mnli__buttoncontainer">
          <button
            className="mnli__button mnli__plus"
            onClick={() => {
              setShowText(!showText);
            }}
            title="View notification text"
          >
            <span>
              <MdAdd />
            </span>
          </button>
          <button
            className="mnli__button mnli__edit"
            onClick={() => editHandler(alert)}
            title="Edit notification"
          >
            <span>
              <FaEdit />
            </span>
          </button>
          <button
            className="mnli__button mnli__danger"
            onClick={() => deleteHandler(alert)}
            title="Delete this notification"
          >
            <span>
              <MdDelete />
            </span>
          </button>
        </div>
      </div>
      {showText && <div className="mnli__text">{alert.text}</div>}
    </div>
  );
}
