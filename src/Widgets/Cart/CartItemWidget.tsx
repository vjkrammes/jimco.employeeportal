import { useState, useEffect } from 'react';
import { FaPlus, FaMinus } from 'react-icons/fa';
import { MdDelete } from 'react-icons/md';
import { IItem } from '../../Interfaces/IItem';
import { IProduct } from '../../Interfaces/IProduct';
import { toCurrency } from '../../Services/tools';
import AgeBadge from '../Badges/AgeBadge';
import './CartItemWidget.css';

type Props = {
  item: IItem;
  onIncrease: (product: IProduct) => void;
  onDecrease: (product: IProduct) => void;
  onRemove: (product: IProduct) => void;
};

export default function CartItemWidget({
  item,
  onIncrease,
  onDecrease,
  onRemove,
}: Props) {
  const [age, setAge] = useState<number>(0);
  useEffect(() => {
    if (item) {
      let agereq = 0;
      if (item.product.category!.ageRequired > agereq) {
        agereq = item.product.category!.ageRequired;
      }
      if (item.product.ageRequired > agereq) {
        agereq = item.product.ageRequired;
      }
      setAge(agereq);
    }
  }, [item]);
  return (
    <div className="ciw__container">
      <div className="ciw__quantity">{item.quantity}</div>
      <div className="ciw__name">{item.product.name}</div>
      <div className="ciw__price">{toCurrency(item.price)}</div>
      <div className="ciw__extend">
        {toCurrency(item.price * item.quantity)}
      </div>
      <div className="ciw__qbuttons">
        <button
          className="ciw__button ciw__increasebutton"
          onClick={() => onIncrease(item.product)}
        >
          <span>
            <FaPlus />
          </span>
        </button>
        <button
          className="ciw__button ciw__decreasebutton"
          onClick={() => onDecrease(item.product)}
          disabled={item.quantity <= 1}
        >
          <span>
            <FaMinus />
          </span>
        </button>
      </div>
      <div className="ciw__mfgr">{item.product.vendor?.name}</div>
      <div className="ciw__agereq">
        <AgeBadge age={age} prefix="ciw" />
      </div>
      <div className="ciw__delete">
        <button
          className="ciw__button ciw__deletebutton dangerbutton"
          onClick={() => onRemove(item.product)}
        >
          <span>
            <MdDelete />
          </span>
        </button>
      </div>
    </div>
  );
}
