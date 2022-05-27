import './ImageBadge.css';

type Props = {
  image: string;
  height?: number;
  width?: number;
};

function displayImage(image: string): string {
  return image.replace('-32.png', '').replace('-', ' ');
}

export default function ImageBadge({ image, height, width }: Props) {
  return (
    <div className="ib__container" style={{ width: width, height: height }}>
      <div className="ib__icon">
        <img src={`/images/${image}`} alt="" />
      </div>
      <div className="ib__name">{displayImage(image)}</div>
    </div>
  );
}
