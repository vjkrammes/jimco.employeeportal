import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MdHome, MdArrowLeft, MdPrint } from 'react-icons/md';
import { useAlert } from '../../Contexts/AlertContext';
import { useAuth0 } from '@auth0/auth0-react';
import { useUser } from '../../Contexts/UserContext';
import { readOrder } from '../../Services/OrderService';
import { ICompletedOrder } from '../../Interfaces/ICompletedOrder';
import { statusDescription, toCurrency } from '../../Services/tools';
import { ILineItem } from '../../Interfaces/ILineItem';
import {
  setLineItemStatus,
  deleteLineItem,
} from '../../Services/LineItemService';
import Spinner from '../../Widgets/Spinner/Spinner';
import MgrLineItem from '../../Widgets/Manager/MgrLineItem';
import './OrderDetailPage.css';

export default function OrderDetailPage() {
  const { orderId } = useParams();
  const [order, setOrder] = useState<ICompletedOrder | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [price, setPrice] = useState<number>(0);
  const { setAlert } = useAlert();
  const { isAuthenticated, getAccessTokenSilently } = useAuth0();
  const { isManagerPlus } = useUser();
  const navigate = useNavigate();
  const doReadOrder = useCallback(async () => {
    if (orderId) {
      const o = await readOrder(orderId);
      setOrder(o);
      let p = 0;
      if (o && o.lineItems) {
        for (let i = 0; i < o.lineItems.length; i++) {
          p += o.lineItems[i].price;
        }
      }
      setPrice(p);
    } else {
      setOrder(null);
    }
    setLoading(false);
  }, [orderId]);
  useEffect(() => {
    doReadOrder();
  }, [orderId, doReadOrder]);
  useEffect(() => {
    if (!isAuthenticated || !isManagerPlus) {
      navigate('/Home');
    }
  }, [isAuthenticated, isManagerPlus, navigate]);
  async function doSaveStatus(item: ILineItem, status: number) {
    const response = await setLineItemStatus(
      item.id,
      status,
      await getAccessTokenSilently(),
    );
    if (response.code === 0 && !response.message) {
      await doReadOrder();
      setAlert('Status updated successfully', 'info');
      return;
    }
    if (response.message) {
      setAlert(response.message, 'error', 5000);
      return;
    }
    setAlert(`Unexpected error (${response?.code || 0})`, 'error', 5000);
  }
  async function doDelete(item: ILineItem) {
    const response = await deleteLineItem(
      item.id,
      await getAccessTokenSilently(),
    );
    if (response.code === 0 && !response.message) {
      await doReadOrder();
      setAlert('Line item was deleted successfully', 'error', 5000);
      return;
    }
    if (response.message) {
      setAlert(response.message, 'error', 5000);
      return;
    }
    setAlert(`Unexpected error (${response?.code || 0})`, 'error', 5000);
  }
  return (
    <div className="container">
      <div className="header">
        <div className="heading">Order Details</div>
        <button
          className="primarybutton headerbutton-left"
          type="button"
          onClick={() => navigate('/Home')}
        >
          <span>
            <MdHome /> Home
          </span>
        </button>
        <button
          className="secondarybutton headerbutton-right"
          type="button"
          onClick={() => navigate('/Orders')}
        >
          <span>
            <MdArrowLeft /> Back
          </span>
        </button>
      </div>
      <div className="content">
        {loading && (
          <div className="loading">
            <Spinner /> Loading...
          </div>
        )}
        {!loading && !order && (
          <div className="noitemsfound">Order Not Found</div>
        )}
        {!loading && order && (
          <div className="odp__ordercontainer">
            <div className="odp__orderheader">
              <div className="odp__label odp__idlabel">Id</div>
              <div className="odp__value odp__idvalue">{order.id}</div>
              <div className="odp__label odp__pricelabel">Price</div>
              <div className="odp__value odp__price">{toCurrency(price)}</div>
              <div className="odp__printcontainer">
                <button
                  className="squarebutton"
                  type="button"
                  onClick={() => {}} // TODO: Print
                  title="Print this order"
                  disabled={true}
                >
                  <MdPrint />
                </button>
              </div>
              <div className="odp__label odp__namelabel">Name</div>
              <div className="odp__value odp__namevalue">{order.name}</div>
              <div className="odp__label odp__emaillabel">Email</div>
              <div className="odp__value odp__emailvalue">{order.email}</div>
              <div className="odp__label odp__addr1label">Address</div>
              <div className="odp__value odp__addr1value odp__double">
                {order.address1 || 'n/a'}
              </div>
              <div className="odp__label odp__addr2label">&nbsp;</div>
              <div className="odp__value odp__addr2value odp__double">
                {order.address2 || 'n/a'}
              </div>
              <div className="odp__label odp__citylabel">City</div>
              <div className="odp__value odp__cityvalue">
                {order.city || 'n/a'}
              </div>
              <div className="odp__label odp__statelabel">State</div>
              <div className="odp__value odp__statevalue">
                {order.state || 'n/a'}
              </div>
              <div className="odp__label odp__pclabel">ZIP</div>
              <div className="odp__value odp__pcvalue">
                {order.postalCode || 'n/a'}
              </div>
              <div className="odp__label odp__pinlabel">PIN</div>
              <div className="odp__value odp__pinvalue">{order.pin}</div>
              <div className="odp__label odp__cdlabel">Created</div>
              <div className="odp__value odp__cdvalue">
                {new Date(order.createDate).toLocaleDateString()}
              </div>
              <div className="odp__label odp__sdlabel">Status</div>
              <div className="odp__value odp__sdvalue">
                {new Date(order.statusDate).toLocaleDateString()}
              </div>
              <div className="odp__label odp__statlabel">Status</div>
              <div className="odp__value odp__statvalue">
                {statusDescription(order.status)}
              </div>
              <div className="odp__label odp__arlabel">Age</div>
              <div className="odp__value odp__arvalue">
                {order.ageRequired === 0 ? (
                  <span>None</span>
                ) : (
                  order.ageRequired.toString()
                )}
              </div>
            </div>
            <div className="odp__lineitemcontainer">
              <div className="odp__lineitemheader">Line Items</div>
              <div className="odp__lineitems">
                {order.lineItems &&
                  order.lineItems.length > 0 &&
                  order.lineItems?.map((x) => (
                    <MgrLineItem
                      key={x.id}
                      item={x}
                      onStatusSet={doSaveStatus}
                      onDelete={doDelete}
                    />
                  ))}
                {!order.lineItems ||
                  (order.lineItems.length === 0 && (
                    <div className="odp__nolineitems">
                      No line items found for this order
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
