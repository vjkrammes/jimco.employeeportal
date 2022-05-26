type Props = {
  roles: string;
  className?: string;
};
export function RoleList({ roles, className }: Props) {
  if (!roles) {
    return <></>;
  }
  const rolelist: string[] = JSON.parse(roles);
  let sb: string[] = [];
  sb.push('(');
  for (let x = 0; x < rolelist.length; x++) {
    sb.push(rolelist[x] + 's');
    if (x < rolelist.length - 2) {
      sb.push(', ');
    }
    if (x === rolelist.length - 2) {
      sb.push(', and ');
    }
  }
  sb.push(')');
  return className ? (
    <div className={className}>{sb.join('')}</div>
  ) : (
    <div>{sb.join('')}</div>
  );
}
