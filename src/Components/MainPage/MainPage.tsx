import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { useUser } from '../../Contexts/UserContext';
import { IAlertIdentity } from '../../Interfaces/IAlertIdentity';
import { IAlertResponse } from '../../Interfaces/IAlertResponse';
import { getAlerts } from '../../Services/AlertService';
import MenuWidget from '../../Widgets/Menu/MenuWidget';
import SearchWidget from '../../Widgets/SearchWidget/SearchWidget';
import SkuSearchWidget from '../../Widgets/SkuSearchWidget/SkuSearchWidget';
import AlertSummaryWidget from '../../Widgets/AlertSummary/AlertSummaryWidget';
import './MainPage.css';

export default function MainPage() {
  const [alertResponse, setAlertResponse] = useState<IAlertResponse | null>(
    null,
  );
  const { isLoading, isAuthenticated, getAccessTokenSilently } = useAuth0();
  const { isValid, user, isManagerPlus, isAdmin, isJimCo } = useUser();
  const navigate = useNavigate();
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/Home');
    }
  }, [isLoading, isAuthenticated, navigate]);
  useEffect(() => {
    async function doGetAlerts() {
      if (isValid && user) {
        const identity: IAlertIdentity = {
          identifier: user.identifier,
          roles: JSON.parse(user.jobTitles),
        };
        const response = await getAlerts(
          identity,
          await getAccessTokenSilently(),
        );
        if (response) {
          setAlertResponse(response);
        } else {
          setAlertResponse(null);
        }
      } else {
        setAlertResponse(null);
      }
    }
    doGetAlerts();
  }, [user, isValid, getAccessTokenSilently]);
  return (
    <div className="container">
      <div className="content">
        <div className="mainpage">
          {alertResponse &&
            alertResponse.alerts &&
            alertResponse.notices &&
            (alertResponse.alerts.length !== 0 ||
              alertResponse.notices.length !== 0) && (
              <div className="mp__notices">
                <AlertSummaryWidget alerts={alertResponse} href="/Alerts" />
              </div>
            )}
          {isJimCo && (
            <>
              <div className="mp__menuitem">
                <MenuWidget heading="Search">
                  <SearchWidget />
                </MenuWidget>
              </div>
              <div className="mp__menuitem">
                <MenuWidget heading="SKU Search">
                  <SkuSearchWidget />
                </MenuWidget>
              </div>
              <div className="mp__menuitem">
                <MenuWidget heading="Check out">
                  <Link to="/Checkout" title="Check Out">
                    <img src="/images/register.png" alt="Cash Register" />
                  </Link>
                </MenuWidget>
              </div>
            </>
          )}
          {isManagerPlus && (
            <>
              <div className="mp__menuitem">
                <MenuWidget heading="Categories">
                  <Link
                    to="/Categories"
                    style={{ marginBottom: '5px' }}
                    title="Categories"
                  >
                    <img src="/images/categories.png" alt="Categories" />
                  </Link>
                </MenuWidget>
              </div>
              <div className="mp__menuitem">
                <MenuWidget heading="Products">
                  <Link
                    to="/Products"
                    style={{ marginBottom: '5px' }}
                    title="Products"
                  >
                    <img src="/images/products.png" alt="Products" />
                  </Link>
                </MenuWidget>
              </div>
              <div className="mp__menuitem">
                <MenuWidget heading="Orders">
                  <Link
                    to="/Orders"
                    style={{ marginBottom: '5px' }}
                    title="Orders"
                  >
                    <img src="/images/orders.png" alt="Orders" />
                  </Link>
                </MenuWidget>
              </div>
              <div className="mp__menuitem">
                <MenuWidget heading="Employees">
                  <Link
                    to="/Employees"
                    style={{ marginBottom: '5px' }}
                    title="Employees"
                  >
                    <img src="/images/employees.png" alt="Employees" />
                  </Link>
                </MenuWidget>
              </div>
              <div className="mp__menuitem">
                <MenuWidget heading="Notices and Alerts">
                  <Link
                    to="/Notices"
                    style={{ marginBottom: '5px' }}
                    title="Notices"
                  >
                    <img src="/images/notices.png" alt="Notices" />
                  </Link>
                </MenuWidget>
              </div>
              <div className="mp__menuitem">
                <MenuWidget heading="Vendors">
                  <Link
                    to="/Vendors"
                    style={{ marginBottom: '5px' }}
                    title="Vendors"
                  >
                    <img src="/images/vendors.png" alt="Vendors" />
                  </Link>
                </MenuWidget>
              </div>
            </>
          )}
          {isAdmin && (
            <div className="mp__menuitem">
              <MenuWidget heading="Logs">
                <Link to="/Logs" style={{ marginBottom: '5px' }} title="Admin">
                  <img src="/images/logs.png" alt="Logs" />
                </Link>
              </MenuWidget>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
