import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth0 } from '@auth0/auth0-react';
import { MdSave, MdCancel, MdDelete } from 'react-icons/md';
import { Select, MenuItem } from '@mui/material';
import { useAlert } from '../../Contexts/AlertContext';
import { getHex } from '../../Services/ColorService';
import { getIconFileNames } from '../../Services/IconService';
import { colors } from '../../Services/ColorService';
import { ICategory } from '../../Interfaces/ICategory';
import { IApiResponse } from '../../Interfaces/IApiResponse';
import { deleteCategory, updateCategory } from '../../Services/CategoryService';
import ColorBadge from '../Badges/ColorBadge';
import ImageBadge from '../Badges/ImageBadge';
import './CategoryWidget.css';

type Props = {
  category: ICategory;
  selectedCategory: ICategory | null;
  setSelectedCategory: Dispatch<SetStateAction<ICategory | null>>;
  updateCategories: () => null;
};

type FormData = {
  id: string;
  name: string;
  background: string;
  isAgeRestricted: boolean;
  ageRequired: number;
  image: string;
  canDelete: boolean;
};

function displayAge(age: number): JSX.Element {
  if (age > 0) {
    return <span>{age} </span>;
  }
  return <span>&nbsp;</span>;
}

export default function CategoryWidget({
  category,
  selectedCategory,
  setSelectedCategory,
  updateCategories,
}: Props) {
  const [editing, setEditing] = useState<boolean>(false);
  const { setAlert } = useAlert();
  const modal = document.getElementById(`cw__modal${category.id}`);
  const { getAccessTokenSilently } = useAuth0();
  const { register, handleSubmit, reset, watch } = useForm<FormData>({
    mode: 'onBlur',
    defaultValues: {
      id: category?.id,
      name: category?.name,
      background: category?.background,
      isAgeRestricted: category?.isAgeRestricted,
      ageRequired: category?.ageRequired,
      image: category?.image,
      canDelete: category?.canDelete,
    },
  });
  useEffect(() => {
    reset({
      id: category?.id,
      name: category?.name,
      background: category?.background,
      isAgeRestricted: category?.isAgeRestricted,
      ageRequired: category?.ageRequired,
      image: category?.image,
      canDelete: category?.canDelete,
    });
  }, [reset, category]);
  useEffect(() => {
    if (category) {
      setEditing(category.id === selectedCategory?.id);
    } else {
      setEditing(false);
    }
  }, [category, selectedCategory]);
  function cancelEdit() {
    setSelectedCategory(null);
    setEditing(false);
  }
  async function submitForm(data: FormData) {
    const model: ICategory = {
      ...data,
    };
    if (!model.isAgeRestricted) {
      model.ageRequired = 0;
    }
    if (model.isAgeRestricted && model.ageRequired <= 0) {
      setAlert('Age is required when restricted', 'error', 5000);
      return;
    }
    const result = await updateCategory(model, await getAccessTokenSilently());
    if (result.ok) {
      setSelectedCategory(null);
      setEditing(false);
      updateCategories();
      category = result.body as ICategory;
    } else {
      setAlert(
        'Update failed: ' + (result.body as IApiResponse).message,
        'error',
        5000,
      );
    }
  }
  function cancelDelete() {
    // @ts-ignore
    modal.close();
    setSelectedCategory(null);
    setEditing(false);
  }
  async function doDelete() {
    const result = await deleteCategory(
      category,
      await getAccessTokenSilently(),
    );
    if (result.ok) {
      setSelectedCategory(null);
      setEditing(false);
      updateCategories();
      setAlert('Category Deleted', 'info');
      return;
    }
    setAlert(
      'delete failed: ' + (result.body as IApiResponse).message,
      'error',
      5000,
    );
    // @ts-ignore
    modal.close();
  }
  async function removeCategory() {
    if (!category.canDelete) {
      setAlert('That category cannot be deleted', 'error', 5000);
      return;
    }
    // @ts-ignore
    modal.showModal();
  }
  function widgetClick() {
    if (editing) {
      setSelectedCategory(null);
      setEditing(false);
    } else {
      setSelectedCategory(category);
      setEditing(true);
    }
  }
  return (
    <div className="cw__container">
      <dialog className="modal" id={`cw__modal${category.id}`}>
        <div className="cw__modalcontent">
          <div className="cw__modaltitle">
            <span>{`Delete Category ${category.name}?`}</span>
          </div>
          <div className="cw__modalbody">
            <div className="cw__modalicon">
              <img src="/images/question-512.png" alt="Question" />
            </div>
            <div className="cw__modalmessage">
              <p>
                Do you want to delete the selected category? This action cannot
                be undone!
              </p>
            </div>
          </div>
          <div className="buttoncontainer">
            <button className="primarybutton" onClick={cancelDelete}>
              <span>
                <MdCancel /> Cancel
              </span>
            </button>
            <button className="secondarybutton dangerbutton" onClick={doDelete}>
              <span>
                <MdDelete /> Yes
              </span>
            </button>
          </div>
        </div>
      </dialog>
      <div
        className="cw__categorycontainer"
        onClick={() => widgetClick()}
        style={{ backgroundColor: getHex(category.background) }}
      >
        <div className="cw__icon">
          <img src={`/images/${category.image}`} alt="" />
        </div>
        <div className="cw__name">{category.name}</div>
        <div className="cw__agerequired">
          {displayAge(category.ageRequired)}
        </div>
      </div>
      {editing && (
        <div className="cw__editcontainer">
          <div className="cw__editform">
            <form onSubmit={handleSubmit(submitForm)}>
              <div className="cw__formbody">
                <label htmlFor="name" className="cw__label cw__namelabel">
                  Name
                </label>
                <input
                  {...register('name')}
                  type="text"
                  id="name"
                  className="cw__input cw__nameinput"
                />
                <label htmlFor="image" className="cw__label cw__imagelabel">
                  Icon
                </label>
                <Select
                  {...register('image')}
                  defaultValue={category.image}
                  className="cw__select cw__iconselect"
                  style={{ height: '30px' }}
                >
                  {getIconFileNames().map((x) => (
                    <MenuItem key={x} value={x}>
                      <ImageBadge image={x} height={20} />
                    </MenuItem>
                  ))}
                </Select>
                <label htmlFor="background" className="cw__label cw__backlabel">
                  Background
                </label>
                <Select
                  {...register('background')}
                  defaultValue={category.background}
                  className="cw__select cw__backselect"
                  style={{ height: '30px' }}
                >
                  {colors().map((x) => (
                    <MenuItem key={x} value={x}>
                      <ColorBadge colorName={x} showName={true} height={20} />
                    </MenuItem>
                  ))}
                </Select>
                <label
                  htmlFor="isAgeRestricted"
                  className="cw__label cw__iarlabel"
                >
                  Age Restricted
                </label>
                <input
                  {...register('isAgeRestricted')}
                  type="checkbox"
                  className="cw__checkbox cw__iarcheckbox"
                />
                <label htmlFor="ageRequired" className="cw__label cw__arlabel">
                  Age Required
                </label>
                <input
                  {...register('ageRequired')}
                  type="number"
                  className="cw__input cw__arinput"
                  disabled={!watch('isAgeRestricted')}
                />
                <div className="buttoncontainer cw__buttoncontainer">
                  <button className="primarybutton" type="submit">
                    <span>
                      <MdSave /> Save
                    </span>
                  </button>
                  <button
                    className="secondarybutton"
                    type="button"
                    onClick={cancelEdit}
                  >
                    <span>
                      <MdCancel /> Cancel
                    </span>
                  </button>
                  <button
                    className="secondarybutton dangerbutton"
                    onClick={removeCategory}
                    disabled={!category.canDelete}
                    type="button"
                  >
                    <span>
                      <MdDelete /> Delete
                    </span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
