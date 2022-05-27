import { getHex } from '../../Services/ColorService';
import './ColorBadge..css';

type Props = {
  colorName: string;
  showName: boolean;
  height?: number;
  width?: number;
};

export default function ColorBadge({
  colorName,
  showName,
  height,
  width,
}: Props) {
  return (
    <div className="cb__container" style={{ height: height, width: width }}>
      <div
        className="cb__swatch"
        style={{ backgroundColor: getHex(colorName.toLowerCase()) }}
      ></div>
      {showName && <div className="cb__name">{colorName}</div>}
      {!showName && <span>&nbsp;</span>}
    </div>
  );
}
