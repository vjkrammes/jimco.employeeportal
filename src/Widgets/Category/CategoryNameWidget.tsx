import { ICategory } from '../../Interfaces/ICategory';
import { getHex } from '../../Services/ColorService';
import './CategoryNameWidget.css';

type Props = {
  category: ICategory;
  showAge?: boolean;
  colorBackground?: boolean;
};

export default function CategoryNameWidget({
  category,
  showAge,
  colorBackground,
}: Props) {
  return (
    <div
      className="cnw__container"
      style={
        colorBackground ? { backgroundColor: getHex(category.background) } : {}
      }
    >
      <div className="cnw__icon">
        <img className="cnw__image" src={`/images/${category.image}`} alt="" />
      </div>
      <div className="cnw__name">{category.name}</div>
      {showAge && (
        <div className="cnw__age">
          {category.ageRequired > 0 ? (
            category.ageRequired
          ) : (
            <span>&nbsp;</span>
          )}
        </div>
      )}
    </div>
  );
}
