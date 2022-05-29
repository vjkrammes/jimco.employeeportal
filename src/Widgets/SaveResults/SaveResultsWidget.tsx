import { ISaveResult } from '../../Interfaces/ISaveResult';
import './SaveResultsWidget.css';

type Props = {
  results: ISaveResult[];
};

export default function SaveResultsWidget({ results }: Props) {
  function getIcon(success: boolean): string {
    return success ? '/images/checkmark-32.png' : '/images/clear-32.png';
  }
  function getTitle(success: boolean): string {
    return success
      ? 'Save completed successfully'
      : 'Save encountered an error';
  }
  return (
    <div className="srw__container">
      <div className="srw__item srw__headingitem">
        <div className="srw__left srw__heading">User</div>
        <div className="srw__middle srw__heading">
          <img src="/images/image-32.png" alt="" />
        </div>
        <div className="srw__right srw__heading">Error</div>
      </div>
      {results &&
        results.length > 0 &&
        results.map((x) => (
          <div className="srw__item" key={x.user}>
            <div className="srw__left">{x.user}</div>
            <div className="srw__middle">
              <img
                src={getIcon(x.success)}
                alt=""
                title={getTitle(x.success)}
              />
            </div>
            <div className="srw__right">
              {x.error ? x.error : <span>none</span>}
            </div>
          </div>
        ))}
      {!results ||
        (results.length === 0 && (
          <div className="srw__noresults">No Results Available</div>
        ))}
    </div>
  );
}
