type FixedSizeArray<N extends number, T, M extends string = '0'> = {
  readonly [k in M]: any;
} & { length: N } & ReadonlyArray<T>;

type PrecisionMapType = {
  year: string;
  month: string;
  date: string;
  hour: string;
  minute: string;
  second: string;
  millisecond: string;
  week: string;
};
const precisionMap: PrecisionMapType = {
  year: 'yyyy',
  month: 'yyyy/MM',
  date: 'yyyy/MM/dd',
  hour: 'yyyy/MM/dd HH',
  minute: 'yyyy/MM/dd HH:mm',
  second: 'yyyy/MM/dd HH:mm:ss',
  millisecond: 'yyyy/MM/dd HH:mm:ss SSS',
  week: 'yyyy/MM/dd',
};
const precisionMapIgnorePrefix: PrecisionMapType = {
  year: 'yyyy',
  month: 'MM',
  date: 'dd',
  hour: 'HH',
  minute: 'mm',
  second: 'ss',
  millisecond: 'SSS',
  week: 'EE',
};
type Precision = keyof PrecisionMapType;
type LimitPrecision = Exclude<Precision, 'millisecond'>;

interface CompareOption {
  precision?: Precision;
  easy?: boolean;
  self?: boolean;
  overstep?: boolean;
  end?: boolean;
  boundary?: string;
}
type EiyaUnit = 'y' | 'M' | 'd' | 'H' | 'h' | 'm' | 's' | 'S' | 'E' | 'a' | 'A';

type DateUnit = {
  [x in EiyaUnit]?: number;
};

interface LocaleSymbol {
  MMM?: FixedSizeArray<12, string>;
  MMMM?: FixedSizeArray<12, string>;
  MMMMM?: FixedSizeArray<12, string>;
  EEE?: FixedSizeArray<7, string>;
  EEEE?: FixedSizeArray<7, string>;
  EEEEE?: FixedSizeArray<7, string>;
  a?: FixedSizeArray<2, string>;
  A?: FixedSizeArray<2, string>;
  [K: string]: FixedSizeArray<2, string> | FixedSizeArray<7, string> | FixedSizeArray<12, string> | undefined;
}

const defaultLocale: LocaleSymbol = {
  // prettier-ignore
  MMM: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  // prettier-ignore
  MMMM: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  // prettier-ignore
  MMMMM: ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十', '十一', '十二'],
  // prettier-ignore
  EEE: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  // prettier-ignore
  EEEE: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  // prettier-ignore
  EEEEE: ['日', '一', '二', '三', '四', '五', '六'],
  a: ['am', 'pm'],
  A: ['AM', 'PM'],
};

const getValue = {
  M: (date: Date): number => date.getMonth(),
  d: (date: Date): number => date.getDate(),
  H: (date: Date): number => date.getHours(),
  h: (date: Date): number => date.getHours(),
  m: (date: Date): number => date.getMinutes(),
  s: (date: Date): number => date.getSeconds(),
  S: (date: Date): number => date.getMilliseconds(),
  E: (date: Date): number => date.getDay(),
  a: (date: Date): number => (date.getHours() / 12) | 0, // eslint-disable-line no-bitwise
  A: (date: Date): number => (date.getHours() / 12) | 0, // eslint-disable-line no-bitwise
};

type KeyofLocale = keyof LocaleSymbol;

