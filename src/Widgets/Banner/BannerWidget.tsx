import { useState, useEffect, ChangeEvent } from 'react';
import { MdSave, MdDelete, MdClear } from 'react-icons/md';
import './BannerWidget.css';

type Props = {
  banner: string;
  onSet: (text: string) => void;
  onRemove: () => void;
};

export default function BannerWidget({ banner, onSet, onRemove }: Props) {
  const [text, setText] = useState<string>('');
  useEffect(() => {
    setText(banner);
  }, [banner]);
  function textChanged(e: ChangeEvent<HTMLTextAreaElement>) {
    setText(e.target.value);
  }
  return (
    <div className="bw__container">
      <div className="buttoncontainer bw__buttons">
        <button
          type="button"
          className="squarebutton"
          title="Save"
          disabled={!text || text === banner}
          onClick={() => onSet(text)}
        >
          <MdSave />
        </button>
        <button
          type="button"
          className="squarebutton"
          title="Reset"
          disabled={text === banner}
          onClick={() => setText(banner)}
        >
          <MdClear />
        </button>
        <button
          type="button"
          className="squarebutton"
          title="Delete"
          disabled={!banner}
          onClick={onRemove}
        >
          <MdDelete />
        </button>
      </div>
      <div className="bw__text">
        <textarea
          value={text}
          onChange={textChanged}
          className="bw__textarea"
        />
      </div>
    </div>
  );
}
