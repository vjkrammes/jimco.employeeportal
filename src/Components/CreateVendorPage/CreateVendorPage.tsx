import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useAlert } from '../../Contexts/AlertContext';
import { MdSave, MdHome, MdCancel, MdCheck, MdClear } from 'react-icons/md';
import { IVendor } from '../../Interfaces/IVendor';
import { useUser } from '../../Contexts/UserContext';
import { createVendor } from '../../Services/VendorService';
import { createUser } from '../../Services/UserService';
import { useAuth0 } from '@auth0/auth0-react';
import { IUserModel } from '../../Interfaces/IUserModel';
import { IApiResponse } from '../../Interfaces/IApiResponse';
import './CreateVendorPage.css';

type FormData = {
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
  createUser: boolean;
  firstName: string;
  lastName: string;
  displayName: string;
};

export default function CreateVendorPage() {
  const [modalHeading, setModalHeading] = useState<string>('');
  const [vendorResult, setVendorResult] = useState<string>('');
  const [userResult, setUserResult] = useState<string>('');
  const [modal, setModal] = useState<HTMLElement | null>(null);
  const { isAuthenticated, getAccessTokenSilently } = useAuth0();
  const { isManagerPlus } = useUser();
  const { setAlert } = useAlert();
  const navigate = useNavigate();
  const { register, handleSubmit, reset, watch } = useForm<FormData>({
    mode: 'onBlur',
    defaultValues: {
      createUser: true,
    },
  });
  useEffect(() => {
    if (!isAuthenticated || !isManagerPlus) {
      navigate('/Home');
    }
    setModal(document.getElementById('cvp__modal'));
  }, [isAuthenticated, isManagerPlus, navigate]);
  function resetForm() {
    reset({
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
      createUser: true,
      firstName: '',
      lastName: '',
      displayName: '',
    });
    document.getElementById('name')?.focus();
  }
  async function doCreateVendor(data: FormData) {
    if (
      !data.name ||
      !data.contact ||
      !data.email ||
      (data.createUser && !data.displayName)
    ) {
      setAlert('All fields marked with red stars are required', 'error', 5000);
      return;
    }
    setModalHeading('');
    const vendor: IVendor = {
      ...data,
      id: '',
      hasVendorRole: false,
      userExists: false,
      canDelete: true,
    };
    if (data.createUser) {
      const user: IUserModel = {
        ...data,
        id: '',
        identifier: '',
        dateJoined: new Date().toISOString(),
        jobTitles: '["Vendor"]',
      };
      const uresult = await createUser(user, await getAccessTokenSilently());
      if (uresult && uresult.ok) {
        setUserResult('User created successfully');
      } else if (uresult && !uresult.ok) {
        setUserResult(
          `User creation failed: ${(uresult.body as IApiResponse)?.message}`,
        );
      } else {
        setUserResult(
          `Error creating user (${(uresult.body as IApiResponse)?.code ?? 0})`,
        );
      }
    }
    const vresult = await createVendor(
      vendor,
      true,
      await getAccessTokenSilently(),
    );
    if (vresult && vresult.ok) {
      setVendorResult('Vendor created successfully');
    } else if (vresult && !vresult.ok) {
      setVendorResult(
        `Vendor creation failed: ${(vresult.body as IApiResponse)?.message}`,
      );
    } else {
      setVendorResult(
        `Error creating vendor (${(vresult.body as IApiResponse)?.code ?? 0})`,
      );
    }
    setModalHeading('Vendor Creation Results');
    // @ts-ignore
    modal.showModal();
    resetForm();
  }
  function closeModal() {
    // @ts-ignore
    modal.close();
  }
  function cancelClick() {
    navigate('/Vendors');
  }
  function homeClick() {
    navigate('/Home');
  }
  return (
    <div className="container">
      <dialog className="modal" id="cvp__modal">
        <div className="cvp__m__container">
          <div className="cvp__m__heading">{modalHeading}</div>
          <div className="cvp__m__messages">
            <div className="cvp__m__vendorresult">{vendorResult}</div>
            <div className="cvp__m__userresult">{userResult}</div>
          </div>
          <div className="buttoncontainer">
            <button
              className="primarybutton cvp__m__okbutton"
              type="button"
              onClick={closeModal}
            >
              <span>
                <MdCheck /> OK
              </span>
            </button>
          </div>
        </div>
      </dialog>
      <div className="header">
        <div className="heading">Create a Vendor</div>
        <button className="primarybutton headerbutton-left" onClick={homeClick}>
          <span>
            <MdHome /> Home
          </span>
        </button>
        <button
          className="secondarybutton headerbutton-right"
          onClick={cancelClick}
        >
          <span>
            <MdCancel /> Cancel
          </span>
        </button>
      </div>
      <div className="content">
        <form className="cvp__form" onSubmit={handleSubmit(doCreateVendor)}>
          <div className="cvp__formitem">
            <label className="cvp__formlabel" htmlFor="name">
              Name<span className="redstar">*</span>
            </label>
            <input
              className="cvp__forminput"
              id="name"
              {...register('name')}
              placeholder="Name"
              autoFocus
            />
          </div>
          <div className="cvp__formitem">
            <label className="cvp__formlabel" htmlFor="address1">
              Address
            </label>
            <input
              className="cvp__forminput"
              id="address1"
              {...register('address1')}
              placeholder="Address Line 1"
            />
          </div>
          <div className="cvp__formitem">
            <label className="cvp__formlabel" htmlFor="address2">
              &nbsp;
            </label>
            <input
              className="cvp__forminput"
              id="address2"
              {...register('address2')}
              placeholder="Address Line 2"
            />
          </div>
          <div className="cvp__formitem">
            <label className="cvp__formlabel" htmlFor="city">
              City
            </label>
            <input
              className="cvp__forminput"
              id="city"
              {...register('city')}
              placeholder="City"
            />
          </div>
          <div className="cvp__formitem">
            <label className="cvp__formlabel" htmlFor="state">
              State
            </label>
            <input
              className="cvp__forminput"
              id="state"
              {...register('state')}
              placeholder="State"
            />
          </div>
          <div className="cvp__formitem">
            <label className="cvp__formlabel" htmlFor="postalCode">
              Postal&nbsp;Code
            </label>
            <input
              className="cvp__forminput"
              id="postalCode"
              {...register('postalCode')}
              placeholder="Postal Code"
            />
          </div>
          <div className="cvp__formitem">
            <label className="cvp__formlabel" htmlFor="contact">
              Contact<span className="redstar">*</span>
            </label>
            <input
              className="cvp__forminput"
              id="contact"
              {...register('contact')}
              placeholder="Contact Name"
            />
          </div>
          <div className="cvp__formitem">
            <label className="cvp__formlabel" htmlFor="email">
              Email<span className="redstar">*</span>
            </label>
            <input
              className="cvp__forminput"
              type="email"
              id="email"
              {...register('email')}
              placeholder="Email Address"
            />
          </div>
          <div className="cvp__formitem">
            <label className="cvp__formlabel" htmlFor="phone">
              Phone
            </label>
            <input
              className="cvp__forminput"
              id="phone"
              {...register('phone')}
              placeholder="Phone Number"
            />
          </div>
          <div className="cvp__formitem">
            <label className="cvp__formlabel" htmlFor="fax">
              Fax
            </label>
            <input
              className="cvp__forminput"
              id="fax"
              {...register('fax')}
              placeholder="Fax Number"
            />
          </div>
          {/* optional stuff goes here */}
          <div className="cvp__formitem">
            <label className="cvp__formlabel" htmlFor="createUser">
              Create&nbsp;User
            </label>
            <input
              className="cvp__forminput cvp__checkbox"
              id="createUser"
              type="checkbox"
              {...register('createUser')}
            />
          </div>
          {watch('createUser') && (
            <>
              <div className="cvp__formitem">
                <label className="cvp__formlabel" htmlFor="firstName">
                  First&nbsp;Name
                </label>
                <input
                  className="cvp__forminput"
                  id="firstName"
                  {...register('firstName')}
                  placeholder="First Name"
                />
              </div>
              <div className="cvp__formitem">
                <label className="cvp__formlabel" htmlFor="lastName">
                  Last&nbsp;Name
                </label>
                <input
                  className="cvp__forminput"
                  id="lastName"
                  {...register('lastName')}
                  placeholder="Last Name"
                />
              </div>
              <div className="cvp__formitem">
                <label className="cvp__formlabel" htmlFor="displayName">
                  Display<span className="redstar">*</span>
                </label>
                <input
                  className="cvp__forminput"
                  id="displayName"
                  {...register('displayName')}
                  placeholder="Display Name"
                />
              </div>
            </>
          )}
          <div className="buttoncontainer">
            <button className="primarybutton cvp__createbutton" type="submit">
              <span>
                <MdSave /> Save
              </span>
            </button>
            <button
              className="secondarybutton cvp__resetbutton"
              type="button"
              onClick={resetForm}
            >
              <span>
                <MdClear /> Reset
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
