import { useState, useEffect, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import {
  MdHome,
  MdCancel,
  MdArrowLeft,
  MdArrowRight,
  MdSearch,
} from 'react-icons/md';
import { useAuth0 } from '@auth0/auth0-react';
import { useUser } from '../../Contexts/UserContext';
import { useAlert } from '../../Contexts/AlertContext';
import {
  getOrders,
  updateOrder,
  deleteOrder,
} from '../../Services/OrderService';
import { IApiResponse } from '../../Interfaces/IApiResponse';
import { ICompletedOrder } from '../../Interfaces/ICompletedOrder';
import Pager from '../../Widgets/Pager/Pager';
import Spinner from '../../Widgets/Spinner/Spinner';
import MgrOrderWidget from '../../Widgets/Manager/MgrOrderWidget';
import './OrderPage.css';

type Props = {
  itemsPerPage?: number;
};

type FormData = {
  searchText: string;
};

export default function OrderPage({ itemsPerPage }: Props) {
  const [allOrders, setAllOrders] = useState<ICompletedOrder[]>([]);
  const [orders, setOrders] = useState<ICompletedOrder[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [pageSize, setPageSize] = useState<number>(5);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [highestPage, setHighestPage] = useState<number>(99999);
  const [token, setToken] = useState<string>('');
  const { isAuthenticated, getAccessTokenSilently } = useAuth0();
  const { isManagerPlus } = useUser();
  const { setAlert } = useAlert();
  const navigate = useNavigate();
  const { register, handleSubmit, watch, reset } = useForm<FormData>({
    mode: 'onBlur',
    defaultValues: {
      searchText: '',
    },
  });
  useEffect(() => {
    async function doGetToken() {
      const t = await getAccessTokenSilently();
      setToken(t);
    }
    if (!isAuthenticated || !isManagerPlus) {
      navigate('/Home');
    }
    doGetToken();
  }, [isAuthenticated, isManagerPlus, navigate, getAccessTokenSilently]);
  useEffect(() => {
    if (itemsPerPage) {
      const ps = itemsPerPage <= 0 ? 1 : itemsPerPage > 10 ? 10 : itemsPerPage;
      setPageSize(ps);
    }
  }, [itemsPerPage]);
  useEffect(() => {
    doLoadOrders();
    setCurrentPage(1);
    setHighestPage(Math.ceil(allOrders.length / pageSize));
  }, [pageSize, allOrders.length]);
  useEffect(() => {
    const offset = (currentPage - 1) * pageSize;
    setOrders(allOrders.slice(offset, offset + pageSize));
  }, [allOrders, pageSize, currentPage]);
  async function doLoadOrders() {
    setLoading(true);
    const o = await getOrders();
    setAllOrders(o);
    setLoading(false);
  }
  function doSearch(data: FormData) {
    if (allOrders) {
      const ret = allOrders.find(
        (x) =>
          x.name.toLowerCase().indexOf(data.searchText.toLowerCase()) >= 0 ||
          x.email.toLowerCase().indexOf(data.searchText.toLowerCase()) >= 0,
      );
      if (ret) {
        const ix = allOrders.findIndex((x) => x.id === ret.id);
        if (ix >= 0) {
          setCurrentPage(Math.floor(ix / pageSize) + 1);
          return;
        }
      }
    }
    setAlert('No matching orders found', 'warning', 5000);
  }
  function resetSearch() {
    reset({ searchText: '' });
    setCurrentPage(1);
  }
  function pageChanged(newpage: number) {
    if (newpage >= 1 && newpage <= highestPage) {
      setCurrentPage(newpage);
    }
  }
  async function changeStatus(order: ICompletedOrder, status: number) {
    if (order && order.status !== status) {
      const neworder: ICompletedOrder = {
        ...order,
        status: status,
      };
      const result = await updateOrder(neworder, token);
      if (result && result.ok) {
        await doLoadOrders();
        setAlert('Status updated successfully', 'info');
        return;
      }
      if (result && result.body) {
        setAlert((result.body as IApiResponse).message, 'error', 5000);
      } else {
        setAlert(`Unexpected error (${result.code || 0})`, 'error', 5000);
      }
    }
  }
  function showDetails(order: ICompletedOrder) {
    navigate(`/OrderDetail/${order.id}`);
  }
  async function doDeleteOrder(order: ICompletedOrder) {
    const result = await deleteOrder(order.id, token);
    if (result && result.ok) {
      await doLoadOrders();
      setAlert('Order deleted successfully', 'info');
      return;
    }
    if (result && result.body) {
      setAlert((result.body as IApiResponse).message, 'error', 5000);
    } else {
      setAlert(`Unexpected error (${result.code || 0})`, 'error', 5000);
    }
  }
  return (
    <div className="container">
      <div className="header">
        <div className="heading">Manage Orders</div>
        <button
          className="primarybutton headerbutton-left"
          type="button"
          onClick={() => navigate('/Home')}
        >
          <span>
            <MdHome /> Home
          </span>
        </button>
      </div>
      <div className="content">
        {loading && (
          <div className="loading">
            <Spinner /> Loading...
          </div>
        )}
        {!loading && (!orders || orders.length === 0) && (
          <div className="noitemsfound">No Orders Found</div>
        )}
        {!loading && orders && orders.length > 0 && (
          <div className="op__orderlistcontainer">
            <Pager
              numItems={orders.length}
              itemsPerPage={pageSize}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              prevButtonContent={
                <span className="pp__pagerbuttoncontent">
                  <MdArrowLeft /> Prev
                </span>
              }
              nextButtonContent={
                <span className="pp__pagerbuttoncontent">
                  Next <MdArrowRight />
                </span>
              }
              onPageChanged={pageChanged}
              showPages={true}
              onReset={() => doLoadOrders()}
            >
              <div className="pp__pagerbuttoncontent">
                <div className="pp__pc__name">Orders</div>
                <div className="pp__pc__searchform">
                  <form
                    className="pp__pc__form"
                    onSubmit={handleSubmit(doSearch)}
                  >
                    <input
                      type="search"
                      className="pp__pc__f__input"
                      {...register('searchText')}
                      placeholder="Search name or email"
                      onInput={(e: FormEvent<HTMLInputElement>) => {
                        if (!e.currentTarget.value) {
                          resetSearch();
                        }
                      }}
                    />
                    <button
                      type="submit"
                      className="squarebutton"
                      disabled={!watch('searchText')}
                    >
                      <MdSearch />
                    </button>
                    <button
                      type="button"
                      className="squarebutton"
                      onClick={resetSearch}
                      title="Reset Search"
                    >
                      <MdCancel />
                    </button>
                  </form>
                </div>
              </div>
            </Pager>
            <div className="op__orderlistcontainer">
              {orders &&
                orders.map((x) => (
                  <MgrOrderWidget
                    key={x.id}
                    order={x}
                    onShowDetails={showDetails}
                    onStatusSet={changeStatus}
                    onDelete={doDeleteOrder}
                  />
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
