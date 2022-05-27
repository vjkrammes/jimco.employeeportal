import { useState, ChangeEvent } from 'react';
import { MdSearch, MdClear } from 'react-icons/md';
import { useAlert } from '../../Contexts/AlertContext';
import { IProduct } from '../../Interfaces/IProduct';
import { getProductBySku } from '../../Services/ProductService';
import ProductWidget from '../Product/ProductWidget';
import './SkuSearchWidget.css';

export default function SkuSearchWidget() {
  const [product, setProduct] = useState<IProduct | null>(null);
  const [searchText, setSearchText] = useState<string>('');
  const modal = document.getElementById('ssw__modal');
  const { setAlert } = useAlert();
  function searchChanged(e: ChangeEvent<HTMLInputElement>) {
    if (e) {
      setSearchText(e.currentTarget.value);
    } else {
      setSearchText('');
    }
  }
  async function searchClick() {
    if (searchText) {
      const product = await getProductBySku(searchText);
      if (product) {
        setProduct(product);
        // @ts-ignore
        modal.showModal();
      } else {
        setAlert('No Matching SKU was found', 'warning', 5000);
      }
    }
  }
  function closeClick() {
    // @ts-ignore
    model.close();
    setSearchText('');
  }
  function resetClick() {
    setSearchText('');
    document.getElementById('searchText')?.focus();
  }
  return (
    <div className="ssw__container">
      <dialog className="ssw__modal" id="ssw__modal">
        <div className="ssw__modalcontainer">
          <div className="ssw__title">
            Matching Product for SKU {searchText}
          </div>
          <div className="ssw__content">
            <ProductWidget product={product!} />
          </div>
          <button type="button" className="primarybutton" onClick={closeClick}>
            <span>
              <MdClear /> Close
            </span>
          </button>
        </div>
      </dialog>
      <p className="ssw__title">Find a Product by SKU</p>
      <input
        type="search"
        value={searchText}
        onChange={searchChanged}
        placeholder="Sku..."
        id="searchText"
      />
      <div className="ssw__buttoncontainer">
        <button type="button" className="primarybutton" onClick={searchClick}>
          <span>
            <MdSearch /> Search
          </span>
        </button>
        <button type="button" className="secondarybutton" onClick={resetClick}>
          <span>
            <MdClear /> Reset
          </span>
        </button>
      </div>
    </div>
  );
}