const localeUtils = {
  format(date: Date, fmt: string, locale: LocaleSymbol = defaultLocale) {
    if (/y/i.test(fmt)) {
      const year = `${date.getFullYear()}`;
      if (/^19\d{2}$/.test(year) && fmt.length === 2) {
        return year.slice(-2);
      }
      if (fmt.length < 4 && fmt.length !== 2) {
        throw Error('非法格式字符串: y不支持1位或者3位');
      }
      return year;
    }
    const type = fmt[0] as keyof typeof getValue;
    let value: number = getValue[type](date);

    const arr = locale[fmt as KeyofLocale];
    if (arr) {
      return arr[value];
    }
    if (/M/.test(fmt)) {
      value += 1;
    }
    if (/h/.test(fmt)) {
      value %= 12;
    }
    const maxLength = /S/.test(fmt) ? 3 : 2;
    return `${value}`.padStart(Math.min(fmt.length, maxLength), '0');
  },

  parse(v: string, fmt: string, locale: LocaleSymbol = defaultLocale): DateUnit {
    const arr = locale[fmt as KeyofLocale];
    if (arr) {
      return { [fmt[0]]: arr.findIndex(l => l.toLowerCase() === v.toLowerCase()) };
    }
    let value = +v;
    if (/y/i.test(fmt)) {
      if (fmt.length === 2) {
        value += 1900;
      }
      return { y: value };
    }
    if (/M/.test(fmt)) {
      return { M: value - 1 };
    }
    if (/[dHhmsSE]/.test(fmt)) {
      return { [fmt[0]]: value };
    }
    throw Error(`unexpected format symbol: ${fmt}`);
  },

  defaults(v: number, type: string, now: Date) {
    if (v > -1) {
      return v;
    }
    switch (type) {
      case 'y':
        return now.getFullYear();
      case 'M':
        return now.getMonth();
      case 'd':
        return now.getDate();
      case 'H':
        return now.getHours();
      case 'm':
        return now.getMinutes();
      case 's':
        return now.getSeconds();
      case 'S':
        return now.getMilliseconds();
      // no default
    }
    throw Error(`unexpected format symbol: ${type}`);
  },
};

function simpleDeepClone(option: LocaleSymbol): LocaleSymbol {
  return JSON.parse(JSON.stringify(option)) as LocaleSymbol;
}

function mergeLocale(option?: LocaleSymbol): LocaleSymbol {
  return simpleDeepClone({ ...defaultLocale, ...option });
}

function buildReg(fmt: string, locale: LocaleSymbol = defaultLocale): RegExp {
  const regSource = fmt.replace(/y+|Y+|M+|d+|H+|h+|m+|s+|S+|E+|a+|A+/g, (match): string => {
    if (/y/i.test(match)) {
      if (match.length === 2) {
        return `(?<${match}>\\d{2})`;
      }
      return `(?<${match}>\\d{1,})`;
    }
    const arr = locale[match as KeyofLocale];
    if (/[MdHhmsE]/.test(match)) {
      if (arr) {
        return `(?<${match}>${arr.join('|')})`;
      }
      if (match.length === 2) {
        return `(?<${match}>\\d{2})`;
      }
      return `(?<${match}>\\d{1,2})`;
    }
    if (/a/i.test(match)) {
      if (arr) {
        return `(?<${match}>${arr.join('|')})`;
      }
      return `(?<${match}>am|pm|AM|PM)`;
    }
    if (/S/.test(match)) {
      if (match.length === 3) {
        return `(?<${match}>\\d{3})`;
      }
      return `(?<${match}>\\d{1,3})`;
    }
    throw Error('can not reach this line');
  });
  return new RegExp(`^${regSource}$`, 'i');
}

// eslint-disable-next-line no-use-before-define
type EDate = Eiya | Date;

function getDateValue(eiya: EDate): Date {
  return eiya instanceof Date ? eiya : eiya.date;
}

class Eiya {
  date: Date;

  isEiya: true;

  localLocale?: LocaleSymbol;

  constructor(...args: [(number | Date)?, number?, number?, number?, number?, number?, number?]) {
    // @ts-expect-error 忽略 undefined 影响
    const date = new Date(...args);
    this.date = date;
    this.isEiya = true;
  }

  format(fmt: string): string {
    return Eiya.format(this.date, fmt, this.localLocale);
  }

  isLeapYear() {
    return Eiya.isLeapYear(this.date.getFullYear());
  }

  daysInMonth() {
    return Eiya.daysInMonth(this.date.getFullYear(), this.date.getMonth());
  }

  isValidDate() {
    return Eiya.isValidDate(this.date);
  }

  isSame(eiya: EDate, option?: CompareOption | Precision): boolean {
    return Eiya.isSame(this.date, getDateValue(eiya), option);
  }

  isBetween(start: EDate, end: EDate, option?: CompareOption | Precision) {
    return Eiya.isBetween(this.date, getDateValue(start), getDateValue(end), option);
  }

