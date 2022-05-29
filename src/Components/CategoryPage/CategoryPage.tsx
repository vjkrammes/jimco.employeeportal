import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdSave, MdAdd, MdCancel, MdHome } from 'react-icons/md';
import { useAuth0 } from '@auth0/auth0-react';
import { useForm } from 'react-hook-form';
import { useUser } from '../../Contexts/UserContext';
import { useAlert } from '../../Contexts/AlertContext';
import { createCategory, getCategories } from '../../Services/CategoryService';
import { ICategory } from '../../Interfaces/ICategory';
import { IApiResponse } from '../../Interfaces/IApiResponse';
import { MenuItem, Select } from '@mui/material';
import { getIconFileNames } from '../../Services/IconService';
import { colors } from '../../Services/ColorService';
import Spinner from '../../Widgets/Spinner/Spinner';
import CategoryWidget from '../../Widgets/Category/CategoryWidget';
import ImageBadge from '../../Widgets/Badges/ImageBadge';
import ColorBadge from '../../Widgets/Badges/ColorBadge';
import './CategoryPage.css';

type FormData = {
  name: string;
  background: string;
  isAgeRestricted: boolean;
  ageRequired: number;
  image: string;
};

async function loadCategories(): Promise<ICategory[]> {
  const result = await getCategories();
  return result;
}

export default function CategoryPage() {
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedCategory, setSelectedCategory] = useState<ICategory | null>(
    null,
  );
  const [adding, setAdding] = useState<boolean>(false);
  const { isAuthenticated, getAccessTokenSilently } = useAuth0();
  const { isManagerPlus } = useUser();
  const { setAlert } = useAlert();
  const navigate = useNavigate();
  const { register, handleSubmit, reset, watch } = useForm<FormData>({
    mode: 'onBlur',
    defaultValues: {
      name: '',
      background: '',
      isAgeRestricted: false,
      ageRequired: 0,
      image: '',
    },
  });
  async function refreshCategories() {
    setCategories(await loadCategories());
  }
  useEffect(() => {
    reset({
      name: '',
      background: '',
      isAgeRestricted: false,
      ageRequired: 0,
      image: '',
    });
    if (adding) {
      document.getElementById('name')?.focus();
    }
  }, [reset, adding]);
  useEffect(() => {
    async function doLoadCategories() {
      const results = await loadCategories();
      if (results) {
        setCategories(results);
        setLoading(false);
      } else {
        const empty: ICategory[] = [];
        setCategories(empty);
        setLoading(false);
      }
    }
    if (!isAuthenticated || !isManagerPlus) {
      navigate('/Home');
    }
    doLoadCategories();
  }, [isAuthenticated, isManagerPlus, navigate]);
  async function newCategory(data: FormData) {
    const category: ICategory = {
      ...data,
      id: '',
      canDelete: true,
    };
    const result = await createCategory(
      category,
      await getAccessTokenSilently(),
    );
    if (result && result.ok) {
      setAdding(false);
      setSelectedCategory(null);
      refreshCategories();
    } else {
      setAlert((result.body as IApiResponse).message, 'error', 5000);
    }
  }
  function beginAdd() {
    setSelectedCategory(null);
    setAdding(true);
  }
  function cancelAdd() {
    setSelectedCategory(null);
    setAdding(false);
  }
  return (
    <div className="container">
      <div className="header">
        <div className="heading">Manage Categories</div>
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
          onClick={beginAdd}
        >
          <span>
            <MdAdd /> New
          </span>
        </button>
      </div>
      <div className="content">
        {adding && (
          <div className="cp__addcontainer">
            <div className="cp__addform">
              <form onSubmit={handleSubmit(newCategory)}>
                <div className="cp__formbody">
                  <label htmlFor="name" className="cp__label cp__namelabel">
                    Name<span className="redstar">*</span>
                  </label>
                  <input
                    {...register('name')}
                    type="text"
                    className="cp__input cp__nameinput"
                    id="name"
                  />
                  <label htmlFor="image" className="cp__label cp__imagelabel">
                    Icon<span className="redstar">*</span>
                  </label>
                  <Select
                    {...register('image')}
                    defaultValue="0"
                    className="cp__select cp__iconselect"
                    style={{ height: '30px' }}
                  >
                    <MenuItem key={'0'} value={'0'}>
                      Please Select an Icon
                    </MenuItem>
                    {getIconFileNames().map((x) => (
                      <MenuItem key={x} value={x}>
                        <ImageBadge image={x} height={20} />
                      </MenuItem>
                    ))}
                  </Select>
                  <label
                    htmlFor="background"
                    className="cp__label cp__backlabel"
                  >
                    Background
                  </label>
                  <Select
                    {...register('background')}
                    defaultValue={'0'}
                    className="cp__select cp__backselect"
                    style={{ height: '30px' }}
                  >
                    <MenuItem key={'0'} value={'0'}>
                      Please select a background
                    </MenuItem>
                    {colors().map((x) => (
                      <MenuItem key={x} value={x}>
                        <ColorBadge colorName={x} showName={true} height={20} />
                      </MenuItem>
                    ))}
                  </Select>
                  <label
                    htmlFor="isAgeRestricted"
                    className="cp__label cp__iarlabel"
                  >
                    Age Restricted
                  </label>
                  <input
                    {...register('isAgeRestricted')}
                    type="checkbox"
                    className="cp__checkbox cp__iarcheckbox"
                  />
                  <label
                    htmlFor="ageRequired"
                    className="cp__label cp__arlabel"
                  >
                    Age Required
                  </label>
                  <input
                    {...register('ageRequired')}
                    type="number"
                    className="cp__inpuit cp__arinput"
                    disabled={!watch('isAgeRestricted')}
                  />
                  <div className="cp__formbuttoncontainer">
                    <button className="primarybutton" type="submit">
                      <span>
                        <MdSave /> Save
                      </span>
                    </button>
                    <button
                      className="secondarybutton"
                      type="button"
                      onClick={cancelAdd}
                    >
                      <span>
                        <MdCancel /> Cancel
                      </span>
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}
        <div className="cp__body">
          {loading && (
            <span>
              <Spinner /> Loading...
            </span>
          )}
          {!loading && (!categories || categories.length === 0) && (
            <div className="noitemsfound">No Categories were Found</div>
          )}
          {!loading && categories && categories.length !== 0 && (
            <div className="cp__categorylist">
              {categories.map((x) => (
                <div key={x.id}>
                  <CategoryWidget
                    category={x}
                    selectedCategory={selectedCategory}
                    setSelectedCategory={setSelectedCategory}
                    updateCategories={refreshCategories}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
