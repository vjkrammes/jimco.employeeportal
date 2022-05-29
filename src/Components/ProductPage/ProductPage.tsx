import { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useAlert } from '../../Contexts/AlertContext';
import { useAuth0 } from '@auth0/auth0-react';
import {
  MdAdd,
  MdHome,
  MdArrowLeft,
  MdArrowRight,
  MdSearch,
  MdSave,
  MdCancel,
  MdClear,
} from 'react-icons/md';
import { ICategory } from '../../Interfaces/ICategory';
import { IProduct } from '../../Interfaces/IProduct';
import { IVendor } from '../../Interfaces/IVendor';
import { getCategories } from '../../Services/CategoryService';
import {
  deleteProduct,
  getProducts,
  updateProduct,
} from '../../Services/ProductService';
import { useUser } from '../../Contexts/UserContext';
import { IApiResponse } from '../../Interfaces/IApiResponse';
import { getVendors } from '../../Services/VendorService';
import Spinner from '../../Widgets/Spinner/Spinner';
import MgrProductWidget from '../../Widgets/Manager/MgrProductWidget';
import Pager from '../../Widgets/Pager/Pager';
import './ProductPage.css';

type Props = {
  itemsPerPage: number;
};

type FormData = {
  searchText: string;
};

type EditFormData = {
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
  discontinued: boolean;
};