  isAfter(target: EDate, option?: CompareOption | Precision): boolean {
    return Eiya.isAfter(this.date, getDateValue(target), option);
  }

  isBefore(target: EDate, option?: CompareOption | Precision): boolean {
    return Eiya.isBefore(this.date, getDateValue(target), option);
  }

  add(addend: number, option?: CompareOption | Precision): Eiya {
    return new Eiya(Eiya.add(this.date, addend, option));
  }

  subtract(subtrahend: number, option?: CompareOption | Precision): Eiya {
    return this.add(-subtrahend, option);
  }

  startOf(precision: LimitPrecision): Eiya {
    return new Eiya(Eiya.startOf(this.date, precision));
  }

  endOf(precision: LimitPrecision): Eiya {
    return new Eiya(Eiya.endOf(this.date, precision));
  }

  clone(): Eiya {
    return new Eiya(this.date);
  }

  compare(eiya: EDate, precision?: CompareOption | Precision) {
    return Eiya.compare(this.date, getDateValue(eiya), precision);
  }

  locale(config: LocaleSymbol) {
    this.localLocale = mergeLocale(config);
    return this;
  }

  static format(date: Date, fmt: string, locale?: LocaleSymbol): string {
    const pdate = new Date(date);
    return fmt.replace(/Y+|y+|M+|d+|H+|h+|m+|s+|S+|E+|a|A/g, match => localeUtils.format(pdate, match, locale));
  }

  static parse(str: string, fmt: string, locale?: LocaleSymbol): Date {
    const fmtReg: RegExp = buildReg(fmt);
    const match = str.match(fmtReg);
    if (!match) {
      throw Error('日期字符串和格式字符串不匹配');
    }

    const units: DateUnit = {};
    Object.entries(match.groups || {}).forEach(([f, value]) => {
      Object.assign(units, localeUtils.parse(value, f, locale));
    });
    let { y = -1, M = -1, d = -1, H = -1, h = -1, m = -1, s = -1, S = -1, E = -1, a = -1, A = -1 } = units;
    a = Math.max(a, A);

    if (H > -1 && (h > -1 || a > -1)) {
      throw Error('非法格式字符串: H不能和h,a,A同时存在');
    }
    // eslint-disable-next-line no-bitwise
    if (+(h > -1) ^ +(a > -1)) {
      throw Error('非法格式字符串: h和a,A必须成对出现');
    }
    const now = new Date();
    y = localeUtils.defaults(y, 'y', now);
    M = localeUtils.defaults(M, 'M', now);
    d = localeUtils.defaults(d, 'd', now);
    if (h > -1) {
      H = h + a * 12;
    } else {
      H = localeUtils.defaults(H, 'H', now);
    }
    m = localeUtils.defaults(m, 'm', now);
    s = localeUtils.defaults(s, 's', now);
    S = localeUtils.defaults(S, 'S', now);

    if (!Eiya.isValidDate(y, M, d, H, m, s, S)) {
      throw Error('非法日期字符串');
    }
    const date = new Date(y, M, d, H, m, s, S);
    if (E > -1 && date.getDay() !== E) {
      throw Error('非法日期字符串');
    }
    return date;
  }

  static isLeapYear(year: number): boolean {
    return year % 400 === 0 || (year % 4 === 0 && year % 100 !== 0);
  }

  // 月份从0开始
  static daysInMonth(year: number, month: number): number {
    if (month === 1) {
      return Eiya.isLeapYear(year) ? 29 : 28;
    }
    return ((Math.abs(month - 6.5) + 1) & 1) + 30; // eslint-disable-line no-bitwise
  }

  static isValidDate(year: Date | number, month = 0, date = 1, hour = 0, minute = 0, second = 0, millis = 0): boolean {
    if (year instanceof Date) {
      return date.toString() !== 'Invalid Date';
    }
    if (typeof year !== 'number') {
      return false;
    }
    if (month < 0 || month > 11) {
      return false;
    }
    if (date < 1 || date > Eiya.daysInMonth(+year, +month)) {
      return false;
    }
    if (hour < 0 || hour > 23) {
      return false;
    }
    if (minute < 0 || minute > 59) {
      return false;
    }
    if (second < 0 || second > 59) {
      return false;
    }
    if (millis < 0 || millis > 999) {
      return false;
    }
    return true;
  }

