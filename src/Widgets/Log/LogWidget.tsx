import { useState, useEffect } from 'react';
import { MdList } from 'react-icons/md';
import { ILogModel } from '../../Interfaces/ILogModel';
import { toLevel } from '../../Services/tools';
import './LogWidget.css';

type Props = {
  log: ILogModel;
  onDetails: (log: ILogModel) => void;
};

export default function LogWidget({ log, onDetails }: Props) {
  const [date, setDate] = useState<string>('');
  const [level, setLevel] = useState<string>('');
  useEffect(() => {
    if (log && log.timestamp) {
      const part1 = new Date(log.timestamp).toISOString().split('T')[0];
      const part2 = new Date(log.timestamp)
        .toISOString()
        .split('T')[1]
        .split('.')[0];
      setDate(`${part1} ${part2}`);
    }
  }, [log, log.timestamp]);
  useEffect(() => {
    if (log) {
      setLevel(toLevel(log.level));
    }
  }, [log, log.level]);
  return (
    <div className="lw__container">
      <div className="lw__timestamp">{date}</div>
      <div className="lw__level">{level}</div>
      <div className="lw__description" title="Description">
        {log.description}
      </div>
      <div className="buttoncontainer lw__buttoncontainer">
        <button
          className="squarebutton lw__detailsbutton"
          type="button"
          onClick={() => onDetails(log)}
          title="View Details"
        >
          <span>
            <MdList />
          </span>
        </button>
      </div>
      <div className="lw__ip">{log.ip}</div>
      <div className="lw__source" title="Source">
        {log.source}
      </div>
      <div className="lw__identifier" title="Identifier">
        {log.identifier}
      </div>
    </div>
  );
}
