import { useNavigate } from 'react-router-dom';
import { MdHome } from 'react-icons/md';
import { TiInfoLarge } from 'react-icons/ti';
import './ArchitecturePage.css';

export default function ArchitecturePage() {
  const navigate = useNavigate();
  return (
    <div className="container">
      <div className="header">
        <div className="heading">JimCo Employee Portal Architecture</div>
        <button
          className="primarybutton headerbutton-left"
          type="button"
          onClick={() => navigate('/About')}
        >
          <span>
            <TiInfoLarge /> Back
          </span>
        </button>
        <button
          className="secondarybutton headerbutton-right"
          type="button"
          onClick={() => navigate('/')}
        >
          <span>
            <MdHome /> Home
          </span>
        </button>
      </div>
      <div className="content">
        <img
          src="/images/JimCoEPArchitecture.jpg"
          width={900}
          className="arch__centerimage"
          alt="Architecture Diagram"
        />
      </div>
    </div>
  );
}