  // 比较两个日期是否一样，precision为比较精度， easy表示是否只比较指定精度而忽略其它精度
  static isSame(date1: Date, date2: Date, option: CompareOption | Precision = {}) {
    let op = option as CompareOption;
    if (typeof option === 'string') {
      op = { precision: option };
    }
    const { precision = 'millisecond', easy = false } = op;
    const fmt = easy ? precisionMapIgnorePrefix[precision] : precisionMap[precision];

    return Eiya.format(date1, fmt) === Eiya.format(date2, fmt);
  }

  static isAfter(date: Date, target: Date, option: CompareOption | Precision = {}) {
    let op = option as CompareOption;
    if (typeof option === 'string') {
      op = { precision: option };
    }
    const { precision = 'millisecond', easy = false, self = false } = op;

    const fmt = easy ? precisionMapIgnorePrefix[precision] : precisionMap[precision];
    const dateStr = Eiya.format(date, fmt);
    const targetStr = Eiya.format(target, fmt);

    if (dateStr > targetStr) {
      return true;
    }
    if (self && dateStr === targetStr) {
      return true;
    }
    return false;
  }

  static isBefore(date: Date, target: Date, option: CompareOption | Precision = {}) {
    return Eiya.isAfter(target, date, option as CompareOption);
  }

  // 比较日期是否在start,end两个日期日期中间， precision为比较精度， easy表示是否只比较指定精度而忽略其它精度， boundary表示边界的开闭
  static isBetween(date: Date, start: Date, end: Date, option: CompareOption | Precision = {}): boolean {
    let op = option as CompareOption;
    if (typeof option === 'string') {
      op = { precision: option };
    }
    const { boundary = '[]' } = op;
    const [left, right] = boundary.split('');
    return (
      Eiya.isAfter(date, start, { ...op, self: left === '[' }) &&
      Eiya.isBefore(date, end, { ...op, self: right === ']' })
    );
  }

  static add(date: Date, addend: number, option: CompareOption | Precision = {}): Date {
    let op = option as CompareOption;
    if (typeof option === 'string') {
      op = { precision: option };
    }
    const { precision = 'millisecond', overstep = false, end = true } = op;

    switch (precision) {
      case 'millisecond':
        return new Date(date.getTime() + addend);
      case 'second':
        return new Date(date.getTime() + addend * 1000);
      case 'minute':
        return new Date(date.getTime() + addend * 60000);
      case 'hour':
        return new Date(date.getTime() + addend * 3600000);
      case 'date':
        return new Date(date.getTime() + addend * 86400000);
      case 'week':
        return new Date(date.getTime() + addend * 7 * 86400000);
      case 'month':
      case 'year':
        break;
      default:
        throw Error('not valid precision');
    }

    const cyear = date.getFullYear();
    const cmonth = date.getMonth();
    const cdate = date.getDate();
    let tmonth = cmonth;
    let tyear = cyear;
    if (precision === 'month') {
      tmonth += addend;
      tyear += Math.floor(tmonth / 12);
      tmonth %= 12;
    } else {
      tyear += addend;
    }
    const maxTdate = Eiya.daysInMonth(tyear, tmonth);
    const maxCdate = Eiya.daysInMonth(cyear, cmonth);
    let tdate;
    if (cdate === maxCdate && end) {
      tdate = maxTdate;
    } else if (overstep) {
      tdate = cdate;
    } else {
      tdate = Math.min(cdate, maxTdate);
    }

    const newDate = new Date(date);
    newDate.setFullYear(tyear, tmonth, tdate);
    return newDate;
  }

  static subtract(date: Date, subtrahend: number, option: CompareOption | Precision): Date {
    return Eiya.add(date, -subtrahend, option);
  }

