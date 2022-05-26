export const server = 'https://localhost:5011';
// export const server = 'https://jimcoapi.azurewebsites.net';

export const apiBase = `${server}/api/v1`;

export const authSettings = {
  domain: 'dev-x2udcgrv.us.auth0.com',
  client_id: '5gjFWrHYjk4y63bXuwYucRSrp7yeEvB7',
  redirect_uri: window.location.origin, // + '/signin-callback',
  scope: 'openid profile JimCoAPI email',
  audience: 'https://jimcoapi',
};
