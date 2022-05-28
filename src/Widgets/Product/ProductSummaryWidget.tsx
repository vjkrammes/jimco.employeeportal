import { CSSProperties, useEffect, useState } from 'react';
import { IProduct } from '../../Interfaces/IProduct';
import { toCurrency } from '../../Services/tools';
import { getHex } from '../../Services/ColorService';
import './ProductSummaryWidget.css';

type Props = {
  product: IProduct | null;
  showBasePrice?: boolean;
  style?: CSSProperties;
};

export default function ProductSummaryWidget({
  product,
  showBasePrice,
  style,
}: Props) {
  const [price, setPrice] = useState<number>(0);
  const [priceClass, setPriceClass] = useState<string>('psw__normal');
  useEffect(() => {
    if (product) {
      if (product.currentPromotion && !showBasePrice) {
        if (product.currentPromotion.price) {
          setPrice(product.currentPromotion.price);
          setPriceClass('psw__onsale');
        }
      } else {
        setPrice(product.price);
      }
    }
  }, [product, showBasePrice]);
  return (
    <div
      className="psw__container"
      title={product!.description}
      style={style ? style : undefined}
    >
      {product && (
        <>
          <div
            className="psw__line1"
            style={{ backgroundColor: getHex(product.category!.background) }}
          >
            <div style={{ marginLeft: '5px' }}>{product?.vendor!.name}</div>
            <div>{product?.name}</div>
            <div className={`psw__price ${priceClass}`}>
              {toCurrency(price)}
            </div>
          </div>
          <div className="psw__line2">{product?.description}</div>
        </>
      )}
      {!product && <div className="psw__noproduct">Product not Found</div>}
    </div>
  );
}
