import { IUserModel } from '../../Interfaces/IUserModel';
import UserRoleBadge from '../Badges/UserRoleBadge';
import './GroupUserWidget.css';

type Props = {
  user: IUserModel;
  showRoles: boolean;
  onClick: (user: IUserModel) => void;
  buttonTitle: string;
  buttonContent: JSX.Element | string;
  height?: string | undefined;
};

export default function GroupUserWidget({
  user,
  showRoles,
  onClick,
  buttonTitle,
  buttonContent,
  height,
}: Props) {
  return (
    <div
      className="guw__container"
      onClick={() => onClick(user)}
      style={height ? { height: height } : undefined}
    >
      {showRoles && (
        <div className="guw__badge">
          <UserRoleBadge user={user} />
        </div>
      )}
      <div className="guw__name">{user.displayName}</div>
      <div className="guw__button">
        <button type="button" className="squarebutton" title={buttonTitle}>
          <span>{buttonContent}</span>
        </button>
      </div>
    </div>
  );
}
