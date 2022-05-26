export const NO_STATE = 'noerror';
export const ERROR_STATE = 'error';
export const SUCCESS_STATE = 'success';

export type IErrorState =
  | typeof NO_STATE
  | typeof ERROR_STATE
  | typeof SUCCESS_STATE;