export default function ProductPage({ itemsPerPage }: Props) {
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<ICategory | null>(
    null,
  );
  const [vendors, setVendors] = useState<IVendor[]>([]);
  const [selectedVendor, setSelectedVendor] = useState<IVendor | null>(null);
  const [allProducts, setAllProducts] = useState<IProduct[]>([]);
  const [products, setProducts] = useState<IProduct[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<IProduct | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(5);
  const [highestPage, setHighestPage] = useState<number>(1);
  const { isAuthenticated, getAccessTokenSilently } = useAuth0();
  const { setAlert } = useAlert();
  const { isManagerPlus } = useUser();
  const navigate = useNavigate();
  const modal = document.getElementById('pp__modal');
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
      discontinued: false,
    },
  });
  async function doLoadProducts() {
    setLoading(true);
    const result = await getProducts();
    setAllProducts(result);
    setLoading(false);
    setCurrentPage(1);
  }
  async function doLoadCategories() {
    const cats = await getCategories();
    setCategories(cats || []);
  }
  async function doLoadVendors() {
    const vens = await getVendors();
    setVendors(vens);
  }
  useEffect(() => {
    if (!isAuthenticated || !isManagerPlus) {
      navigate('/Home');
    }
  }, [isAuthenticated, isManagerPlus, navigate]);
  useEffect(() => {
    setLoading(true);
    doLoadCategories();
    doLoadVendors();
    doLoadProducts();
    setCurrentPage(1);
    setPageSize(itemsPerPage <= 0 ? 5 : itemsPerPage > 10 ? 10 : itemsPerPage);
    setHighestPage(Math.ceil(allProducts.length / pageSize));
  }, [itemsPerPage, pageSize, allProducts.length]);
  useEffect(() => {
    const offset = (currentPage - 1) * pageSize;
    setProducts(allProducts.slice(offset, offset + pageSize));
  }, [allProducts, pageSize, currentPage]);
  function pageChanged(newPage: number) {
    if (newPage >= 1 && newPage <= highestPage) {
      setCurrentPage(newPage);
    }
  }
  function doSearch(data: FormData) {
    if (allProducts) {
      const ret = allProducts.find(
        (x) =>
          x.name.toLowerCase().indexOf(data.searchText.toLocaleLowerCase()) >=
            0 ||
          x.description.toLowerCase().indexOf(data.searchText.toLowerCase()) >=
            0,
      );
      if (ret) {
        const ix = allProducts.findIndex((x) => x.id === ret.id);
        if (ix >= 0) {
          setCurrentPage(Math.floor(ix / pageSize) + 1);
          return;
        }
      }
    }
    setAlert('No matching products found', 'warning', 5000);
  }
  function resetSearch() {
    reset({ searchText: '' });
    setCurrentPage(1);
  }
  function createProduct() {
    navigate('/CreateProduct');
  }
  function doEditProduct(product: IProduct) {
    setSelectedProduct(product);
    editReset({
      id: product?.id,
      categoryId: product?.categoryId,
      vendorId: product?.vendorId,
      name: product?.name,
      description: product?.description,
      sku: product?.sku,
      price: product?.price,
      ageRequired: product?.ageRequired,
      quantity: product?.quantity,
      reorderLevel: product?.reorderLevel,
      reorderAmount: product?.reorderAmount,
      cost: product?.cost,
      discontinued: product?.discontinued,
    });
    setSelectedCategory(
      categories.find((x) => x.id === product?.categoryId) || null,
    );
    setSelectedVendor(vendors.find((x) => x.id === product?.vendorId) || null);
    if (product) {
      //@ts-ignore
      modal.showModal();
    }
  }
  async function saveEditChanges(data: EditFormData) {
    if (!data.name || !data.description || !data.sku || !data.price) {
      setAlert('All fields marked with red stars wre required', 'error', 5000);
      return;
    }
    if (
      !data.categoryId ||
      data.categoryId === '0' ||
      !data.vendorId ||
      data.vendorId === '0'
    ) {
      setAlert('Category and Vendor are required', 'error', 5000);
      return;
    }
    const product: IProduct = {
      ...data,
      category: null,
      vendor: null,
      promotions: [],
      currentPromotion: null,
      canDelete: selectedProduct?.canDelete || true,
    };
    const response = await updateProduct(
      product,
      await getAccessTokenSilently(),
    );
    if (response && response.ok) {
      // @ts-ignore
      modal.close();
      setSelectedCategory(null);
      setSelectedVendor(null);
      await doLoadProducts();
      setAlert('Product updated', 'info');
      return;
    }
    if (response && response.body) {
      setAlert((response.body as IApiResponse)?.message, 'error', 5000);
      return;
    }
    setAlert(`Unexpected error (${response?.code || 0})`, 'error', 5000);
  }
  function doPromotions(product: IProduct) {
    if (product) {
      navigate(`/Promotions/${product.id}`);
    }
  }
  async function doDeleteProduct(product: IProduct) {
    if (product) {
      const response = await deleteProduct(
        product,
        await getAccessTokenSilently(),
      );
      if (response.code === 0 && !response.message) {
        await doLoadProducts();
        setSelectedCategory(null);
        setSelectedVendor(null);
        setAlert('Product deleted', 'info');
        return;
      }
      if (response.message) {
        setAlert(response.message, 'error', 5000);
        return;
      }
      setAlert(`Unexpected error (${response.code})`, 'error', 5000);
    }
  }
  function resetEditForm() {
    editReset({
      id: selectedProduct?.id,
      categoryId: selectedProduct?.categoryId,
      vendorId: selectedProduct?.vendorId,
      name: selectedProduct?.name,
      description: selectedProduct?.description,
      sku: selectedProduct?.sku,
      price: selectedProduct?.price,
      ageRequired: selectedProduct?.ageRequired,
      quantity: selectedProduct?.quantity,
      reorderLevel: selectedProduct?.reorderLevel,
      reorderAmount: selectedProduct?.reorderAmount,
      cost: selectedProduct?.cost,
      discontinued: selectedProduct?.discontinued,
    });
    setSelectedCategory(
      categories.find((x) => x.id === selectedProduct?.categoryId) || null,
    );
    setSelectedVendor(
      vendors.find((x) => x.id === selectedProduct?.vendorId) || null,
    );
  }
  async function cancelEdit() {
    // @ts-ignore
    modal.close();
    setSelectedCategory(null);
    setSelectedVendor(null);
    await doLoadProducts();
  }
  function categoryChanged(e: ChangeEvent<HTMLSelectElement>) {
    if (e && e.target && e.target.value) {
      setSelectedCategory(
        categories.find((x) => x.id === e.target.value) || null,
      );
      editSetValue('categoryId', e.target.value);
    }
  }
  function vendorChanged(e: ChangeEvent<HTMLSelectElement>) {
    if (e && e.target && e.target.value) {
      setSelectedVendor(vendors.find((x) => x.id === e.target.value) || null);
    }
    editSetValue('vendorId', e.target.value);
  }
  return (
    <div className="container">
      <dialog className="modal" id="pp__modal">
        <div className="pp__ep__container">
          <div className="pp__ep__header">
            <div className="pp__ep__heading">Edit Product</div>
          </div>
          <div className="pp__ep__body">
            <form
              className="pp__ep__editform"
              onSubmit={editHandleSubmit(saveEditChanges)}
            >
              <input type="hidden" {...editRegister('id')} />
              <input type="hidden" {...editRegister('categoryId')} />
              <input type="hidden" {...editRegister('vendorId')} />
              <div className="pp__ep__formitem">
                <label className="pp__ep__formlabel" htmlFor="name">
                  Name<span className="redstar">*</span>
                </label>
                <input
                  className="pp__ep__forminput"
                  type="text"
                  {...editRegister('name')}
                  placeholder="Name"
                  autoFocus
                />
              </div>
              <div className="pp__ep__formitem">
                <label className="pp__ep__formlabel" htmlFor="category">
                  Category<span className="redstar">*</span>
                </label>
                <select
                  className="pp__ep__forminput pp__ep__select"
                  id="category"
                  onChange={categoryChanged}
                  value={selectedCategory?.id || '0'}
                >
                  <option value="0" key="0">
                    Select a Category
                  </option>
                  {categories.map((x) => (
                    <option value={x.id} key={x.id}>
                      {x.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="pp__ep__formitem">
                <label className="pp__ep__formlabel" htmlFor="vendor">
                  Vendor<span className="redstar">*</span>
                </label>
                <select
                  className="pp__ep__forminput pp__ep__select"
                  id="vendor"
                  onChange={vendorChanged}
                  value={selectedVendor?.id || '0'}
                >
                  <option value="0" key="0">
                    Select a Vendor
                  </option>
                  {vendors.map((x) => (
                    <option key={x.id} value={x.id}>
                      {x.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="pp__ep__formitem">
                <label className="pp__ep__formlabel" htmlFor="description">
                  Description<span className="redstar">*</span>
                </label>
                <textarea
                  className="pp__ep__forminput pp__ep__textarea"
                  id="description"
                  {...editRegister('description')}
                  placeholder="Description"
                />
              </div>
              <div className="pp__ep__formitem">
                <label className="pp__ep__formlabel" htmlFor="sku">
                  SKU<span className="redstar">*</span>
                </label>
                <input
                  className="pp__ep__forminput"
                  type="text"
                  {...editRegister('sku')}
                  placeholder="SKU"
                />
                <label className="pp__ep__formlabel" htmlFor="price">
                  Price<span className="redstar">*</span>
                </label>
                <input
                  className="pp__ep__forminput"
                  type="number"
                  {...editRegister('price')}
                  placeholder="Price"
                  min={0}
                  step={0.01}
                />
              </div>
              <div className="pp__ep__formitem">
                <label className="pp__ep__formlabel" htmlFor="agereq">
                  Age Required
                </label>
                <input
                  className="pp__ep__forminput"
                  type="number"
                  id="agereq"
                  {...editRegister('ageRequired')}
                  placeholder="Age Required"
                  min={0}
                  step={1}
                />
                <label className="pp__ep__formlabel" htmlFor="quantity">
                  Quantity
                </label>
                <input
                  className="pp__ep__forminput"
                  type="number"
                  id="quantity"
                  {...editRegister('quantity')}
                  placeholder="Quantity"
                  min={0}
                  step={1}
                />
              </div>
              <div className="pp__ep__formitem">
                <label className="pp__ep__formlabel" htmlFor="rl">
                  Reorder Level
                </label>
                <input
                  className="pp__ep__forminput"
                  type="number"
                  id="rl"
                  {...editRegister('reorderLevel')}
                  placeholder="Reorder Level"
                />
                <label className="pp__ep__formlabel" htmlFor="ra">
                  Reorder Amount
                </label>
                <input
                  className="pp__ep__forminput"
                  type="number"
                  id="ra"
                  {...editRegister('reorderAmount')}
                  placeholder="Reorder Amount"
                  min={0}
                  step={1}
                />
              </div>
              <div className="pp__ep__formitem">
                <label className="pp__ep__formlabel" htmlFor="cost">
                  Cost
                </label>
                <input
                  className="pp__ep__forminput"
                  type="number"
                  id="cost"
                  {...editRegister('cost')}
                  placeholder="Cost"
                  min={0}
                  step={0.01}
                />
                <label className="pp__ep__formlabel" htmlFor="discontinued">
                  Discontinued
                </label>
                <input
                  className="pp__ep__forminput pp__ep__checkbox"
                  type="checkbox"
                  id="discontinued"
                  {...editRegister('discontinued')}
                />
              </div>
              <div className="buttoncontainer">
                <button
                  className="primarybutton pp__ep__button"
                  type="submit"
                  title="Save Changes"
                >
                  <span>
                    <MdSave /> Save
                  </span>
                </button>
                <button
                  className="secondarybutton pp__ep__button"
                  type="button"
                  onClick={resetEditForm}
                  title="Reset this form"
                >
                  <span>
                    <MdClear /> Reset
                  </span>
                </button>
                <button
                  className="secondarybutton pp__ep__button"
                  type="button"
                  onClick={cancelEdit}
                  title="Cancel edit"
                >
                  <MdCancel /> Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </dialog>
      <div className="header">
        <div className="heading">Manage&nbsp;Products</div>
        <button
          className="primarybutton headerbutton-left"
          onClick={() => navigate('/Home')}
        >
          <span>
            <MdHome /> Home
          </span>
        </button>
        <button
          className="secondarybutton headerbutton-right"
          onClick={createProduct}
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
        {!loading && products && products.length === 0 && (
          <div className="noitemsfound">No Products Found</div>
        )}
        {!loading && products && products.length > 0 && (
          <div className="pp__body">
            <Pager
              numItems={allProducts.length}
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
              onReset={() => {
                doLoadProducts();
              }}
            >
              <div className="pp__pagerbuttoncontent">
                <div className="pp__pc__name">Products</div>
                <div className="pp__pc__searchform">
                  <form
                    className="pp__pc__form"
                    onSubmit={handleSubmit(doSearch)}
                  >
                    <input
                      type="search"
                      className="pp__pc__f__input"
                      {...register('searchText')}
                      placeholder="Name or Description Search"
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
            <div className="pp__productlist">
              {products.map((x) => (
                <div key={x.id}>
                  <MgrProductWidget
                    product={x}
                    onEdit={doEditProduct}
                    onPromotions={doPromotions}
                    onDelete={doDeleteProduct}
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
