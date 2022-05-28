import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MdHome, MdClear } from 'react-icons/md';
import { IProduct } from '../../Interfaces/IProduct';
import { ICategory } from '../../Interfaces/ICategory';
import { searchProduct } from '../../Services/ProductService';
import { readCategory } from '../../Services/CategoryService';
import Spinner from '../../Widgets/Spinner/Spinner';
import ProductWidget from '../../Widgets/Product/ProductWidget';
import ProductSummaryWidget from '../../Widgets/Product/ProductSummaryWidget';
import './SearchPage.css';

export default function SearchPage() {
  const { category, text } = useParams();
  const [products, setProducts] = useState<IProduct[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<IProduct | null>(null);
  const [loadingProducts, setLoadingProducts] = useState<boolean>(true);
  const [dbCategory, setDbCategory] = useState<ICategory | null>(null);
  const navigate = useNavigate();
  const modal = document.getElementById('sp__modal');
  useEffect(() => {
    async function doGetProducts() {
      const prod = await searchProduct(category ? category : '0', text!);
      setProducts(prod);
    }
    async function doReadCategory() {
      const cat = await readCategory(category!);
      setDbCategory(cat);
    }
    if (text) {
      doGetProducts();
    } else {
      setProducts([]);
    }
    setLoadingProducts(false);
    if (category) {
      doReadCategory();
    } else {
      setDbCategory(null);
    }
  }, [category, text]);
  function closeClick() {
    // @ts-ignore
    modal.close();
  }
  function selectProduct(productId: string) {
    setSelectedProduct(null);
    if (productId) {
      const p = products.find((x) => x.id === productId);
      if (p) {
        setSelectedProduct(p);
        // @ts-ignore
        modal.showModal();
      }
    }
  }
  return (
    <div className="container">
      <dialog className="modal" id="sp__modal">
        <div className="sp__modalcontainer">
          <div className="sp__modalcontent">
            <ProductWidget product={selectedProduct!} />
          </div>
          <button type="button" className="primarybutton" onClick={closeClick}>
            <span>
              <MdClear /> Close
            </span>
          </button>
        </div>
      </dialog>
      <div className="header">
        {dbCategory && (
          <div className="heading">
            Searching in {dbCategory?.name} for '{text}'
          </div>
        )}
        {!dbCategory && (
          <div className="heading">
            Searching in all Categories for '{text}'
          </div>
        )}
        <button
          type="button"
          className="primarybutton headerbutton-left"
          onClick={() => navigate('/Home')}
        >
          <span>
            <MdHome /> Home
          </span>
        </button>
      </div>
      <div className="content">
        {loadingProducts && (
          <div className="loading">
            <Spinner /> Loading...
          </div>
        )}
        {!loadingProducts && (!products || products.length === 0) && (
          <div className="noitemsfound">No Matching Products</div>
        )}
        {!loadingProducts && products && products.length > 0 && (
          <div className="sp__productlist">
            {products.map((x) => (
              <div
                className="sp__product"
                key={x.id}
                onClick={() => selectProduct(x.id)}
              >
                <ProductSummaryWidget product={x} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
