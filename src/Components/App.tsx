import { useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// pages
import AboutPage from './AboutPage/AboutPage';
import AlertPage from './AlertPage/AlertPage';
import ArchitecturePage from './AboutPage/ArchitecturePage';
import CategoryPage from './CategoryPage/CategoryPage';
import CheckOutPage from './CheckOutPage/CheckOutPage';
import CreateProductPage from './CreateProductPage/CreateProductPage';
import CreateVendorPage from './CreateVendorPage/CreateVendorPage';
import DisclaimerPage from './DisclaimerPage/DisclaimerPage';
import EmployeePage from './EmployeePage/EmployeePage';
import GroupPage from './GroupPage/GroupPage';
import HomePage from './HomePage/HomePage';
import LogsPage from './LogsPage/LogsPage';
import MainPage from './MainPage/MainPage';
import NoticesPage from './NoticesPage/NoticesPage';
import OrderDetailPage from './OrderDetail/OrderDetailPage';
import OrderPage from './OrderPage/OrderPage';
import ProductPage from './ProductPage/ProductPage';
import ProfilePage from './ProfilePage/ProfilePage';
import PromotionsPage from './PromotionsPage/PromotionsPage';
import NotFoundPage from './NotFoundPage/NotFoundPage';
import SearchPage from './SearchPage/SearchPage';
import SendAlertPage from './SendAlertPage/SendAlertPage';
import VendorPage from './VendorPage/VendorPage';
// providers
import { AlertProvider } from '../Contexts/AlertContext';
import { UserProvider } from '../Contexts/UserContext';
// models
import { IUserModel } from '../Interfaces/IUserModel';
// miscellaneous
import AlertPopup from '../Widgets/AlertPopup/AlertPopup';
import Header from './Header/Header';
import Footer from './Footer/Footer';
import Spinner from '../Widgets/Spinner/Spinner';
// CSS
import './App.css';

function App() {
  const [employeeList, setEmployeeList] = useState<IUserModel[] | null>(null);
  const { isLoading, error } = useAuth0();
  if (isLoading) {
    return (
      <div className="loading">
        <Spinner />
        <span>Loading...</span>
      </div>
    );
  }
  if (error) {
    return <div className="errorpage">Oops... {error.message}</div>;
  }
  return (
    <AlertProvider>
      <UserProvider>
        <Router>
          <header>
            <Header />
          </header>
          <main>
            <div className="page">
              <Routes>
                <Route path="" element={<HomePage />} />
                <Route path="/" element={<HomePage />} />
                <Route path="/About" element={<AboutPage />} />
                <Route
                  path="/Alerts"
                  element={
                    <>
                      <AlertPopup />
                      <AlertPage />
                    </>
                  }
                />
                <Route path="/Architecture" element={<ArchitecturePage />} />
                <Route
                  path="/Categories"
                  element={
                    <>
                      <AlertPopup />
                      <CategoryPage />
                    </>
                  }
                />
                <Route
                  path="/Checkout"
                  element={
                    <>
                      <AlertPopup />
                      <CheckOutPage />
                    </>
                  }
                />
                <Route
                  path="/CreateProduct"
                  element={
                    <>
                      <AlertPopup />
                      <CreateProductPage />
                    </>
                  }
                />
                <Route
                  path="/CreateVendor"
                  element={
                    <>
                      <AlertPopup />
                      <CreateVendorPage />
                    </>
                  }
                />
                <Route path="/Disclaimer" element={<DisclaimerPage />} />
                <Route
                  path="/Employees"
                  element={
                    <>
                      <AlertPopup />
                      <EmployeePage setEmployeeList={setEmployeeList} />
                    </>
                  }
                />
                <Route
                  path="/Groups"
                  element={
                    <>
                      <AlertPopup />
                      <GroupPage />
                    </>
                  }
                />
                <Route path="/Home" element={<HomePage />} />
                <Route
                  path="/Logs"
                  element={
                    <>
                      <AlertPopup />
                      <LogsPage itemsPerPage={8} />
                    </>
                  }
                />
                <Route
                  path="/Main"
                  element={
                    <>
                      <AlertPopup />
                      <MainPage />
                    </>
                  }
                />
                <Route
                  path="/Notices"
                  element={
                    <>
                      <AlertPopup />
                      <NoticesPage />
                    </>
                  }
                />
                <Route
                  path="/OrderDetail/:orderId"
                  element={
                    <>
                      <AlertPopup />
                      <OrderDetailPage />
                    </>
                  }
                />
                <Route
                  path="/Orders"
                  element={
                    <>
                      <AlertPopup />
                      <OrderPage itemsPerPage={5} />
                    </>
                  }
                />
                <Route
                  path="/Products"
                  element={
                    <>
                      <AlertPopup />
                      <ProductPage itemsPerPage={5} />
                    </>
                  }
                />
                <Route
                  path="/Profile"
                  element={
                    <>
                      <AlertPopup />
                      <ProfilePage />
                    </>
                  }
                />
                <Route
                  path="/Promotions/:productId"
                  element={
                    <>
                      <AlertPopup />
                      <PromotionsPage />
                    </>
                  }
                />
                <Route
                  path="/Search/:category/:text"
                  element={<SearchPage />}
                />
                <Route path="/Search/:text" element={<SearchPage />} />
                <Route
                  path="/SendAlert"
                  element={
                    <>
                      <AlertPopup />
                      <SendAlertPage employeeList={employeeList} />
                    </>
                  }
                />
                <Route
                  path="/Vendors"
                  element={
                    <>
                      <AlertPopup />
                      <VendorPage itemsPerPage={5} />
                    </>
                  }
                />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </div>
          </main>
          <footer>
            <Footer />
          </footer>
        </Router>
      </UserProvider>
    </AlertProvider>
  );
}

export default App;