  static startOf(date: Date, precision: LimitPrecision): Date {
    const newDate = new Date(date);
    switch (precision) {
      case 'year':
        newDate.setMonth(0, 1);
        newDate.setHours(0, 0, 0, 0);
        return newDate;
      case 'month':
        newDate.setDate(1);
        newDate.setHours(0, 0, 0, 0);
        return newDate;
      case 'date':
        newDate.setHours(0, 0, 0, 0);
        return newDate;
      case 'hour':
        newDate.setMinutes(0, 0, 0);
        return newDate;
      case 'minute':
        newDate.setSeconds(0, 0);
        return newDate;
      case 'second':
        newDate.setMilliseconds(0);
        return newDate;
      case 'week':
        newDate.setDate(date.getDate() - date.getDay());
        newDate.setHours(0, 0, 0, 0);
        return newDate;
      // no default
    }
    throw Error('错误的精度');
  }

  static endOf(date: Date, precision: LimitPrecision): Date {
    const newDate = new Date(date);
    switch (precision) {
      case 'year':
        newDate.setMonth(11, 31);
        newDate.setHours(23, 59, 59, 999);
        return newDate;
      case 'month':
        newDate.setMonth(date.getMonth() + 1, 0);
        newDate.setHours(23, 59, 59, 999);
        return newDate;
      case 'date':
        newDate.setHours(23, 59, 59, 999);
        return newDate;
      case 'hour':
        newDate.setMinutes(59, 59, 999);
        return newDate;
      case 'minute':
        newDate.setSeconds(59, 999);
        return newDate;
      case 'second':
        newDate.setMilliseconds(999);
        return newDate;
      case 'week':
        newDate.setDate(date.getDate() + 6 - date.getDay());
        newDate.setHours(23, 59, 59, 999);
        return newDate;
      // no default
    }
    throw Error('错误的精度');
  }

  static clone(date: Date): Date {
    return new Date(date);
  }

  static compare(date1: Date, date2: Date, option?: CompareOption | Precision): number {
    if (Eiya.isBefore(date1, date2, option)) {
      return -1;
    }
    if (Eiya.isSame(date1, date2, option)) {
      return 0;
    }
    return 1;
  }

  static max(option: CompareOption | Precision | Date, ...dates: Array<Date>): Date {
    let op = option as CompareOption;
    if (option instanceof Date) {
      dates.unshift(option);
      op = {};
    } else if (typeof option === 'string') {
      op = { precision: option };
    }
    const { precision = 'millisecond', easy = false } = op;
    const fmt = easy ? precisionMapIgnorePrefix[precision] : precisionMap[precision];
    const maxDate = dates.reduce(
      (last, current) => {
        const date = Eiya.format(current, fmt);
        if (last.date >= date) {
          return last;
        }
        return { date, max: current };
      },
      { date: Eiya.format(dates[0], fmt), max: dates[0] },
    );
    return maxDate.max;
  }

  static min(option: CompareOption | Precision | Date, ...args: Array<Date>): Date {
    let op = option as CompareOption;
    if (option instanceof Date) {
      args.unshift(option);
      op = {};
    } else if (typeof option === 'string') {
      op = { precision: option };
    }
    const { precision = 'millisecond', easy = false } = op;
    const fmt = easy ? precisionMapIgnorePrefix[precision] : precisionMap[precision];
    const maxDate = args.reduce(
      (last, current) => {
        const date = Eiya.format(current, fmt);
        if (last.date <= date) {
          return last;
        }
        return { date, min: current };
      },
      { date: Eiya.format(args[0], fmt), min: args[0] },
    );
    return maxDate.min;
  }
}

export default Eiya;

export const Units: {
  YEAR: LimitPrecision;
  MONTH: LimitPrecision;
  DATE: LimitPrecision;
  HOUR: LimitPrecision;
  MINUTE: LimitPrecision;
  SECOND: LimitPrecision;
  MILLISECOND: Precision;
  WEEK: LimitPrecision;
} = {
  YEAR: 'year',
  MONTH: 'month',
  DATE: 'date',
  HOUR: 'hour',
  MINUTE: 'minute',
  SECOND: 'second',
  MILLISECOND: 'millisecond',
  WEEK: 'week',
};
