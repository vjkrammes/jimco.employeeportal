import { useEffect, useState } from 'react';
import { MdDelete, MdEdit } from 'react-icons/md';
import { BsTags } from 'react-icons/bs';
import { IProduct } from '../../Interfaces/IProduct';
import { toCurrency } from '../../Services/tools';
import { getHex } from '../../Services/ColorService';
import CategoryNameWidget from '../Category/CategoryNameWidget';
import './MgrProductWidget.css';

type Props = {
  product: IProduct;
  onEdit: (product: IProduct) => void;
  onPromotions: (product: IProduct) => void;
  onDelete: (product: IProduct) => void;
};

export default function MgrProductWidget({
  product,
  onEdit,
  onPromotions,
  onDelete,
}: Props) {
  const [price, setPrice] = useState<number>(0);
  const [priceClass, setPriceClass] = useState<string>('mpw__normal');
  useEffect(() => {
    if (product) {
      if (product.currentPromotion) {
        if (product.currentPromotion.price) {
          setPrice(product.currentPromotion.price);
          setPriceClass('mpw__onsale');
        }
      } else {
        setPrice(product.price);
      }
    }
  }, [product]);
  return (
    <div className="mpw__container">
      {product && (
        <>
          <div
            className="mpw__line1"
            style={{ backgroundColor: getHex(product.category!.background) }}
          >
            <div style={{ marginLeft: '5px' }}>{product.vendor!.name}</div>
            <div>{product.name}</div>
            <div className={`mpw__price ${priceClass}`}>
              {toCurrency(price)}
            </div>
          </div>
          <div className="mpw__line2" title={product.description}>
            {product.description}
          </div>
          <div className="mpw__line3">
            <CategoryNameWidget category={product.category!} />
            <div className="buttoncontainer mpw__buttoncontainer">
              <button
                type="button"
                className="squarebutton"
                onClick={() => onEdit(product)}
                title="Edit this product"
              >
                <span>
                  <MdEdit />
                </span>
              </button>
              <button
                className="squarebutton"
                onClick={() => onPromotions(product)}
                title="Promotions"
              >
                <span>
                  <BsTags />
                </span>
              </button>
              <button
                type="button"
                className="squarebutton dangerbutton"
                onClick={() => onDelete(product)}
                disabled={!product.canDelete}
                title="Delete this product"
              >
                <span>
                  <MdDelete />
                </span>
              </button>
            </div>
          </div>
        </>
      )}
      {!product && <div className="mpw__noproduct">Product Not Found</div>}
    </div>
  );
}
