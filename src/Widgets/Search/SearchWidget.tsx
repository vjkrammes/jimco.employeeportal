import { useEffect, useState, ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdClear, MdSearch } from 'react-icons/md';
import { ICategory } from '../../Interfaces/ICategory';
import { getCategories } from '../../Services/CategoryService';
import './SearchWidget.css';

export default function SearchWidget() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<ICategory[] | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<ICategory | null>(
    null,
  );
  const [searchText, setSearchText] = useState<string>('');
  useEffect(() => {
    async function loadCategories() {
      const result = await getCategories();
      if (result) {
        setCategories(result);
      } else {
        setCategories(null);
      }
    }
    loadCategories();
  }, []);
  function categoryChanged(e: ChangeEvent<HTMLSelectElement>) {
    if (e) {
      const category = categories?.find((x) => x.id === e.currentTarget.value);
      if (category) {
        setSelectedCategory(category);
      } else {
        setSelectedCategory(null);
      }
    } else {
      setSelectedCategory(null);
    }
  }
  function searchChanged(e: ChangeEvent<HTMLInputElement>) {
    if (e) {
      setSearchText(e.currentTarget.value);
    } else {
      setSearchText('');
    }
  }
  function searchClick() {
    if (searchText) {
      if (selectedCategory) {
        navigate(`/Search/${selectedCategory.id}/${searchText}`);
      } else {
        navigate(`/Search/${searchText}`);
      }
    }
  }
  function resetSearch() {
    setSearchText('');
    setSelectedCategory(null);
    const select: HTMLSelectElement = document.getElementById(
      'sw__select',
    ) as HTMLSelectElement;
    if (select) {
      select.value = '0';
    }
  }
  return (
    <div className="sw__container">
      <p className="sw__title">Search products by name or description</p>
      <select onChange={categoryChanged} id="sw__select">
        <option value={'0'} key={'0'}>
          All Categories
        </option>
        {categories?.map((x) => (
          <option value={x.id} key={x.id}>
            {x.name}
          </option>
        ))}
      </select>
      <input
        type="search"
        value={searchText}
        onChange={searchChanged}
        placeholder="Search..."
      />
      <div className="buttoncontainer">
        <button type="button" className="primarybutton" onClick={searchClick}>
          <span>
            <MdSearch /> Search
          </span>
        </button>
        <button type="button" className="secondarybutton" onClick={resetSearch}>
          <span>
            <MdClear /> Reset
          </span>
        </button>
      </div>
    </div>
  );
}
