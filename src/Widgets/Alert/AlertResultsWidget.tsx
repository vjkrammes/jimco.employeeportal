import { ReactNode } from 'react';
import { IAlertResult } from '../../Interfaces/IAlertResult';
import { v4 as uuidv4 } from 'uuid';
import './AlertResultsWidget.css';

type Props = {
  results: IAlertResult[];
  children: ReactNode;
};

export default function AlertResultsWidget({ results, children }: Props) {
  return (
    <div className="arw__container">
      <div className="arw__item arw__headingitem">
        <div className="arw__left arw__heading">User</div>
        <div className="arw__right arw__heading">Message</div>
      </div>
      {results &&
        results.length > 0 &&
        results.map((x) => (
          <div className="arw__item" key={uuidv4()}>
            <div className="arw__left">{x.name}</div>
            <div className="arw__right">{x.message}</div>
          </div>
        ))}
      {(!results || results.length === 0) && (
        <div className="arw__noresults">{children}</div>
      )}
    </div>
  );
}
