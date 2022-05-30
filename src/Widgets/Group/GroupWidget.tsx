import { ICompleteGroup } from '../../Interfaces/ICompleteGroup';
import './GroupWidget.css';

type Props = {
  group: ICompleteGroup;
  onClick: (group: ICompleteGroup) => void;
  height?: string | undefined;
};

export default function GroupWidget({ group, onClick, height }: Props) {
  return (
    <div
      className="grpw__container"
      onClick={() => onClick(group)}
      style={height ? { height: height } : undefined}
    >
      <div className="grpw__name">{group.name}</div>
      <div className="grpw__members">{group.users.length}</div>
    </div>
  );
}
