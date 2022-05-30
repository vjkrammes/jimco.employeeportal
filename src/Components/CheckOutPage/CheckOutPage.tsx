import { useState, useEffect, ChangeEvent } from 'react';
import { useForm } from 'react-hook-form';
import {
  MdHome,
  MdClear,
  MdSearch,
  MdCheck,
  MdCancel,
  MdPrint,
} from 'react-icons/md';
import { FaCashRegister } from 'react-icons/fa';
import { useAuth0 } from '@auth0/auth0-react';
import { useUser } from '../../Contexts/UserContext';
import { useAlert } from '../../Contexts/AlertContext';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { IProduct } from '../../Interfaces/IProduct';
import { IItem } from '../../Interfaces/IItem';
import { IOrder } from '../../Interfaces/IOrder';
import { ICreateOrderItem } from '../../Interfaces/ICreateOrderItem';
import { IApiResponse } from '../../Interfaces/IApiResponse';
import { getProducts } from '../../Services/ProductService';
import {
  createOrder,
  submitOrder,
  checkOut,
} from '../../Services/OrderService';
import { toCurrency } from '../../Services/tools';
import Spinner from '../../Widgets/Spinner/Spinner';
import MiniProductWidget from '../../Widgets/Product/MiniProductWidget';
import AgeBadge from '../../Widgets/Badges/AgeBadge';
import CartItemWidget from '../../Widgets/Cart/CartItemWidget';
import './CheckOutPage.css';

type FormData = {
  searchText: string;
  searchSku: string;
};

