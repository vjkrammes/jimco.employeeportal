type Props = {
  age: number;
  nonSpecific?: JSX.Element | string;
  noneRequired?: JSX.Element | string;
  prefix?: string;
};

export default function AgeBadge({
  age,
  nonSpecific,
  noneRequired,
  prefix,
}: Props) {
  const pfx = prefix || 'agebadge';
  function getIcon(age: number) {
    switch (age) {
      case 13:
        return '/images/13plus.svg';
      case 16:
        return '/images/16plus.svg';
      case 18:
        return '/images/18plus.svg';
      case 21:
        return '/images/21plus.svg';
      default:
        return '';
    }
  }
  const fn = getIcon(age);
  if (fn) {
    return (
      <div className={`${pfx}__icon`}>
        <img
          src={fn}
          alt={`Age ${age} or older required`}
          title={`${age}+ Required`}
        />
      </div>
    );
  } else if (age !== 0) {
    if (nonSpecific) {
      return <div className={`${pfx}__icon`}>{nonSpecific}</div>;
    } else {
      return <div className={`${pfx}__icon`}>{age}+</div>;
    }
  } else {
    if (noneRequired) {
      return <div className={`${pfx}__icon`}>{noneRequired}</div>;
    } else {
      return <div className={`${pfx}__icon`}>&nbsp;</div>;
    }
  }
}
