import { useEffect, useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import {
  MdHome,
  MdAdd,
  MdCancel,
  MdSave,
  MdRefresh,
  MdDelete,
} from 'react-icons/md';
import { useAuth0 } from '@auth0/auth0-react';
import { useUser } from '../../Contexts/UserContext';
import { useAlert } from '../../Contexts/AlertContext';
import { IProduct } from '../../Interfaces/IProduct';
import { IPromotion } from '../../Interfaces/IPromotion';
import {
  getPromotions,
  createPromotion,
  updatePromotion,
  cancelPromotion,
  deletePromotion,
  deleteExpiredPromotions,
  deleteAllExpiredPromotions,
  unCancelPromotion,
} from '../../Services/PromotionService';
import { getProductById } from '../../Services/ProductService';
import { HttpResponse } from '../../Services/http';
import { IApiResponse } from '../../Interfaces/IApiResponse';
import MgrPromotionWidget from '../../Widgets/Manager/MgrPromotionWidget';
import ProductSummaryWidget from '../../Widgets/Product/ProductSummaryWidget';
import Spinner from '../../Widgets/Spinner/Spinner';
import './PromotionsPage.css';

type FormData = {
  id: string;
  productId: string;
  startDate: string;
  stopDate: string;
  price: number;
  description: string;
  limitedQuantity: boolean;
  maximumQuantity: number;
};

export default function PromotionsPage() {
  const { productId } = useParams();
  const [product, setProduct] = useState<IProduct | null>(null);
  const [promotions, setPromotions] = useState<IPromotion[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedPromotion, setSelectedPromotion] = useState<IPromotion | null>(
    null,
  );
  const [editing, setEditing] = useState<boolean>(false);
  const [token, setToken] = useState<string>('');
  const { isAuthenticated, getAccessTokenSilently } = useAuth0();
  const { isManagerPlus, user } = useUser();
  const navigate = useNavigate();
  const { setAlert } = useAlert();
  const modal = document.getElementById('promopage__modal');
  const { register, handleSubmit, watch, setValue, reset } = useForm<FormData>({
    mode: 'onBlur',
    defaultValues: {
      id: '',
      productId: '',
      startDate: '',
      stopDate: '',
      price: 0,
      description: '',
      limitedQuantity: false,
      maximumQuantity: 0,
    },
  });
  const doLoadPromotions = useCallback(async () => {
    if (productId) {
      const promos = await getPromotions(productId);
      setPromotions(promos);
      setSelectedPromotion(null);
    }
  }, [productId]);
  useEffect(() => {
    async function doReadProduct() {
      if (productId) {
        const prod = await getProductById(productId);
        if (prod) {
          setProduct(prod);
        }
      }
    }
    async function doGetToken() {
      const t = await getAccessTokenSilently();
      setToken(t);
    }
    if (!isAuthenticated || !isManagerPlus) {
      navigate('/Home');
    }
    doReadProduct();
    doLoadPromotions();
    setLoading(false);
    doGetToken();
  }, [
    isAuthenticated,
    isManagerPlus,
    navigate,
    productId,
    doLoadPromotions,
    getAccessTokenSilently,
  ]);
  function getYYYYMMDD(date: Date | string): string {
    if (!date) {
      return '';
    }
    return new Date(date).toISOString().split('T')[0];
  }
  function toggleLimitedQuantity() {
    const oldval = watch('limitedQuantity');
    setValue('limitedQuantity', !watch('limitedQuantity'));
    if (oldval) {
      setValue('maximumQuantity', 0);
    } else {
      if (editing) {
        setValue('maximumQuantity', selectedPromotion?.maximumQuantity || 0);
      }
    }
  }
  function doCreate() {
    reset({
      id: '',
      productId: '',
      startDate: '',
      stopDate: '',
      price: 0,
      description: '',
      limitedQuantity: false,
      maximumQuantity: 0,
    });
    setEditing(false);
    // @ts-ignore
    modal.showModal();
  }
  function doReset() {
    reset({
      id: selectedPromotion?.id || '',
      productId: selectedPromotion?.productId || '',
      startDate: selectedPromotion
        ? getYYYYMMDD(selectedPromotion.startDate)
        : '',
      stopDate: selectedPromotion
        ? getYYYYMMDD(selectedPromotion.stopDate)
        : '',
      price: selectedPromotion?.price || 0,
      description: selectedPromotion?.description || '',
      limitedQuantity: selectedPromotion?.limitedQuantity || false,
      maximumQuantity: selectedPromotion?.maximumQuantity || 0,
    });
    document.getElementById('startDate')?.focus();
  }
  function doCloseModal() {
    setEditing(false);
    setSelectedPromotion(null);
    // @ts-ignore
    modal.close();
  }
  function doEdit(promotion: IPromotion) {
    if (promotion) {
      setEditing(true);
      setSelectedPromotion(promotion);
      reset({
        id: promotion?.id || '',
        productId: promotion?.productId || '',
        startDate: getYYYYMMDD(promotion.startDate),
        stopDate: getYYYYMMDD(promotion.stopDate),
        price: promotion?.price || 0,
        description: promotion?.description || '',
        limitedQuantity: promotion?.limitedQuantity || false,
        maximumQuantity: promotion?.maximumQuantity || 0,
      });
      // @ts-ignore
      modal.showModal();
    }
  }
  function validateDate(date: string, prefix: string): string {
    if (!date) {
      return `${prefix} is required`;
    }
    const d = Date.parse(date);
    if (isNaN(d)) {
      return `${prefix} is not a valid date`;
    }
    const now = Date.parse(new Date().toISOString().split('T')[0]); // just the date not the time
    if (d < now && !editing) {
      return `${prefix} is in the past`;
    }
    return '';
  }
  async function doSaveData(data: FormData) {
    if (data.price === 0 || !data.description) {
      setAlert('All fields marked with a red star are required', 'error', 5000);
      return;
    }
    let datemsg = validateDate(data.startDate, 'Start date');
    if (datemsg) {
      setAlert(datemsg, 'error', 5000);
      return;
    }
    datemsg = validateDate(data.stopDate, 'Stop date');
    if (datemsg) {
      setAlert(datemsg, 'error', 5000);
      return;
    }
    if (Date.parse(data.stopDate) < Date.parse(data.startDate)) {
      setAlert('Stop date is before start date', 'error', 5000);
      return;
    }
    const promo: IPromotion = {
      ...data,
      startDate: new Date(data.startDate),
      stopDate: new Date(data.stopDate),
      createdOn: new Date(),
      createdBy: user!.email,
      canceledOn: new Date('0001-01-01'),
      canceledBy: '',
      canDelete: true,
    };
    if (!editing) {
      promo.id = '';
      promo.productId = product!.id;
    }
    let result: HttpResponse<IPromotion | IApiResponse>;
    if (editing) {
      result = await updatePromotion(promo, token);
    } else {
      result = await createPromotion(promo, token);
    }
    if (result && result.ok) {
      setSelectedPromotion(null);
      // @ts-ignore
      modal.close();
      await doLoadPromotions();
      setAlert('Changes saved successfully', 'info');
      return;
    }
    if (result && !result.ok && result.body) {
      setAlert((result.body as IApiResponse)?.message, 'error', 5000);
      return;
    }
    setAlert(`Unexpected error occurred: (${result.code ?? 0})`, 'error', 5000);
  }
  async function doCancel(promotion: IPromotion) {
    if (promotion) {
      const result = await cancelPromotion(promotion.id, token);
      if (result.code === 0 || !result.message) {
        await doLoadPromotions();
        setAlert('Promotion canceled successfuly', 'info');
      } else {
        setAlert(
          result.message || `Error ${result.code} processing request`,
          'error',
          5000,
        );
      }
    }
  }
  async function doUnCancel(promotion: IPromotion) {
    if (promotion) {
      const result = await unCancelPromotion(promotion.id, token);
      if (result.code === 0 || !result.message) {
        await doLoadPromotions();
        setAlert('Promotion uncanceled succesfully', 'info');
      } else {
        setAlert(
          result.message || `Error ${result.code} processing request`,
          'error',
          5000,
        );
      }
    }
  }
  async function doDelete(promotion: IPromotion) {
    if (promotion) {
      const result = await deletePromotion(promotion.id, token);
      if (result.code === 0 && !result.message) {
        await doLoadPromotions();
        setAlert('Promotion deleted successfully', 'info');
      } else {
        setAlert(
          result.message || `Error ${result.code} processing request`,
          'error',
          5000,
        );
      }
    }
  }
  async function deleteAllExpired() {
    const result = await deleteAllExpiredPromotions(token);
    if (result.code === 0 && !result.message) {
      await doLoadPromotions();
      setAlert('All expired or canceled Promotions have been deleted', 'info');
    } else {
      setAlert(
        result.message || `Error ${result.code} processing request`,
        'error',
        5000,
      );
    }
  }
  async function deleteExpired() {
    const result = await deleteExpiredPromotions(product!.id, token);
    if (result.code === 0 && !result.message) {
      await doLoadPromotions();
      setAlert('Expired and Canceled promotions have been deleted', 'info');
      return;
    }
    setAlert(
      result.message || `Error ${result.code} processing request`,
      'error',
      5000,
    );
  }
  function isExpired(promotion: IPromotion): boolean {
    return new Date(promotion.stopDate) <= new Date();
  }
  function isCanceled(promotion: IPromotion): boolean {
    return (new Date(promotion.canceledOn)?.getFullYear() ?? 0) >= 2020;
  }
  return (
    <div className="container">
      <dialog className="modal promopage__modal" id="promopage__modal">
        <div className="promopage__pm__container">
          <form
            className="promopage__pm__form form-outline"
            onSubmit={handleSubmit(doSaveData)}
          >
            <div className="promopage__formheader">
              <div className="promopage__formheading">
                {editing && <span>Edit a Promotion</span>}
                {!editing && <span>Create a new Promotion</span>}
              </div>
            </div>
            <input type="hidden" {...register('id')} />
            <input type="hidden" {...register('productId')} />
            <div className="formitem">
              <label htmlFor="startDate" className="formlabel">
                Start&nbsp;Date<span className="redstar">*</span>
              </label>
              <input
                type="date"
                id="startDate"
                className="forminput"
                {...register('startDate')}
                placeholder="Start Date"
              />
              <label htmlFor="stopDate" className="formlabel">
                Stop&nbsp;Date<span className="redstar">*</span>
              </label>
              <input
                type="date"
                id="stopDate"
                className="forminput"
                {...register('stopDate')}
                placeholder="Stop Date"
              />
            </div>
            <div className="formitem">
              <label htmlFor="price" className="formlabel">
                Price<span className="redstar">*</span>
              </label>
              <input
                type="number"
                id="price"
                className="forminput"
                {...register('price')}
                min={0}
                step={0.01}
                placeholder="Price"
              />
            </div>
            <div className="formitem">
              <label htmlFor="description" className="formlabel">
                Description<span className="redstar">*</span>
              </label>
              <textarea
                id="description"
                className="forminput"
                {...register('description')}
                placeholder="Description"
              />
            </div>
            <div className="formitem">
              <label htmlFor="limitedQuantity" className="formlabel">
                Limited&nbsp;Quantity
              </label>
              <input
                type="checkbox"
                id="limitedQuantity"
                className="forminput"
                {...register('limitedQuantity')}
                onChange={toggleLimitedQuantity}
              />
            </div>
            <div className="formitem">
              <label htmlFor="maxQuantity" className="formlabel">
                Maximum&nbsp;Quantity
              </label>
              <input
                type="number"
                id="maxQuantity"
                className="forminput"
                {...register('maximumQuantity')}
                disabled={!watch('limitedQuantity')}
                placeholder="Maximum Quantity"
              />
            </div>
            <div className="buttoncontainer promopage__buttoncontainer">
              <button type="submit" className="primarybutton">
                <span>
                  <MdSave /> Save
                </span>
              </button>
              <button
                type="button"
                className="secondarybutton"
                onClick={doReset}
              >
                <span>
                  <MdRefresh /> Reset
                </span>
              </button>
              <button
                type="button"
                className="secondarybutton"
                onClick={doCloseModal}
              >
                <span>
                  <MdCancel /> Cancel
                </span>
              </button>
            </div>
          </form>
        </div>
      </dialog>
      <div className="header">
        <div className="heading">Manage Promotions</div>
        <button
          className="primarybutton headerbutton-left"
          type="button"
          onClick={() => navigate('/Home')}
        >
          <span>
            <MdHome /> Home
          </span>
        </button>
        <div className="buttoncontainer promopage__headerbuttons">
          <button
            className="secondarybutton promopage__deletebutton dangerbutton"
            type="button"
            onClick={deleteAllExpired}
            title="Delete ALL expired and cancelled promotions"
          >
            <span>
              <MdDelete /> Expired
            </span>
          </button>
          <button
            className="secondarybutton"
            type="button"
            onClick={() => navigate('/Products')}
          >
            <span>
              <MdCancel /> Cancel
            </span>
          </button>
        </div>
      </div>
      <div className="content">
        <div className="promopage__product">
          <div className="promopage__producttext">Product</div>
          {product && (
            <ProductSummaryWidget
              product={product}
              showBasePrice={true}
              style={{ cursor: 'default' }}
            />
          )}
          {!product && <div className="noitemsfound">Product Not Found</div>}
        </div>
        <div className="promopage__promotions">
          <div className="promopage__pc__header">
            <div className="promopage__pc__heading">Promotions</div>
            <button
              className="squarebutton promopage__pc__createbutton"
              type="button"
              onClick={doCreate}
              title="Create a promotion"
            >
              <span>
                <MdAdd />
              </span>
            </button>
            <button
              className="squarebutton promopage__pc__deletebutton dangerbutton"
              type="button"
              onClick={deleteExpired}
              title="Delete expired and canceled promotions for this product"
              disabled={
                !promotions ||
                promotions.length === 0 ||
                !promotions.some((x) => isExpired(x) || isCanceled(x))
              }
            >
              <span>
                <MdDelete />
              </span>
            </button>
          </div>
          {loading && (
            <div className="loading">
              <Spinner /> Loading...
            </div>
          )}
          {!loading && promotions && promotions.length === 0 && (
            <div className="promopage__noitemsfound">No Promotions Found</div>
          )}
          {!loading && promotions && promotions.length > 0 && (
            <div className="promopage__container">
              <div className="promopage__promotionlist">
                {promotions &&
                  promotions.map((x) => (
                    <MgrPromotionWidget
                      key={x.id}
                      promotion={x}
                      onEdit={doEdit}
                      onCancel={doCancel}
                      onUnCancel={doUnCancel}
                      onDelete={doDelete}
                    />
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
