import { useNavigate } from 'react-router-dom';
import { MdHome } from 'react-icons/md';
import './DisclaimerPage.css';

export default function DisclaimerPage() {
  const navigate = useNavigate();
  return (
    <div className="container">
      <div className="header">
        <div className="heading">Disclaimer</div>
        <button
          className="primarybutton headerbutton-left"
          onClick={() => navigate('/Home')}
        >
          <span>
            <MdHome /> Home
          </span>
        </button>
      </div>
      <div className="content">
        <h4 className="title">
          The entire JimCo Retailers collection of web sites is a demonstration
          application.
        </h4>
        <ol>
          <li>There is no retail company named JimCo (that I am aware of)</li>
          <li>
            While the <span className="fixedfont">jimco.online</span> domain is
            real, it has no content.
          </li>
          <li>None of the products listed exist.</li>
          <li>None of the vendors described exist.</li>
        </ol>
        <p>Just in case there was any doubt or confusion.</p>
        <p>Thank you.</p>
      </div>
    </div>
  );
}
