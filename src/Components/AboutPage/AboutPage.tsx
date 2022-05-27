import { Link, useNavigate } from 'react-router-dom';
import { MdHome } from 'react-icons/md';
import { BsDiagram3Fill } from 'react-icons/bs';
import './AboutPage.css';

export default function AboutPage() {
  const navigate = useNavigate();
  return (
    <div className="container">
      <div className="header">
        <div className="heading">About the JimCo Employee Portal</div>
        <button
          className="primarybutton headerbutton-left"
          type="button"
          onClick={() => navigate('/Home')}
        >
          <span>
            <MdHome /> Home
          </span>
        </button>
        <button
          className="secondarybutton headerbutton-right"
          type="button"
          onClick={() => navigate('/Architecture')}
        >
          <span>
            <BsDiagram3Fill /> Architecture
          </span>
        </button>
      </div>
      <div className="content ap__container">
        <p>
          The JimCo Employee Portal is a demonstration application that mimics
          an internal employee portal for a fictional retailer. It allows
          employees to perform searches for customers, and to check them out.
          Functions for managers and administrators include maintenance of
          products, categories, vendors, etc. Authentication is handled by{' '}
          <a href="https://auth0.com/" target="_blank" rel="noreferrer">
            Auth0
          </a>
          . Role-based authorization is handled with the internal database.
        </p>
        <p>
          The site is designed for a minimum screen resolution of 1024 x 768
          pixels (The IPad Mini) or for desktop computers.
        </p>
        <p>
          The site consists of a front-end web site and a back-end API. The API
          is written in{' '}
          <a
            href="https://en.wikipedia.org/wiki/C_Sharp_(programming_language)"
            target="_blank"
            rel="noreferrer"
          >
            C#
          </a>{' '}
          version 10 using{' '}
          <a
            href="https://en.wikipedia.org/wiki/.NET"
            target="_blank"
            rel="noreferrer"
          >
            .NET
          </a>{' '}
          6. The front end is written in{' '}
          <a
            href="https://www.typescriptlang.org/"
            target="_blank"
            rel="noreferrer"
          >
            TypeScript
          </a>{' '}
          +{' '}
          <a
            href="https://reactjs.org/docs/introducing-jsx.html"
            target="_blank"
            rel="noreferrer"
          >
            JSX
          </a>{' '}
          using React version 18 and React-router version 6.3. It is divided up
          into distinct layers (for an overall architecture diagram, click{' '}
          {<Link to="/Architecture">here</Link>}):
        </p>
        <ul className="ap__aboutlist">
          <li className="ap__aboutitem">
            The front end itself, written in TypeScript + JSX compiled to
            JavaScript and HTML and using React.
          </li>
          <li className="ap__aboutitem">
            The API, a .NET 6 Web API project written in C# version 10.
          </li>
          <li className="ap__aboutitem">
            The Data Services layer, a .NET 6 class library written in C#
            version 10. This layer is the interface between the API and the Data
            Access layers. It is responsible for translation between entity
            objects and{' '}
            <a
              href="https://en.wikipedia.org/wiki/Data_transfer_object"
              target="_blank"
              rel="noreferrer"
            >
              Data Transfer Objects
            </a>{' '}
            (DTOs) as well as for enforcing business logic.
          </li>
          <li className="ap__aboutitem">
            The Data Repository layer, a .NET 6 class library written in C#
            version 10. This layer is responsible for getting data into and out
            of the database. It uses Dapper as a minimal ORM.
          </li>
          <li className="ap__aboutitem">
            A{' '}
            <a
              href="https://www.microsoft.com/en-us/sql-server/sql-server-2019"
              target="_blank"
              rel="noreferrer"
            >
              Microsoft SQL
            </a>{' '}
            database to store the data.
          </li>
        </ul>
        <p>In addition, there are two other "layers":</p>
        <ul className="ap__aboutlist">
          <li className="ap__aboutitem">
            The Common library, a collection of items used throughout the back
            end. It is a .NET 6 class library written in C# version 10 and
            contains enumerations, attributes, extension methods, and common
            classes.
          </li>
          <li className="ap__aboutitem">
            The Model library which is where the DTO classes and other model
            classes are stored since they are shared by the Data Services and
            API layers. It is a .NET 6 class library written in C# version 10.
          </li>
        </ul>
        <p>
          The following external libraries are used in either the front end or
          back end:
        </p>
        <ul className="ap__aboutlist">
          <li className="ap__aboutitem">
            <a href="https://reactjs.org/" target="_blank" rel="noreferrer">
              React
            </a>
            , React-router, React-icons
          </li>
          <li className="ap__aboutitem">
            <a
              href="https://www.newtonsoft.com/json"
              target="_blank"
              rel="noreferrer"
            >
              Json.NET
            </a>{' '}
            a{' '}
            <a
              href="https://www.json.org/json-en.html"
              target="_blank"
              rel="noreferrer"
            >
              JSON
            </a>{' '}
            library.
          </li>
          <li className="ap__aboutitem">
            <a
              href="https://auth0.com/docs/libraries/auth0-single-page-app-sdk"
              target="_blank"
              rel="noreferrer"
            >
              {' '}
              auth0-spa-js
            </a>{' '}
            a JavaScript library used to interact with Auth0 for authentication.
          </li>
          <li className="ap__aboutitem">
            <a href="https://mui.com/" target="_blank" rel="noreferrer">
              mui
            </a>{' '}
            a JavaScript component library used primarily for pop-up alerts
          </li>
          <li className="ap__aboutitem">
            <a
              href="https://github.com/stefanprodan/AspNetCoreRateLimit"
              target="_blank"
              rel="noreferrer"
            >
              ASPNetCoreRateLimit
            </a>
            , a library used to limit the rate of incoming requests to the API
            to minimize denial-of-service attacks.
          </li>
          <li className="ap__aboutitem">
            <a href="https://hashids.org/net/" target="_blank" rel="noreferrer">
              Hashids.net
            </a>
            , a library used to obfuscate entity key values in the data transfer
            objects.
          </li>
          <li className="ap__aboutitem">
            <a
              href="https://github.com/DapperLib/Dapper"
              target="_blank"
              rel="noreferrer"
            >
              Dapper
            </a>
            , a minimal{' '}
            <a
              href="https://en.wikipedia.org/wiki/Object%E2%80%93relational_mapping"
              target="_blank"
              rel="noreferrer"
            >
              ORM
            </a>{' '}
            built over{' '}
            <a
              href="https://docs.microsoft.com/en-us/dotnet/framework/data/adonet/ado-net-overview"
              target="_blank"
              rel="noreferrer"
            >
              ADO.Net
            </a>
            , used to get entity objects into and out of the database.
          </li>
          <li className="ap__aboutitem">
            <a
              href="https://www.newtonsoft.com/json"
              target="_blank"
              rel="noreferrer"
            >
              Json.NET
            </a>
            , a{' '}
            <a
              href="https://www.json.org/json-en.html"
              target="_blank"
              rel="noreferrer"
            >
              JSON
            </a>{' '}
            library.
          </li>
        </ul>
      </div>
    </div>
  );
}
