import { MdClear } from 'react-icons/md';
import { IUserModel } from '../../Interfaces/IUserModel';
import './PinnedEmployeeWidget.css';

type Props = {
  user: IUserModel;
  onRemove: (user: IUserModel) => void;
};

export default function PinnedEmployeeWidget({ user, onRemove }: Props) {
  if (!user) {
    return <div className="pew__noemployee">No Employee Selected</div>;
  }
  return (
    <div className="pew__container">
      <div className="pew__name">{user.displayName}</div>
      <div className="pew__buttoncontainer">
        <button
          className="pew__button pew__removebutton"
          onClick={() => onRemove(user)}
          title="remove"
        >
          <span>
            <MdClear />
          </span>
        </button>
      </div>
    </div>
  );
}
