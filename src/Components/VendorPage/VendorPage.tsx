import { useState, useEffect, FormEvent } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useAlert } from '../../Contexts/AlertContext';
import { useAuth0 } from '@auth0/auth0-react';
import { useUser } from '../../Contexts/UserContext';
import {
  MdArrowLeft,
  MdArrowRight,
  MdSearch,
  MdSave,
  MdCancel,
  MdHome,
  MdAdd,
  MdClear,
  MdPerson,
} from 'react-icons/md';
import { IVendor } from '../../Interfaces/IVendor';
import { IUserModel } from '../../Interfaces/IUserModel';
import { IApiResponse } from '../../Interfaces/IApiResponse';
import {
  getVendors,
  updateVendor,
  deleteVendor,
} from '../../Services/VendorService';
import { createUser } from '../../Services/UserService';
import Pager from '../../Widgets/Pager/Pager';
import Spinner from '../../Widgets/Spinner/Spinner';
import MgrVendorWidget from '../../Widgets/Manager/MgrVendorWidget';
import './VendorPage.css';

type Props = {
  itemsPerPage: number;
};

type FormData = {
  searchText: string;
};

type EditFormData = {
  id: string;
  name: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  postalCode: string;
  contact: string;
  email: string;
  phone: string;
  fax: string;
  toggleRole: boolean;
};

