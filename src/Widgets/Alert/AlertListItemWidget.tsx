import { MouseEventHandler, useEffect, useState } from 'react';
import { IAlert } from '../../Interfaces/IAlert';
import { alertIcon, alertLevel } from '../../Services/tools';
import { getNameFromEmail } from '../../Services/UserService';
import { useAuth0 } from '@auth0/auth0-react';

type Props = {
  alert: IAlert;
  handler: MouseEventHandler<HTMLDivElement>;
};

export default function AlertListItemWidget({ alert, handler }: Props) {
  const [name, setName] = useState<string>('');
  const { isLoading, getAccessTokenSilently } = useAuth0();
  useEffect(() => {
    async function getName() {
      if (!isLoading && alert) {
        const n = await getNameFromEmail(
          alert.creator,
          await getAccessTokenSilently(),
        );
        setName(n);
      }
    }
    getName();
  }, [alert, isLoading, getAccessTokenSilently]);
  return (
    <div className="aliw__container" onClick={handler}>
      <div className="aliw__icon">
        <img src={alertIcon(alert)} alt="" title={alertLevel(alert)} />
      </div>
      <div className="aliw__date">
        {new Date(alert.createDate).toLocaleDateString()}
      </div>
      <div className="aliw__creator">{name}</div>
      <div className="aliw__title">{alert.title}</div>
    </div>
  );
}
