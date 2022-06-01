import { createRoot } from 'react-dom/client';
import history from './utilities/history';
import { authSettings } from './AppSettings';
import App from './Components/App';
import { Auth0Provider } from '@auth0/auth0-react';

const onRedirectCallback = (appState) => {
  history.push(
    appState && appState.returnTo
      ? appState.returnTo
      : window.location.pathname,
  );
};

const providerConfig = {
  domain: authSettings.domain || process.env.REACT_APP_AUTH0_DOMAIN,
  clientId: authSettings.client_id || process.env.REACT_APP_AUTH0_CLIENT_ID,
  audience: authSettings.audience,
  redirectUri: authSettings.redirect_uri,
  onRedirectCallback,
};
console.log(providerConfig.domain);
console.log(providerConfig.clientId);

const container = document.getElementById('root');
const root = createRoot(container);
root.render(
  <Auth0Provider {...providerConfig}>
    <App />
  </Auth0Provider>,
);
