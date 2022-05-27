import { ReactNode } from 'react';
import './MenuWidget.css';

type Props = {
  heading: string;
  children?: ReactNode;
};

export default function MenuWidget({ heading, children }: Props) {
  return (
    <div className="mw__container">
      <div className="mw__heading">{heading}</div>
      <div className="mw__content">{children}</div>
    </div>
  );
}
