import { useState, useEffect } from 'react';
import {
  MdEdit,
  MdDelete,
  MdCancel,
  MdLockClock,
  MdCheckCircle,
  MdRedo,
} from 'react-icons/md';
import { FaPlus, FaMinus, FaQuestionCircle, FaRegClock } from 'react-icons/fa';
import { useAuth0 } from '@auth0/auth0-react';
import { IPromotion } from '../../Interfaces/IPromotion';
import { toCurrency } from '../../Services/tools';
import { getNameFromEmail } from '../../Services/UserService';
import './MgrPromotionWidget.css';

type Props = {
  promotion: IPromotion;
  onEdit: (promotion: IPromotion) => void;
  onCancel: (promotion: IPromotion) => void;
  onUnCancel: (promotion: IPromotion) => void;
  onDelete: (promotion: IPromotion) => void;
};

export default function MgrPromotionWidget({
  promotion,
  onEdit,
  onCancel,
  onUnCancel,
  onDelete,
}: Props) {
  const [showDetails, setShowDetails] = useState<boolean>(false);
  const [isCanceled, setIsCanceled] = useState<boolean>(false);
  const [isExpired, setIsExpired] = useState<boolean>(false);
  const [isCurrent, setIsCurrent] = useState<boolean>(false);
  const [isPending, setIsPending] = useState<boolean>(false);
  const [creator, setCreator] = useState<string>('');
  const [canceller, setCanceller] = useState<string>('');
  const { getAccessTokenSilently } = useAuth0();
  useEffect(() => {
    async function doGetCreatorAndCancellor() {
      const token = await getAccessTokenSilently();
      const name = await getNameFromEmail(promotion.createdBy, token);
      setCreator(name || promotion.createdBy);
      if (promotion.createdBy === promotion.canceledBy) {
        setCanceller(name || promotion.createdBy);
      } else if (promotion.canceledBy) {
        const can = await getNameFromEmail(promotion.canceledBy, token);
        setCanceller(can || promotion.canceledBy);
      } else {
        setCanceller('');
      }
    }
    const now = new Date();
    setIsCanceled(new Date(promotion.canceledOn).getFullYear() >= 2020);
    setIsExpired(new Date(promotion.stopDate) < now);
    setIsPending(new Date(promotion.startDate) > now);
    setIsCurrent(
      new Date(promotion.startDate) <= now &&
        new Date(promotion.stopDate) >= now,
    );
    doGetCreatorAndCancellor();
  }, [promotion, creator, getAccessTokenSilently]);
  function toggleDetails() {
    setShowDetails(!showDetails);
  }
  function getIcon(promotion: IPromotion): JSX.Element | string {
    if (isCanceled) {
      // canceled
      return <MdCancel title="Canceled" style={{ color: 'black' }} />;
    }
    if (isExpired) {
      // expired
      return <MdLockClock title="Expired" style={{ color: 'red' }} />;
    }
    if (isPending) {
      // pending
      return <FaRegClock title="Pending" style={{ color: 'blue' }} />;
    }
    if (isCurrent) {
      // current
      return <MdCheckCircle title="Current" style={{ color: 'green' }} />;
    }
    return <FaQuestionCircle title="Unknown" style={{ color: 'purple' }} />;
  }
  function displayDate(d: Date): string {
    if (d.getFullYear() < 1010) {
      return '';
    }
    return d.toLocaleDateString();
  }
  function pluralize(num: number, unit: string): string {
    if (num === 1) {
      return unit;
    }
    return unit + 's';
  }
  return (
    <div className="mpromow__container">
      <div className="mpromow__expand">
        <button
          className="squarebutton"
          type="button"
          onClick={toggleDetails}
          title={showDetails ? 'Hide Details' : 'Show Details'}
        >
          <span>
            {showDetails && <FaMinus />}
            {!showDetails && <FaPlus />}
          </span>
        </button>
      </div>
      <div className="mpromow__icon">
        <span>{getIcon(promotion)}</span>
      </div>
      <div className="mpromow__start">
        {displayDate(new Date(promotion.startDate))}
      </div>
      <div className="mpromow__stop">
        {displayDate(new Date(promotion.stopDate))}
      </div>
      <div className="mpromow__description" title={promotion.description}>
        {promotion.description}
      </div>
      <div className="mpromow__price">{toCurrency(promotion.price)}</div>
      <div className="buttoncontainer mpromow__buttoncontainer">
        <button
          className="squarebutton mpromow__button"
          type="button"
          onClick={() => onEdit(promotion)}
          title="Edit"
          disabled={isCanceled || isExpired}
        >
          <MdEdit />
        </button>
        <button
          className="squarebutton mpromow__button"
          type="button"
          onClick={() =>
            !isCanceled ? onCancel(promotion) : onUnCancel(promotion)
          }
          title={isCanceled ? 'Uncancel' : 'Cancel'}
          disabled={isExpired}
        >
          {isCanceled ? <MdRedo /> : <MdCancel />}
        </button>
        <button
          className="squarebutton mpromow__button dangerbutton"
          type="button"
          onClick={() => onDelete(promotion)}
          title="Delete"
          disabled={!promotion.canDelete}
        >
          <MdDelete />
        </button>
      </div>
      {showDetails && (
        <>
          <div className="mpromow__created">
            <span>
              <>
                Created on {displayDate(new Date(promotion.createdOn))} by{' '}
                {creator}
              </>
            </span>
          </div>
          {isCanceled && (
            <div className="mpromow__canceled">
              Canceled on {displayDate(new Date(promotion.canceledOn))} by{' '}
              {canceller}
            </div>
          )}
          {!isCanceled && (
            <div className="mpromow__canceled">
              Promotion has not been canceled
            </div>
          )}
          {promotion.limitedQuantity && (
            <div className="mpromow__limited">
              Purchases are limited to no more than {promotion.maximumQuantity}{' '}
              {pluralize(promotion.maximumQuantity, 'unit')}
            </div>
          )}
          {!promotion.limitedQuantity && (
            <div className="mpromow__limited">Purchases are not limited</div>
          )}
        </>
      )}
    </div>
  );
}