export default function CheckOutPage() {
  const [allProducts, setAllProducts] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [products, setProducts] = useState<IProduct[]>([]);
  const [items, setItems] = useState<IItem[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [ageRequired, setAgeRequired] = useState<number>(0);
  const [isInStore, setIsInStore] = useState<boolean>(true);
  const [processing, setProcessing] = useState<boolean>(false);
  const [requiredDOB, setRequiredDOB] = useState<Date>(new Date());
  const [orderId, setOrderId] = useState<string>('');
  const [apiResponse, setApiResponse] = useState<IApiResponse | null>({
    code: 1,
    message: 'This is the title',
    messages: ['First one thing went wrong', 'Then another thing went awry'],
  });
  const [email, setEmail] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [pin, setPin] = useState<number>(0);
  const [doOverride, setDoOverride] = useState<boolean>(false);
  const { isAuthenticated, getAccessTokenSilently } = useAuth0();
  const { isJimCo, user } = useUser();
  const { setAlert } = useAlert();
  const navigate = useNavigate();
  const avmodal = document.getElementById('agecheckmodal');
  const osmodal = document.getElementById('onlinesuccessmodal');
  const ofmodal = document.getElementById('onlinefailmodal');
  const { register, handleSubmit, watch, setValue } = useForm<FormData>({
    mode: 'onBlur',
    defaultValues: {
      searchText: '',
      searchSku: '',
    },
  });
  useEffect(() => {
    async function doLoadProducts() {
      const prods = await getProducts();
      setAllProducts(prods);
      setProducts(prods);
      setLoading(false);
    }
    if (!isAuthenticated || !isJimCo) {
      navigate('/Home');
      return;
    }
    doLoadProducts();
  }, [isAuthenticated, isJimCo, navigate]);
  function doSearch(data: FormData) {
    if (data && data.searchSku) {
      const product = allProducts.find((x) => x.sku === data.searchSku);
      if (product) {
        setProducts([product]);
      } else {
        const products: IProduct[] = [];
        setProducts(products);
      }
    } else if (data && data.searchText) {
      const st = data.searchText.toLowerCase();
      const prods = allProducts.filter(
        (x) =>
          x.name.toLowerCase().indexOf(st) >= 0 ||
          x.description.toLowerCase().indexOf(st) >= 0,
      );
      setProducts(prods);
    }
  }
  function resetSearch() {
    setValue('searchText', '');
    setValue('searchSku', '');
    setProducts(allProducts);
    document.getElementById('searchtext')?.focus();
  }
  function clearCart() {
    if (!processing) {
      let newitems: IItem[] = [];
      setItems(newitems);
      setTotal(0);
      setAgeRequired(0);
      setIsInStore(true);
      setEmail('');
      setName('');
      setPin(0);
    }
  }
  function addToCart(product: IProduct) {
    if (product && product.quantity > 0 && !processing) {
      let newitems: IItem[] = [];
      const price = product.currentPromotion
        ? product.currentPromotion.price
        : product.price;
      newitems = [...items];
      const existing = newitems.find((x) => x.product.id === product.id);
      if (existing) {
        if (existing.quantity + 1 > product.quantity) {
          setAlert('Quantity in cart exceeds quantity in stock', 'error', 5000);
          return;
        }
        existing.quantity++;
      } else {
        newitems.push({
          product: product,
          quantity: 1,
          price: price,
        });
      }
      setItems(newitems);
      resetAgeRequired(newitems);
      recalculateTotal(newitems);
    }
  }
  function recalculateTotal(items: IItem[]) {
    let newtotal = 0;
    items.forEach((x) => (newtotal += x.quantity * x.price));
    setTotal(newtotal);
  }
  function resetAgeRequired(items: IItem[]) {
    let newage = 0;
    items.forEach((x) => {
      if (x.product.category!.ageRequired > newage) {
        newage = x.product.category!.ageRequired;
      }
      if (x.product.ageRequired > newage) {
        newage = x.product.ageRequired;
      }
    });
    setAgeRequired(newage);
    const now = new Date();
    setRequiredDOB(
      new Date(now.getFullYear() - newage, now.getMonth(), now.getDate()),
    );
  }
  function removeFromCart(product: IProduct) {
    if (!processing) {
      let newitems: IItem[] = [];
      newitems = [...items];
      let existing = newitems.find((x) => x.product.id === product.id);
      if (existing) {
        if (existing.quantity <= 1) {
          deleteFromCart(product);
        } else {
          existing.quantity--;
        }
        setItems(newitems);
        recalculateTotal(newitems);
        resetAgeRequired(newitems);
      }
    }
  }
  function deleteFromCart(product: IProduct) {
    if (
      product &&
      items.findIndex((x) => x.product.id === product.id) >= 0 &&
      !processing
    ) {
      let newitems: IItem[] = [];
      newitems = [...items];
      const ix = newitems.findIndex((x) => x.product.id === product.id);
      newitems.splice(ix, 1);
      setItems(newitems);
      recalculateTotal(newitems);
      resetAgeRequired(newitems);
    }
  }
  function showSuccessResult(order: IOrder) {
    setOrderId(order.id);
    // @ts-ignore
    osmodal.showModal();
  }
  function showFailureResult(response: IApiResponse) {
    setApiResponse(response);
    // @ts-ignore
    ofmodal.showModal();
  }
  async function doInStoreCheckout() {
    const order: ICreateOrderItem[] = [];
    if (items && items.length > 0) {
      items.map((x) =>
        order.push({
          id: uuidv4(),
          productId: x.product.id,
          quantity: x.quantity,
          price: x.price,
        }),
      );
      const response = await checkOut(
        order,
        doOverride,
        await getAccessTokenSilently(),
        user!,
      );
      if (response.ok) {
        clearCart();
        setAlert('Transaction completed successfully', 'info', 5000);
      } else {
        showFailureResult(
          (response.body as IApiResponse) || {
            code: 1,
            message: `Status code ${response.code || 0}`,
          },
        );
      }
    }
  }
  async function doOnPhoneCheckout() {
    setProcessing(true);
    if (email && name && pin > 0 && items && items.length > 0) {
      const order = createOrder(email, name, pin, ageRequired, items);
      if (order) {
        const results = await submitOrder(
          order,
          await getAccessTokenSilently(),
        );
        if (results && results.ok) {
          clearCart();
          const neworder = results.body as IOrder;
          showSuccessResult(neworder);
        } else {
          showFailureResult(
            (results.body as IApiResponse) || {
              code: 1,
              message: `Status code ${results.code || 0}`,
            },
          );
        }
      } else {
        setAlert('Failed to create order', 'error', 5000);
      }
    }
    setProcessing(false);
  }
  async function doCheckout() {
    if (!items || items.length === 0) {
      setAlert('Cart is empty', 'warning', 5000);
      return;
    }
    if (isInStore) {
      await doInStoreCheckout();
    } else {
      await doOnPhoneCheckout();
    }
  }
  async function checkout() {
    if (ageRequired > 0) {
      // @ts-ignore
      avmodal.showModal();
    } else {
      await doCheckout();
    }
  }
  async function ageVerified() {
    // @ts-ignore
    avmodal.close();
    await doCheckout();
  }
  function closeModal(modal: HTMLElement | null) {
    if (modal) {
      // @ts-ignore
      modal.close();
    }
  }
  function emailChanged(e: ChangeEvent<HTMLInputElement>) {
    setEmail(e.target.value);
  }
  function nameChanged(e: ChangeEvent<HTMLInputElement>) {
    setName(e.target.value);
  }
  function pinChanged(e: ChangeEvent<HTMLInputElement>) {
    setPin(Number(e.target.value));
  }
  function overrideChanged(e: ChangeEvent<HTMLInputElement>) {
    setDoOverride(!doOverride);
  }
  return (
    <div className="container">
      <dialog className="ckout__modal" id="agecheckmodal">
        <div className="ckout__ac__container">
          <div className="ckout__ac__heading">Verification of Age required</div>
          <div className="ckout__ac__message">
            One or more items in this cart require a minimum age of{' '}
            {ageRequired}.
          </div>
          {isInStore && (
            <div className="ckout__ac__dob">
              Verify that the buyer's date of birth is{' '}
              <span>{requiredDOB.toLocaleDateString()}</span> or earlier.
            </div>
          )}
          {!isInStore && (
            <div className="ckout__ac__dob">
              Inform the caller that a person at least {ageRequired} years of
              age with valid identification will be required to accept delivery.
            </div>
          )}
          <div className="buttoncontainer">
            <button
              className="primarybutton"
              onClick={ageVerified}
              type="button"
            >
              <span>
                <MdCheck /> Verified
              </span>
            </button>
            <button
              className="secondarybutton"
              onClick={() => closeModal(avmodal)}
              type="button"
            >
              <span>
                <MdCancel /> Cancel
              </span>
            </button>
          </div>
        </div>
      </dialog>
      <dialog className="ckout__modal" id="onlinesuccessmodal">
        <div className="ckout__os__container">
          <div className="ckout__os__heading">Order Created Successfully</div>
          <div className="ckout__os__message">Order Id: {orderId}</div>
          <div className="buttoncontainer">
            <button
              className="primarybutton"
              type="button"
              onClick={() => closeModal(osmodal)}
            >
              <span>
                <MdCheck /> OK
              </span>
            </button>
            <button
              className="secondarybutton"
              type="button"
              onClick={() => {}} // TODO: Print
              disabled
            >
              <span>
                <MdPrint /> Print
              </span>
            </button>
          </div>
        </div>
      </dialog>
      <dialog className="ckout__modal" id="onlinefailmodal">
        <div className="ckout__of__container">
          <div className="ckout__of__heading">Order Creation Failed</div>
          {apiResponse?.message && (
            <div className="ckout__of__title">{apiResponse.message}</div>
          )}
          <ul className="ckout__of__errorlist">
            {apiResponse?.messages && apiResponse.message.length > 0 && (
              <div className="ckout__of__messages">
                {apiResponse.messages.map((x) => (
                  <li key={uuidv4()} className="ckout__of__m__message">
                    {x}
                  </li>
                ))}
              </div>
            )}
          </ul>
          <div className="buttoncontainer">
            <button
              className="primarybutton"
              type="button"
              onClick={() => closeModal(ofmodal)}
            >
              <span>
                <MdCheck /> OK
              </span>
            </button>
          </div>
        </div>
      </dialog>
      <div className="header">
        <div className="heading">Check Out</div>
        <button
          className="primarybutton headerbutton-left"
          type="button"
          onClick={() => navigate('/Home')}
          disabled={processing}
        >
          <span>
            <MdHome /> Home
          </span>
        </button>
      </div>
      <div className="content">
        <div className="ckout__container">
          {/* Product List */}
          <div className="ckout__left">
            <div className="ckout__header">
              <div className="ckout__heading">Products</div>
              <form
                className="ckout__searchform"
                onSubmit={handleSubmit(doSearch)}
              >
                <div className="ckout__searchitem">
                  <input
                    id="searchtext"
                    className="forminput"
                    type="search"
                    {...register('searchText')}
                    placeholder="Name or Desc."
                  />
                  <input
                    className="forminput"
                    type="search"
                    {...register('searchSku')}
                    placeholder="SKU"
                  />
                  <button
                    className="squarebutton"
                    type="button"
                    onClick={resetSearch}
                    title="Clear search results"
                    disabled={processing}
                  >
                    <MdClear />
                  </button>
                  <button
                    className="squarebutton"
                    type="submit"
                    disabled={
                      !(watch('searchText') || watch('searchSku')) || processing
                    }
                  >
                    <span>
                      <MdSearch />
                    </span>
                  </button>
                </div>
              </form>
            </div>
            <div className="ckout__products">
              {loading && (
                <div className="loading">
                  <Spinner /> Loading...
                </div>
              )}
              {!loading && products && products.length === 0 && (
                <div className="ckout__noproducts">No Matching Products</div>
              )}
              {!loading &&
                products &&
                products.length > 0 &&
                products.map((x) => (
                  <MiniProductWidget
                    key={x.id}
                    product={x}
                    hilightBackground={true}
                    showIcon={true}
                    onAddToCart={addToCart}
                  />
                ))}
            </div>
          </div>
          {/* Cart */}
          <div className="ckout__right">
            <div className="ckout__header">
              <div className="ckout__heading">Current Cart</div>
              <div className="ckout__rightheader">
                <span>Total Price: {toCurrency(total)}</span>
                <div className="ckout__agerequired">
                  {ageRequired > 0 && (
                    <span>
                      <AgeBadge age={ageRequired} />
                    </span>
                  )}
                  {ageRequired === 0 && <span>&nbsp;</span>}
                </div>
                <div className="ckout__instore">
                  <label className="formlabel ckout__label" htmlFor="instore">
                    In Store
                  </label>
                  <input
                    className="forminput"
                    type="checkbox"
                    checked={isInStore}
                    onChange={() => setIsInStore(!isInStore)}
                    disabled={processing}
                  />
                </div>
                <div className="buttoncontainer">
                  <button
                    className="squarebutton"
                    type="button"
                    onClick={clearCart}
                    title="Clear Cart"
                    disabled={!items || items.length === 0 || processing}
                  >
                    <span>
                      <MdClear />
                    </span>
                  </button>
                  <button
                    className="squarebutton"
                    type="button"
                    onClick={checkout}
                    title="Cash Out"
                    disabled={
                      !items ||
                      items.length === 0 ||
                      processing ||
                      (!isInStore && (!email || !name || pin <= 0))
                    }
                  >
                    <span>
                      <FaCashRegister />
                    </span>
                  </button>
                </div>
              </div>
            </div>
            <div className="ckout__cart">
              {isInStore && (
                <div className="ckout__callercontainer">
                  <div className="formitem">
                    <label className="formlabel" htmlFor="override">
                      Override
                    </label>
                    <input
                      className="forminput"
                      type="checkbox"
                      checked={doOverride}
                      onChange={overrideChanged}
                    />
                  </div>
                </div>
              )}
              {!isInStore && (
                <div className="ckout__callercontainer">
                  <div className="ckout__info">
                    Order is for in-store pickup
                  </div>
                  <div className="formitem">
                    <label className="formlabel" htmlFor="email">
                      Email
                    </label>
                    <input
                      className="forminput"
                      type="email"
                      value={email}
                      onChange={emailChanged}
                      placeholder="Email"
                      id="email"
                    />
                  </div>
                  <div className="formitem">
                    <label className="formlabel" htmlFor="name">
                      Name
                    </label>
                    <input
                      className="forminput"
                      type="text"
                      value={name}
                      onChange={nameChanged}
                      placeholder="Name"
                      id="name"
                    />
                  </div>
                  <div className="formitem">
                    <label className="formlabel" htmlFor="pin">
                      PIN
                    </label>
                    <input
                      className="forminput"
                      type="number"
                      value={pin}
                      onChange={pinChanged}
                      placeholder="PIN"
                      id="pin"
                    />
                  </div>
                </div>
              )}
              {!items ||
                (items.length === 0 && (
                  <div className="ckout__cartempty">Cart is Empty</div>
                ))}
              {items &&
                items.length > 0 &&
                items.map((x) => (
                  <CartItemWidget
                    key={x.product.id}
                    item={x}
                    onIncrease={addToCart}
                    onDecrease={removeFromCart}
                    onRemove={deleteFromCart}
                  />
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
