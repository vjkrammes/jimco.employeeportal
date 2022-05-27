import { IAlert } from '../Interfaces/IAlert';
import { IApiResponse } from '../Interfaces/IApiResponse';
import {
  FaUserCog,
  FaUserClock,
  FaUserSecret,
  FaStoreAlt,
} from 'react-icons/fa';
import { IUserModel } from '../Interfaces/IUserModel';

export function prettify(json: string, indent: number = 2): string {
  if (json) {
    const obj = JSON.parse(json);
    return JSON.stringify(obj, undefined, indent);
  }
  return '';
}

export function capitalize(value: string): string {
  if (!value || value.length === 0) {
    return value;
  }
  return value[0].toUpperCase() + value.slice(1, value.length);
}

export function toCurrency(value: number): string {
  return '$' + value.toFixed(2).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
}

export function randomFromInterval(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

const digits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
export function generateSku(length: number): string {
  let builder: string[] = [];
  for (let i = 0; i < length; i++) {
    let ix = 0;
    if (i === 0) {
      ix = randomFromInterval(1, 9);
    } else {
      ix = randomFromInterval(0, 9);
    }
    builder.push(digits[ix]);
  }
  return builder.join('');
}

const loremIpsumSource =
  'lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua ut enim ad minim veniam quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat duisaute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur excepteur sintoccaecat cupidatat non proident sunt in culpa qui officia deserunt mollit anim id est laborum';

export function generateLoremIpsum(
  minWords: number,
  maxWords: number,
  minSentences: number,
  maxSentences: number,
  paragraphs: number,
) {
  const words = [...new Set(loremIpsumSource.split(' '))];
  if (minWords > maxWords) {
    [minWords, maxWords] = [maxWords, minWords];
  }
  if (minSentences > maxSentences) {
    [minSentences, maxSentences] = [maxSentences, minSentences];
  }
  const numSentences =
    minSentences === maxSentences
      ? minSentences
      : randomFromInterval(minSentences, maxSentences);
  const builder = [];
  for (let p = 0; p < paragraphs; p++) {
    for (let s = 0; s < numSentences; s++) {
      const numWords =
        minWords === maxWords
          ? minWords
          : randomFromInterval(minWords, maxWords);
      for (let w = 0; w < numWords; w++) {
        let word = words[Math.floor(Math.random() * words.length)];
        if (w === 0) {
          word = word.charAt(0).toUpperCase() + word.slice(1);
        }
        builder.push(word);
        if (w !== numWords - 1) {
          builder.push(' ');
        }
      }
      builder.push('. ');
    }
    builder.push('\n');
  }
  return builder.join('');
}

export const Status = {
  PENDING: 1,
  OPEN: 2,
  CANCELED_CUSTOMER: 3,
  CANCELED_STORE: 4,
  INPROGRESS: 5,
  SHIPPED: 6,
  BACKORDERED: 7,
  OUTOFSTOCK: 8,
};

Object.freeze(Status);

export const Level = {
  NOLEVEL: 0,
  DEBUG: 1,
  INFORMATION: 2,
  WARNING: 3,
  ERROR: 4,
  CRITICAL: 5,
  FATAL: 6,
};

Object.freeze(Level);

export function toLevel(level: number): string {
  switch (level) {
    case Level.NOLEVEL:
      return 'None';
    case Level.DEBUG:
      return 'Debug';
    case Level.INFORMATION:
      return 'Info';
    case Level.WARNING:
      return 'Warn';
    case Level.ERROR:
      return 'Error';
    case Level.CRITICAL:
      return 'Crit';
    case Level.FATAL:
      return 'Fatal';
    default:
      return '';
  }
}

export function statusDescription(
  status: number,
  capitalize: boolean = true,
): string {
  switch (status) {
    case Status.PENDING:
      return capitalize ? 'Pending' : 'pending';
    case Status.OPEN:
      return capitalize ? 'Open' : 'open';
    case Status.CANCELED_CUSTOMER:
      return capitalize ? 'Canceled by customer' : 'canceled by customer';
    case Status.CANCELED_STORE:
      return capitalize ? 'Canceled by store' : 'canceled by store';
    case Status.INPROGRESS:
      return capitalize ? 'In progress' : 'in progress';
    case Status.SHIPPED:
      return capitalize ? 'Shipped' : 'shipped';
    case Status.BACKORDERED:
      return capitalize ? 'Back ordered' : 'back ordered';
    case Status.OUTOFSTOCK:
      return capitalize ? 'Out of stock' : 'out of stock';
    default:
      return capitalize ? 'Unknown' : 'unknown';
  }
}

export function statuses(): Map<string, string> {
  const ret = new Map<string, string>();
  for (let i = 1; i <= 8; i++) {
    ret.set(i.toString(), statusDescription(i, true));
  }
  return ret;
}

export function isSuccessResult(response: IApiResponse): boolean {
  return (
    response.code === 0 &&
    response.message === '' &&
    (!response.messages || response.messages.length === 0)
  );
}

export function alertLevelFromValue(level: number): string {
  switch (level) {
    case 0:
      return 'Information';
    case 1:
      return 'Notice';
    case 2:
      return 'Critical';
    default:
      return 'Unknown';
  }
}

export function alertLevel(alert: IAlert): string {
  return alertLevelFromValue(alert.level);
}

export function alertIconFromValue(level: number): string {
  switch (level) {
    case 0:
      return '/images/info-32.png';
    case 1:
      return '/images/warning-32.png';
    case 2:
      return '/images/warning-red-32.png';
    default:
      return '';
  }
}

export function alertIcon(alert: IAlert): string {
  return alertIconFromValue(alert.level);
}

export function getAudience(
  v: boolean,
  e: boolean,
  m: boolean,
  a: boolean,
  prefix: string,
): JSX.Element {
  return (
    <div className={`${prefix}__audience`}>
      {v && (
        <span title="Vendors">
          <FaStoreAlt />
        </span>
      )}
      {!v && <span>&nbsp;</span>}
      {e && (
        <span title="Employees">
          <FaUserClock />
        </span>
      )}
      {!e && <span>&nbsp;</span>}
      {m && (
        <span title="Managers">
          <FaUserCog />
        </span>
      )}
      {!m && <span>&nbsp;</span>}
      {a && (
        <span title="Admins">
          <FaUserSecret />
        </span>
      )}
      {!a && <span>&nbsp;</span>}
    </div>
  );
}

export function userHasRole(user: IUserModel, role: string): boolean {
  const r = role.toLowerCase();
  const roles = user.jobTitles.toLowerCase();
  return roles.indexOf(r) >= 0;
}

export function userIsVendor(user: IUserModel): boolean {
  return userHasRole(user, 'vendor');
}

export function userIsEmployee(user: IUserModel): boolean {
  return userHasRole(user, 'employee');
}

export function userIsManager(user: IUserModel): boolean {
  return userHasRole(user, 'manager');
}

export function userIsAdmin(user: IUserModel): boolean {
  return userHasRole(user, 'admin');
}

export function userIsManagerPlus(user: IUserModel): boolean {
  return userIsManager(user) || userIsAdmin(user);
}

export function userIsJimCoEmployee(user: IUserModel): boolean {
  return userIsEmployee(user) || userIsManager(user) || userIsAdmin(user);
}
