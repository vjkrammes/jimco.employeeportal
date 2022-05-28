import { useState, useEffect } from 'react';
import { ImCart } from 'react-icons/im';
import { IProduct } from '../../Interfaces/IProduct';
import { getHex } from '../../Services/ColorService';
import { toCurrency } from '../../Services/tools';
import AgeBadge from '../Badges/AgeBadge';
import './MiniProductWidget.css';

type Props = {
  product: IProduct;
  hilightBackground?: boolean;
  showIcon?: boolean;
  onAddToCart: (product: IProduct) => void;
};

export default function MiniProductWidget({
  product,
  hilightBackground,
  showIcon,
  onAddToCart,
}: Props) {
  const [ageRequired, setAgeRequired] = useState<number>(0);
  useEffect(() => {
    if (product) {
      let agereq = 0;
      if (product.category!.ageRequired > agereq) {
        agereq = product.category!.ageRequired;
      }
      if (product.ageRequired > agereq) {
        agereq = product.ageRequired;
      }
      setAgeRequired(agereq);
    }
  }, [product]);
  if (!product) {
    return <></>;
  }
  return (
    <div
      className="copw__container"
      style={{
        backgroundColor: hilightBackground
          ? getHex(product.category!.background)
          : undefined,
      }}
      title={product.description}
      onDoubleClick={() => onAddToCart(product)}
    >
      <div className="copw__icon">
        {showIcon && <img src={`/images/${product.category!.image}`} alt="" />}
        {!showIcon && <span>&nbsp;</span>}
      </div>
      <div className="copw__name">{`${product.name} ${
        product.quantity === 0 ? '(Out of Stock)' : ''
      }`}</div>
      <div className="copw__agerequired">
        <AgeBadge age={ageRequired} />
      </div>
      <div
        className="copw__price"
        style={{
          color: product.currentPromotion
            ? 'var(--osale-price-color)'
            : 'var(--normal-price-color)',
          textDecoration: product.quantity === 0 ? 'line-through' : 'none',
        }}
        title={product.quantity === 0 ? 'OUT OF STOCK' : undefined}
      >
        {toCurrency(
          product.currentPromotion
            ? product.currentPromotion.price
            : product.price,
        )}
      </div>
      <div className="copw__description">{product.description}</div>
      <button
        className="squarebutton copw__button"
        type="button"
        onClick={() => onAddToCart(product)}
        title="Add to cart"
        disabled={product.quantity === 0}
      >
        <ImCart />
      </button>
    </div>
  );
}
