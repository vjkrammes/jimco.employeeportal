import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { MdSave, MdList, MdDelete } from 'react-icons/md';
import { ICompletedOrder } from '../../Interfaces/ICompletedOrder';
import { Status, statuses } from '../../Services/tools';
import { toCurrency } from '../../Services/tools';
import './MgrOrderWidget.css';

type Props = {
  order: ICompletedOrder;
  onStatusSet: (order: ICompletedOrder, status: number) => void;
  onShowDetails: (order: ICompletedOrder) => void;
  onDelete: (order: ICompletedOrder) => void;
};

type FormData = {
  status: number;
};

export default function MgrOrderWidget({
  order,
  onStatusSet,
  onShowDetails,
  onDelete,
}: Props) {
  const [price, setPrice] = useState<number>(0);
  const [address, setAddress] = useState<string>('');
  const [statusDescriptions, setStatusDescriptions] = useState<Map<
    string,
    string
  > | null>(null);
  const { register, handleSubmit, watch, setValue } = useForm<FormData>({
    mode: 'onBlur',
    defaultValues: {
      status: Status.PENDING,
    },
  });
  const buildAddress = useCallback(() => {
    const sb: string[] = [];
    if (order.address1) {
      sb.push(order.address1);
    }
    if (order.address2) {
      sb.push(order.address2);
    }
    if (order.city) {
      sb.push(order.city);
    }
    if (order.state) {
      sb.push(order.state);
    }
    if (order.postalCode) {
      sb.push(order.postalCode);
    }
    return sb.length === 0 ? '' : sb.join(' ');
  }, [order]);
  useEffect(() => {
    setStatusDescriptions(statuses());
  }, []);
  useEffect(() => {
    setPrice(0);
    let p = 0;
    if (order.lineItems && order.lineItems.length > 0) {
      order.lineItems.forEach((x) => (p += x.price * x.quantity));
    }
    setPrice(p);
    setAddress(buildAddress);
    setValue('status', order.status);
  }, [order, buildAddress, setValue]);
  function doUpdate(data: FormData) {
    onStatusSet(order, Number(data.status));
  }
  return (
    <div className="mow__container">
      <div className="mow__date">
        {new Date(order.createDate).toLocaleDateString()}
      </div>
      <div className="mow__name">{order.name}</div>
      <div className="mow__email">{order.email}</div>
      <div className="mow__status">
        <form>
          <select className="mow__status__select" {...register('status')}>
            <option value={Status.BACKORDERED}>
              {statusDescriptions?.get(Status.BACKORDERED.toString())}
            </option>
            <option value={Status.CANCELED_CUSTOMER}>
              {statusDescriptions?.get(Status.CANCELED_CUSTOMER.toString())}
            </option>
            <option value={Status.CANCELED_STORE}>
              {statusDescriptions?.get(Status.CANCELED_STORE.toString())}
            </option>
            <option value={Status.INPROGRESS}>
              {statusDescriptions?.get(Status.INPROGRESS.toString())}
            </option>
            <option value={Status.OPEN}>
              {statusDescriptions?.get(Status.OPEN.toString())}
            </option>
            <option value={Status.OUTOFSTOCK}>
              {statusDescriptions?.get(Status.OUTOFSTOCK.toString())}
            </option>
            <option value={Status.PENDING}>
              {statusDescriptions?.get(Status.PENDING.toString())}
            </option>
            <option value={Status.SHIPPED}>
              {statusDescriptions?.get(Status.SHIPPED.toString())}
            </option>
          </select>
        </form>
      </div>
      <div className="mow__price">{toCurrency(price)}</div>
      <div className="mow__buttoncontainer buttoncontainer">
        <button
          className="squarebutton"
          type="button"
          onClick={handleSubmit(doUpdate)}
          title="Save Status"
          disabled={Number(watch('status')) === order.status}
        >
          <MdSave />
        </button>
        <button
          className="squarebutton"
          type="button"
          onClick={() => onShowDetails(order)}
          title="View Details"
        >
          <MdList />
        </button>
        <button
          className="squarebutton dangerbutton"
          type="button"
          onClick={() => onDelete(order)}
          title="Delete Order"
          disabled={order.status !== Status.PENDING || !order.canDelete}
        >
          <MdDelete />
        </button>
      </div>
      <div className="mow__address">{address}</div>
    </div>
  );
}
