import { Alert, AlertColor } from '@mui/material';
import { useAlert } from '../../Contexts/AlertContext';

function getSeverity(sev: string): AlertColor {
  switch (sev.toLowerCase()) {
    case 'success':
      return 'success';
    case 'info':
      return 'info';
    case 'warning':
      return 'warning';
    case 'error':
      return 'error';
    default:
      throw new Error(`${sev} is not a valid alert color`);
  }
}

export default function AlertPopup() {
  const { text, type } = useAlert();
  if (text && type) {
    return (
      <Alert
        severity={getSeverity(type)}
        sx={{
          position: 'absolute',
          alignItems: 'center',
          right: '10px',
          top: '10px',
          backgroundColor: 'rgb(0, 75, 141)',
          color: 'rgb(238, 248, 255)',
          fontSize: '1.25rem',
          lineHeight: '2rem',
          boxShadow: '3px 5px 5px rgb(0, 48, 90)',
        }}
      >
        {text}
      </Alert>
    );
  } else {
    return <></>;
  }
}