export default function VendorPage({ itemsPerPage }: Props) {
  const [allVendors, setAllVendors] = useState<IVendor[]>([]);
  const [vendors, setVendors] = useState<IVendor[]>([]);
  const [selectedVendor, setSelectedVendor] = useState<IVendor | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(5);
  const [highestPage, setHighestgPage] = useState<number>(1);
  const [hasRole, setHasRole] = useState<boolean>(false);
  const [token, setToken] = useState<string>('');
  const { isAuthenticated, getAccessTokenSilently } = useAuth0();
  const { isManagerPlus } = useUser();
  const { setAlert } = useAlert();
  const navigate = useNavigate();
  const modal = document.getElementById('vp__modal');
  const { register, handleSubmit, reset, watch } = useForm<FormData>({
    mode: 'onBlur',
    defaultValues: {
      searchText: '',
    },
  });
  const {
    register: editRegister,
    handleSubmit: editHandleSubmit,
    reset: editReset,
    setValue: editSetValue,
  } = useForm<EditFormData>({
    mode: 'onBlur',
    defaultValues: {
      id: '',
      name: '',
      address1: '',
      address2: '',
      city: '',
      state: '',
      postalCode: '',
      contact: '',
      email: '',
      phone: '',
      fax: '',
      toggleRole: true,
    },
  });
  async function doLoadVendors() {
    setLoading(true);
    const result = await getVendors();
    setAllVendors(result);
    setLoading(false);
  }
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
    doLoadVendors();
    setCurrentPage(1);
    setPageSize(itemsPerPage <= 0 ? 5 : itemsPerPage > 10 ? 10 : itemsPerPage);
    setHighestgPage(Math.ceil(allVendors.length / pageSize));
  }, [itemsPerPage, pageSize, allVendors.length]);
  useEffect(() => {
    const offset = (currentPage - 1) * pageSize;
    setVendors(allVendors.slice(offset, offset + pageSize));
  }, [allVendors, pageSize, currentPage]);
  function pageChanged(newPage: number) {
    if (newPage >= 1 && newPage <= highestPage) {
      setCurrentPage(newPage);
    }
  }
  function doSearch(data: FormData) {
    if (allVendors) {
      const ret = allVendors.find(
        (x) => x.name.toLowerCase().indexOf(data.searchText.toLowerCase()) >= 0,
      );
      if (ret) {
        const ix = allVendors.findIndex((x) => x.id === ret.id);
        if (ix >= 0) {
          setCurrentPage(Math.floor(ix / pageSize) + 1);
          return;
        }
      }
    }
    setAlert('No matching vendor found', 'warning', 5000);
  }
  function resetSearch() {
    reset({ searchText: '' });
    setCurrentPage(1);
  }
  function createVendor() {
    navigate('/CreateVendor');
  }
  function editVendor(vendor: IVendor) {
    setHasRole(vendor.hasVendorRole);
    setSelectedVendor(vendor);
    editReset({
      id: vendor?.id,
      name: vendor?.name,
      address1: vendor?.address1,
      address2: vendor?.address2,
      city: vendor?.city,
      state: vendor?.state,
      postalCode: vendor?.postalCode,
      contact: vendor?.contact,
      email: vendor?.email,
      phone: vendor?.phone,
      fax: vendor?.fax,
      toggleRole: !vendor.hasVendorRole,
    });
    if (vendor) {
      // @ts-ignore
      modal.showModal();
    }
  }
  async function saveEditChanges(data: EditFormData) {
    if (!data.name || !data.contact || !data.email) {
      setAlert('All fields marked with red stars are required', 'error', 5000);
      return;
    }
    const vendor: IVendor = {
      ...data,
      hasVendorRole: selectedVendor?.hasVendorRole || false,
      userExists: selectedVendor?.userExists || false,
      canDelete: selectedVendor?.canDelete || true,
    };
    const result = await updateVendor(vendor, data.toggleRole, token);
    if (result.ok) {
      const cp = currentPage;
      await doLoadVendors();
      setCurrentPage(cp);
      setAlert('Vendor Updated', 'info');
      // @ts-ignore
      modal.close();
      return;
    }
    setAlert((result.body as IApiResponse).message, 'error', 5000);
  }
  async function doDeleteVendor(vendor: IVendor) {
    if (vendor) {
      const result = await deleteVendor(vendor, token);
      if (result && result.code === 0) {
        await doLoadVendors();
        setAlert('Vendor deleted', 'info');
      }
    }
  }
  function resetEditForm() {
    editReset({
      id: selectedVendor?.id,
      name: selectedVendor?.name,
      address1: selectedVendor?.address1,
      address2: selectedVendor?.address2,
      city: selectedVendor?.city,
      state: selectedVendor?.state,
      postalCode: selectedVendor?.postalCode,
      contact: selectedVendor?.contact,
      email: selectedVendor?.email,
      phone: selectedVendor?.phone,
      fax: selectedVendor?.fax,
      toggleRole: !selectedVendor?.hasVendorRole,
    });
  }
  async function cancelEdit() {
    // @ts-ignore
    modal.close();
    await doLoadVendors();
  }
  async function createVendorUser() {
    if (
      !selectedVendor ||
      !selectedVendor.name ||
      !selectedVendor.contact ||
      !selectedVendor.email
    ) {
      setAlert(
        'Information is missing. Fields with red stars are required',
        'error',
        5000,
      );
      return;
    }
    const user: IUserModel = {
      id: '',
      identifier: '',
      email: selectedVendor!.email,
      firstName: '',
      lastName: '',
      displayName: selectedVendor.email,
      dateJoined: new Date().toISOString(),
      jobTitles: '["Vendor"]',
    };
    const response = await createUser(user, token);
    if (response && response.ok) {
      setAlert('User Created', 'info');
      setHasRole(true);
      editSetValue('toggleRole', false);
      return;
    }
    const apiresult = response.body as IApiResponse;
    if (apiresult) {
      setAlert(apiresult.message, 'error', 5000);
      return;
    }
    setAlert(`An unexpected error occurred (${response.code})`, 'error', 5000);
  }
  return (
    <div className="container">
      <dialog className="modal" id="vp__modal">
        <div className="vp__ev__container">
          <div className="vp__ev__header">
            <div className="vp__ev__heading">Edit Vendor</div>
          </div>
          <div className="vp__ev__body">
            <form
              className="vp__ev__editform"
              onSubmit={editHandleSubmit(saveEditChanges)}
            >
              <input type="hidden" {...editRegister('id')} />
              <div className="vp__ev__formitem">
                <label className="vp__ev__formlabel" htmlFor="name">
                  Name<span className="redstar">*</span>
                </label>
                <input
                  id="name"
                  className="vp__ev__forminput"
                  type="text"
                  {...editRegister('name')}
                  placeholder="Name"
                />
              </div>
              <div className="vp__ev__formitem">
                <label className="vp__ev__formlabel" htmlFor="address1">
                  Address
                </label>
                <input
                  id="address1"
                  className="vp__ev__forminput"
                  type="text"
                  {...editRegister('address1')}
                  placeholder="Address Line 1"
                />
              </div>
              <div className="vp__ev__formitem">
                <label className="vp__ev__formlabel" htmlFor="address2">
                  &nbsp;
                </label>
                <input
                  id="address2"
                  className="vp__ev__forminput"
                  type="text"
                  {...editRegister('address2')}
                  placeholder="Address Line 2"
                />
              </div>
              <div className="vp__ev__formitem vp__ev__6across">
                <label
                  className="vp__ev__formlabel vp__ev__1of6"
                  htmlFor="city"
                >
                  City
                </label>
                <input
                  className="vp__ev__forminput vp__ev__2of6"
                  id="city"
                  type="text"
                  {...editRegister('city')}
                  placeholder="City"
                />
                <label
                  className="vp__ev__formlabel vp__ev__3of6"
                  htmlFor="state"
                >
                  State
                </label>
                <input
                  className="vp__ev__forminput vp__ev__4of6"
                  id="state"
                  type="text"
                  {...editRegister('state')}
                  placeholder="State"
                />
                <label
                  className="vp__ev__formlabel vp__ev__5of6"
                  htmlFor="postalCode"
                >
                  Postal Code
                </label>
                <input
                  className="vp__ev__forminput vp__ev__6of6"
                  id="postalCode"
                  type="text"
                  {...editRegister('postalCode')}
                  placeholder="Postal Code"
                />
              </div>
              <div className="vp__ev__formitem vo__ev__4across">
                <label
                  className="vp__ev__formlabel vp__ev__1of4"
                  htmlFor="contact"
                >
                  Contact<span className="redstar">*</span>
                </label>
                <input
                  className="vp__ev__forminput vp__ev__2of4"
                  id="contact"
                  type="string"
                  {...editRegister('contact')}
                  placeholder="Contact"
                />
                <label
                  className="vp__ev__formlabel vp__ev__3of4"
                  htmlFor="email"
                >
                  Email<span className="redstar">*</span>
                </label>
                <input
                  className="vp__ev__forminput vp__ev__4of4"
                  id="email"
                  type="email"
                  {...editRegister('email')}
                  placeholder="Email"
                />
              </div>
              <div className="vp__ev__formitem vo__ev__4across">
                <label
                  className="vp__ev__formlabel vp__ev__1of4"
                  htmlFor="phone"
                >
                  Phone
                </label>
                <input
                  className="vp__ev__forminput vp__ev__2of4"
                  id="phone"
                  type="string"
                  {...editRegister('phone')}
                  placeholder="Phone"
                />
                <label className="vp__ev__formlabel vp__ev__3of4" htmlFor="fax">
                  Fax
                </label>
                <input
                  className="vp__ev__forminput vp__ev__4of4"
                  id="fax"
                  type="text"
                  {...editRegister('fax')}
                  placeholder="Fax"
                />
              </div>
              <div className="vp__ev__formitem">
                <label className="vp__ev__formlabel" htmlFor="toggleRole">
                  {hasRole ? 'Remove Role' : 'Add Role'}
                </label>
                <input
                  id="toggleRole"
                  className="vp__ev__forminput vp__ev__checkbox"
                  type="checkbox"
                  {...editRegister('toggleRole')}
                />
              </div>
              <div className="vp__ev__buttoncontainer">
                <button
                  className="primarybutton vp__ev__button"
                  type="submit"
                  title="Save Changes"
                >
                  <span>
                    <MdSave /> Save
                  </span>
                </button>
                <button
                  className="secondarybutton vp__ev__button"
                  type="button"
                  onClick={createVendorUser}
                  title="Create User for this Vendor"
                  disabled={selectedVendor?.userExists}
                >
                  <span>
                    <MdPerson /> Create
                  </span>
                </button>
                <button
                  className="secondarybutton vp__ev__button"
                  type="button"
                  onClick={resetEditForm}
                  title="Reset this Form"
                >
                  <span>
                    <MdClear /> Reset
                  </span>
                </button>
                <button
                  className="secondarybutton vp__ev__button"
                  type="button"
                  onClick={cancelEdit}
                  title="Cancel Edit"
                >
                  <span>
                    <MdCancel /> Cancel
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </dialog>
      <div className="header">
        <div className="heading">Manage Vendors</div>
        <button
          className="primarybutton headerbutton-left"
          onClick={() => navigate('/Home')}
        >
          <span>
            <MdHome /> Home
          </span>
        </button>
        <button
          type="button"
          className="secondarybutton headerbutton-right"
          onClick={createVendor}
        >
          <span>
            <MdAdd /> Create
          </span>
        </button>
      </div>
      <div className="content">
        {loading && (
          <div className="loading">
            <Spinner /> Loading...
          </div>
        )}
        {!loading && vendors && vendors.length === 0 && (
          <div className="noitemsfound">No Vendors Found</div>
        )}
        {!loading && vendors && vendors.length > 0 && (
          <div className="vp__body">
            <Pager
              numItems={allVendors.length}
              itemsPerPage={pageSize}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              prevButtonContent={
                <span className="vp__pagerbuttoncontent">
                  <MdArrowLeft /> Prev
                </span>
              }
              nextButtonContent={
                <span className="vp__pagerbuttoncontent">
                  Next <MdArrowRight />
                </span>
              }
              onPageChanged={pageChanged}
              showPages={true}
              onReset={() => {
                doLoadVendors();
              }}
            >
              <div className="vp__pagercontent">
                <div className="vp__pc__name">Vendors</div>
                <div className="vp__pc__searchform">
                  <form
                    className="vp__pc__form"
                    onSubmit={handleSubmit(doSearch)}
                  >
                    <input
                      type="search"
                      className="vp__pc__f__input"
                      {...register('searchText')}
                      placeholder="Name Search"
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
            <div className="vp__vendorlist">
              {vendors.map((x) => (
                <div key={x.id}>
                  <MgrVendorWidget
                    vendor={x}
                    onEdit={editVendor}
                    onDelete={doDeleteVendor}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
