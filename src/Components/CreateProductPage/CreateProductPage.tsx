import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Select, MenuItem, SelectChangeEvent } from '@mui/material';
import { useAlert } from '../../Contexts/AlertContext';
import { useAuth0 } from '@auth0/auth0-react';
import { useUser } from '../../Contexts/UserContext';
import { MdSave, MdCancel, MdHome, MdClear, MdRefresh } from 'react-icons/md';
import { generateSku, generateLoremIpsum } from '../../Services/tools';
import { getCategories } from '../../Services/CategoryService';
import { getVendors } from '../../Services/VendorService';
import { IProduct } from '../../Interfaces/IProduct';
import { ICategory } from '../../Interfaces/ICategory';
import { IVendor } from '../../Interfaces/IVendor';
import { createProduct } from '../../Services/ProductService';
import { IApiResponse } from '../../Interfaces/IApiResponse';
import CategoryNameWidget from '../../Widgets/Category/CategoryNameWidget';
import './CreateProductPage.css';

type FormData = {
  id: string;
  categoryId: string;
  vendorId: string;
  name: string;
  description: string;
  sku: string;
  price: number;
  ageRequired: number;
  quantity: number;
  reorderLevel: number;
  reorderAmount: number;
  cost: number;
};

export default function CreateProductPage() {
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<ICategory | null>(
    null,
  );
  const [vendors, setVendors] = useState<IVendor[]>([]);
  const [selectedVendor, setSelectedVendor] = useState<IVendor | null>(null);
  const { isAuthenticated, getAccessTokenSilently } = useAuth0();
  const { isManagerPlus } = useUser();
  const navigate = useNavigate();
  const { setAlert } = useAlert();
  const { register, handleSubmit, reset, setValue } = useForm<FormData>({
    mode: 'onBlur',
    defaultValues: {
      id: '',
      categoryId: '',
      vendorId: '',
      name: '',
      description: '',
      sku: '',
      price: 0,
      ageRequired: 0,
      quantity: 0,
      reorderLevel: 0,
      reorderAmount: 0,
      cost: 0,
    },
  });
  useEffect(() => {
    if (!isAuthenticated || !isManagerPlus) {
      navigate('/Home');
    }
  }, [isAuthenticated, isManagerPlus, navigate]);
  useEffect(() => {
    async function doLoadCategories() {
      const cats = await getCategories();
      setCategories(cats);
    }
    async function doLoadVendors() {
      const vens = await getVendors();
      setVendors(vens);
    }
    doLoadCategories();
    doLoadVendors();
  }, []);
  function resetForm() {
    reset({
      id: '',
      categoryId: '',
      vendorId: '',
      name: '',
      description: '',
      sku: '',
      price: 0,
      ageRequired: 0,
      quantity: 0,
      reorderLevel: 0,
      reorderAmount: 0,
      cost: 0,
    });
    setSelectedCategory(null);
    setSelectedVendor(null);
    document.getElementById('name')?.focus();
  }
  async function doCreateProduct(data: FormData) {
    if (!data.name || !data.description || !data.sku || data.price === 0) {
      setAlert('All fields marked with a red star are required', 'error', 5000);
      return;
    }
    if (
      !data.categoryId ||
      data.categoryId === '0' ||
      !data.vendorId ||
      data.vendorId === '0'
    ) {
      setAlert('Please select a category and a vendor', 'error', 5000);
      return;
    }
    const product: IProduct = {
      ...data,
      discontinued: false,
      currentPromotion: null,
      promotions: [],
      category: null,
      vendor: null,
      canDelete: true,
    };
    const result = await createProduct(product, await getAccessTokenSilently());
    if (result && result.ok) {
      resetForm();
      setAlert('Product created successfully', 'info');
      return;
    }
    if (result && !result.ok && result.body) {
      setAlert(
        `Error creating product: ${(result.body as IApiResponse)?.message}`,
        'error',
        5000,
      );
      return;
    }
    setAlert(
      `Unexpected error creating product (${
        (result.body as IApiResponse).code || 0
      })`,
      'error',
      5000,
    );
  }
  function cancelClick() {
    navigate('/Products');
  }
  function homeClick() {
    navigate('/Home');
  }
  function categoryChanged(e: SelectChangeEvent<string>) {
    if (e && e.target && e.target.value) {
      setValue('categoryId', e.target.value);
    }
    setSelectedCategory(
      categories.find((x) => x.id === e.target.value) || null,
    );
  }
  function vendorChanged(e: SelectChangeEvent<string>) {
    if (e && e.target && e.target.value) {
      setValue('vendorId', e.target.value);
    }
    setSelectedVendor(vendors.find((x) => x.id === e.target.value) || null);
  }
  return (
    <div className="container">
      <div className="header">
        <div className="heading">Create a Product</div>
        <button
          className="primarybutton headerbutton-left"
          type="button"
          onClick={homeClick}
        >
          <span>
            <MdHome /> Home
          </span>
        </button>
        <button
          className="secondarybutton headerbutton-right"
          type="button"
          onClick={cancelClick}
        >
          <span>
            <MdCancel /> Cancel
          </span>
        </button>
      </div>
      <div className="content">
        <form className="form-outline" onSubmit={handleSubmit(doCreateProduct)}>
          <input type="hidden" {...register('id')} />
          <input type="hidden" {...register('categoryId')} />
          <input type="hidden" {...register('vendorId')} />
          <div className="formitem">
            <label className="formlabel" htmlFor="name">
              Name<span className="redstar">*</span>
            </label>
            <input
              className="forminput"
              id="name"
              {...register('name')}
              autoFocus
              placeholder="Name"
            />
          </div>
          <div className="formitem">
            <label className="formlabel" htmlFor="category">
              Category<span className="redstar">*</span>
            </label>
            <Select
              className="forminput cpp__select"
              id="category"
              value={selectedCategory?.id || '0'}
              onChange={categoryChanged}
            >
              <MenuItem key={'0'} value="0">
                Select a Category
              </MenuItem>
              {categories.map((x) => (
                <MenuItem key={x.id} value={x.id}>
                  <CategoryNameWidget category={x} />
                </MenuItem>
              ))}
            </Select>
          </div>
          <div className="formitem">
            <label className="formlabel" htmlFor="vendor">
              Vendor<span className="redstar">*</span>
            </label>
            <Select
              className="forminput cpp__select"
              id="vendor"
              value={selectedVendor?.id || '0'}
              onChange={vendorChanged}
            >
              <MenuItem key={'0'} value="0">
                Select a Vendor
              </MenuItem>
              {vendors.map((x) => (
                <MenuItem key={x.id} value={x.id}>
                  {x.name}
                </MenuItem>
              ))}
            </Select>
          </div>
          <div className="formitem">
            <label className="formlabel" htmlFor="description">
              Description<span className="redstar">*</span>
            </label>
            <textarea
              className="forminput cpp__description"
              id="description"
              {...register('description')}
              placeholder="Description"
            />
            <button
              className="squarebutton"
              type="button"
              onClick={() =>
                setValue('description', generateLoremIpsum(10, 15, 1, 3, 1))
              }
              title="Generate Description"
            >
              <span>
                <MdRefresh />
              </span>
            </button>
          </div>
          <div className="formitem">
            <label className="formlabel" htmlFor="sku">
              Sku<span className="redstar">*</span>
            </label>
            <input
              className="forminput"
              type="text"
              {...register('sku')}
              placeholder="SKU"
            />
            <button
              className="squarebutton"
              type="button"
              onClick={() => setValue('sku', generateSku(9))}
              title="Generate SKU"
            >
              <span>
                <MdRefresh />
              </span>
            </button>
          </div>
          <div className="formitem">
            <label className="formlabel" htmlFor="price">
              Price<span className="redstar">*</span>
            </label>
            <input
              className="forminput"
              type="number"
              min={0}
              step={0.01}
              {...register('price')}
              placeholder="Price"
            />
          </div>
          <div className="formitem">
            <label className="formlabel" htmlFor="ageRequired">
              Age&nbsp;Required
            </label>
            <input
              className="forminput"
              type="number"
              id="ageRequired"
              min={0}
              step={1}
              {...register('ageRequired')}
              placeholder="Age Required"
            />
          </div>
          <div className="formitem">
            <label className="formlabel" htmlFor="quantity">
              Quantity
            </label>
            <input
              className="forminput"
              type="number"
              min={0}
              step={1}
              id="quantity"
              {...register('quantity')}
              placeholder="Quantity"
            />
          </div>
          <div className="formitem">
            <label className="formlabel" htmlFor="reorderLevel">
              Reorder&nbsp;Level
            </label>
            <input
              className="forminput"
              type="number"
              min={0}
              step={1}
              id="reorderLevel"
              {...register('reorderLevel')}
              placeholder="Reorder Level"
            />
          </div>
          <div className="formitem">
            <label className="formlabel" htmlFor="reorderAmount">
              Reorder&nbsp;Amount
            </label>
            <input
              className="forminput"
              type="number"
              min={0}
              step={0}
              id="reorderAmount"
              {...register('reorderAmount')}
              placeholder="Reorder Amount"
            />
          </div>
          <div className="formitem">
            <label className="formlabel" htmlFor="cost">
              Cost
            </label>
            <input
              className="forminput"
              type="number"
              min={0}
              step={0.01}
              id="cost"
              {...register('cost')}
              placeholder="Cost"
            />
          </div>
          <div className="buttoncontainer cpp__buttoncontainer">
            <button className="primarybutton" type="submit">
              <span>
                <MdSave /> Save
              </span>
            </button>
            <button
              className="secondarybutton"
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
