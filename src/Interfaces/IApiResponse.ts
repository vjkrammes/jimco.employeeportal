export interface IApiResponse {
  code: number;
  message: string;
  messages: string[];
}

export const SUCCESS: IApiResponse = {
  code: 0,
  message: '',
  messages: [],
};
