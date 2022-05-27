import { useNavigate } from 'react-router-dom';
import { TiWarning, TiInfoLarge } from 'react-icons/ti';
import './Footer.css';

export default function Footer() {
  const navigate = useNavigate();
  return (
    <div className="f__container">
      <button
        className="headerfooterbutton"
        type="button"
        onClick={() => navigate('/Disclaimer')}
      >
        <span>
          <TiWarning /> Disclaimer
        </span>
      </button>
      <div className="f__copyright">
        <div>
          ©&nbsp;Copyright 2019-2022 VJK Solutions, LLC. All Rights Reserved.
        </div>
        <div className="f__warning">
          Access limited to JimCo Employees only.
        </div>
      </div>
      <button
        className="headerfooterbutton"
        type="button"
        onClick={() => navigate('/About')}
      >
        <span>
          <TiInfoLarge /> About
        </span>
      </button>
    </div>
  );
}
