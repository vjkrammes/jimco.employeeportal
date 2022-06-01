// export const server = 'https://localhost:5011';
export const server = 'https://jimcoapi.azurewebsites.net';

export const apiBase = `${server}/api/v1`;

export const authSettings = {
  domain: '',
  client_id: '',
  redirect_uri: window.location.origin,
  scope: 'openid profile JimCoAPI email',
  audience: 'https://jimcoapi',
};
