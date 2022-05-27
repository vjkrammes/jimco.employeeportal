import { IProduct } from '../../Interfaces/IProduct';
import HideWidget from '../Hide/HideWidget';
import { toCurrency } from '../../Services/tools';
import { getHex } from '../../Services/ColorService';

type Props = {
  product: IProduct;
};

export default function ProductWidget({ product }: Props) {
  if (!product) {
    return <div className="pw__noproduct">No Matching Product Found</div>;
  }
  return (
    <div className="pw__container">
      <HideWidget label="Ids">
        <div className="pw__item">
          <div className="pw__itemlabel">Id</div>
          <div className="pw__itemvalue">{product.id}</div>
        </div>
        <div className="pw__item">
          <div className="pw__itemlabel">Category&nbsp;Id</div>
          <div className="pw__itemvalue">{product.categoryId}</div>
        </div>
        <div className="pw__item">
          <div className="pw__itemlabel">Vendor&nbsp;Id</div>
          <div className="pw__itemvalue">{product.vendorId}</div>
        </div>
      </HideWidget>
      <div className="pw__item">
        <div className="pw__itemlabel">Name</div>
        <div className="pw__itemvalue">{product.name}</div>
      </div>
      <div className="pw__item">
        <div className="pw__itemlabel">Description</div>
        <div className="pw__itemvalue" style={{ fontWeight: '400' }}>
          {product.description}
        </div>
      </div>
      <div className="pw__item">
        <div className="pw__itemlabel">SKU</div>
        <div className="pw__itemvalue">{product.sku}</div>
      </div>
      <div className="pw__item">
        <div className="pw__itemlabel">Price</div>
        <div className="pw__itemvalue">{toCurrency(product.price)}</div>
      </div>
      <div className="pw__item">
        <div className="pw__itemlabel">Age&nbsp;Required</div>
        <div className="pw__itemvalue">
          {product.ageRequired === 0 ? '' : product.ageRequired}
        </div>
      </div>
      <div className="pw__item">
        <div className="pw__itemlabel">In&nbsp;Stock</div>
        <div className="pw__itemvalue">{product.quantity}</div>
      </div>
      <div className="pw__item">
        <div className="pw__itemlabel">Discontinued</div>
        <div className="pw__itemvalue">
          {product.discontinued && (
            <img
              src="/images/checkmark-32.png"
              alt=""
              style={{
                height: '16px',
                width: 'auto',
                justifySelf: 'flex-end',
              }}
            />
          )}
          {!product.discontinued && (
            <img
              src="/images/x-32.png"
              alt=""
              style={{
                height: '16px',
                width: 'auto',
                justifySelf: 'flex-end',
              }}
            />
          )}
        </div>
      </div>
      <HideWidget
        label="Category"
        content={
          <div
            className="pw__categorytitle"
            style={{ backgroundColor: getHex(product.category!.background) }}
          >
            <img
              src={`/images/${product.category!.image}`}
              alt=""
              style={{ height: '16px' }}
            />
            {product.category!.name}
          </div>
        }
      >
        <div className="pw__item">
          <div className="pw__itemlabel">Age&nbsp;Required</div>
          <div className="pw__itemvalue">
            {product.category!.ageRequired === 0
              ? ''
              : product.category!.ageRequired}
          </div>
        </div>
      </HideWidget>
      <HideWidget label="Vendor" content={product.vendor!.name}>
        <div className="pw__item">
          <div className="pw__itemlabel">Address&nbsp;1</div>
          <div className="pw__itemvalue">{product.vendor!.address1}</div>
        </div>
        <div className="pw__item">
          <div className="pw__itemlabel">Address&nbsp;2</div>
          <div className="pw__itemvalue">{product.vendor!.address2}</div>
        </div>
        <div className="pw__item">
          <div className="pw__itemlabel">City</div>
          <div className="pw__itemvalue">{product.vendor!.city}</div>
        </div>
        <div className="pw__item">
          <div className="pw__itemlabel">State</div>
          <div className="pw__itemvalue">{product.vendor!.state}</div>
        </div>
        <div className="pw__item">
          <div className="pw__itemlabel">Postal&nbsp;Code</div>
          <div className="pw__itemvalue">{product.vendor!.postalCode}</div>
        </div>
        <div className="pw__item">
          <div className="pw__itemlabel">Contact</div>
          <div className="pw__itemvalue">{product.vendor!.contact}</div>
        </div>
        <div className="pw__item">
          <div className="pw__itemlabel">Email</div>
          <div className="pw__itemvalue">{product.vendor!.email}</div>
        </div>
        <div className="pw__item">
          <div className="pw__itemlabel">Phone</div>
          <div className="pw__itemvalue">{product.vendor!.phone}</div>
        </div>
        <div className="pw__item">
          <div className="pw__itemlabel">Fax</div>
          <div className="pw__itemvalue">{product.vendor!.fax}</div>
        </div>
      </HideWidget>
      <HideWidget
        label="Promos"
        content={
          <div className="pw__currentpromo">
            {product.currentPromotion && (
              <span>
                {toCurrency(product.currentPromotion.price)} through{' '}
                {new Date(
                  product.currentPromotion.stopDate,
                ).toLocaleDateString()}
              </span>
            )}
            {!product.currentPromotion && <span>No Current Promotions</span>}
          </div>
        }
      >
        {product.promotions &&
          product.promotions.length > 0 &&
          product.promotions.map((x) => (
            <div className="pw__item" key={x.id}>
              <div className="pw__itemlabel">
                {new Date(x.startDate).toLocaleDateString()}
              </div>
              <div className="pw__itemvalue">
                {
                  <span>
                    {x.description}: {toCurrency(x.price)} through{' '}
                    {new Date(x.stopDate).toLocaleDateString()}
                  </span>
                }
              </div>
            </div>
          ))}
      </HideWidget>
    </div>
  );
}
