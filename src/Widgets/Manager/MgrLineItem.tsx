import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { MdSave, MdDelete } from 'react-icons/md';
import { toCurrency, Status, statuses } from '../../Services/tools';
import { ILineItem } from '../../Interfaces/ILineItem';
import AgeBadge from '../Badges/AgeBadge';
import './MgrLineItem.css';

type Props = {
  item: ILineItem;
  onStatusSet: (item: ILineItem, status: number) => void;
  onDelete: (item: ILineItem) => void;
};

type FormData = {
  status: number;
};

export default function MgrLineItem({ item, onStatusSet, onDelete }: Props) {
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
  useEffect(() => {
    setStatusDescriptions(statuses());
  }, []);
  useEffect(() => {
    setValue('status', item.status);
  }, [item, setValue]);
  function doUpdate(data: FormData) {
    onStatusSet(item, data.status);
  }
  return (
    <div className="mli__container">
      <div className="mli__agereq">
        <AgeBadge
          age={item.ageRequired}
          nonSpecific={<span>{item.ageRequired}+</span>}
          noneRequired={<span>&nbsp;</span>}
        />
      </div>
      <div className="mli__name">{item.product.name}</div>
      <div className="mli__quantity">{item.quantity}</div>
      <div className="mli__price">{toCurrency(item.quantity * item.price)}</div>
      <div className="buttoncontainer mli__buttoncontainer">
        <button
          className="squarebutton"
          type="button"
          onClick={handleSubmit(doUpdate)}
          title="Save status"
          disabled={Number(watch('status')) === item.status}
        >
          <MdSave />
        </button>
        <button
          className="squarebutton dangerbutton"
          type="button"
          onClick={() => onDelete(item)}
          disabled={item.status !== Status.PENDING && item.canDelete}
        >
          <MdDelete />
        </button>
      </div>
      <div className="mli__manufacturer">
        {item.product.vendor?.name || 'Unknown'}
      </div>
      <div className="mli__statusdate">
        {new Date(item.statusDate).toLocaleDateString()}
      </div>
      <div className="mli__status">
        <form>
          <select className="mli__statusselect" {...register('status')}>
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
    </div>
  );
}
