const defaultLocale = {
  // prettier-ignore
  MMM: [ 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  // prettier-ignore
  MMMM: [ 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  // prettier-ignore
  MMMMM: [ '一', '二', '三', '四', '五', '六', '七', '八', '九', '十', '十一', '十二'],
  // prettier-ignore
  EEE: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  // prettier-ignore
  EEEE: [ 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  // prettier-ignore
  EEEEE: ['日', '一', '二', '三', '四', '五', '六'],
  a: ['am', 'pm'],
  A: ['AM', 'PM'],
};

const getValue = {
  M: date => date.getMonth(),
  d: date => date.getDate(),
  H: date => date.getHours(),
  h: date => date.getHours(),
  m: date => date.getMinutes(),
  s: date => date.getSeconds(),
  S: date => date.getMilliseconds(),
  E: date => date.getDay(),
  a: date => (date.getHours() / 12) | 0,
  A: date => (date.getHours() / 12) | 0,
};

const localeUtils = {
  // format(v, fmt, locale = defaultLocale) {
  format(date, fmt, locale = defaultLocale) {
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
    const type = fmt[0];
    let value = getValue[type](date);

    if (locale[fmt]) {
      return locale[fmt][value];
    }
    if (/M/.test(fmt)) {
      value += 1;
    }
    if (/h/.test(fmt)) {
      value %= 12;
    }
    let maxLength = /S/.test(fmt) ? 3 : 2;
    return `${value}`.padStart(Math.min(fmt.length, maxLength), 0);
  },
  parse(v, fmt, locale = defaultLocale) {
    if (locale[fmt]) {
      return { [fmt[0]]: locale[fmt].findIndex(l => l.toLowerCase() === v.toLowerCase()) };
    }
    if (/y/i.test(fmt)) {
      if (fmt.length === 2) {
        v = +v + 1900;
      }
      return { y: +v };
    }
    if (/M/.test(fmt)) {
      return { M: +v - 1 };
    }
    if (/[dHhmsSE]/.test(fmt)) {
      return { [fmt[0]]: +v };
    }
  },
  defaults(v, type, now) {
    if (v !== undefined) {
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
    }
  },
};

function simpleDeepClone(option) {
  return JSON.parse(JSON.stringify(option) || null);
}
function mergeLocale(option) {
  return { ...simpleDeepClone(defaultLocale), ...simpleDeepClone(option) };
}

class Eiya {
  constructor(...args) {
    const date = new Date(...args);
    this.date = date;
    this.isEiya = true;
  }

  format(fmt) {
    return Eiya.locale(this.localLocale).format(this.date, fmt);
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
  isSame(eiya, option) {
    return Eiya.isSame(this.date, eiya.isEiya ? eiya.date : eiya, option);
  }
  isBetween(start, end, option) {
    return Eiya.isBetween(this.date, start.isEiya ? start.date : start, end.isEiya ? end.date : end, option);
  }
  isAfter(target, option) {
    return Eiya.isAfter(this.date, target.isEiya ? target.date : target, option);
  }
  isBefore(target, option) {
    return Eiya.isBefore(this.date, target.isEiya ? target.date : target, option);
  }
  add(addend, option) {
    return new Eiya(Eiya.add(this.date, addend, option));
  }
  subtract(subtrahend, option) {
    return this.add(-subtrahend, option);
  }
  startOf(precision) {
    return new Eiya(Eiya.startOf(this.date, precision));
  }
  endOf(precision) {
    return new Eiya(Eiya.endOf(this.date, precision));
  }
  clone() {
    return new Eiya(this.date);
  }
  compare(eiya, precision) {
    const date = eiya.isEiya ? eiya.date : eiya;
    return Eiya.compare(this.date, date, precision);
  }
  locale(config) {
    this.localLocale = mergeLocale(config);
    return this;
  }

  static format(date, fmt) {
    date = new Date(date);
    return fmt.replace(/Y+|y+|M+|d+|H+|h+|m+|s+|S+|E+|a|A/g, match => {
      return localeUtils.format(date, match, this.localLocale);
    });
  }
  static parse(str, fmt) {
    const fmtReg = buildReg(fmt);
    const match = str.match(fmtReg);
    if (!match) {
      throw Error('日期字符串和格式字符串不匹配');
    }

    const units = {};
    Object.entries(match.groups || {}).forEach(([fmt, value]) => {
      Object.assign(units, localeUtils.parse(value, fmt, this.localLocale));
    });

    let { y, M, d, H, h, m, s, S, E, a, A } = units;
    a = a || A;
    if (H > -1 && (h > -1 || a > -1)) {
      throw Error('非法格式字符串: H不能和h,a,A同时存在');
    }
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

    if (!Eiya.isValidDate(y, M + 1, d, H, m, s, S)) {
      throw Error('非法日期字符串');
    }

    const date = new Date(y, M, d, H, m, s, S);
    if (E > -1 && date.getDay() !== E) {
      throw Error('非法日期字符串');
    }
    return date;
  }
  static isLeapYear(year) {
    return year % 400 === 0 || (year % 4 === 0 && year % 100 !== 0);
  }
  // 月份从0开始
  static daysInMonth(year, month) {
    if (month === 1) {
      return Eiya.isLeapYear(year) ? 29 : 28;
    }
    return ((Math.abs(month - 6.5) + 1) & 1) + 30;
  }
  // 月份从0开始
  static isValidDate(
    year = new Date().getFullYear(),
    month = 0,
    date = 1,
    hour = 0,
    minute = 0,
    second = 0,
    millis = 0,
  ) {
    if (year instanceof Date) {
      return year.toString() !== 'Invalid Date';
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
  static isSame(date1, date2, option = {}) {
    if (typeof option === 'string') {
      option = { precision: option, easy: false };
    }
    const { precision = 'millisecond', easy = false } = option;
    const fmt = easy ? precisionMapIgnorePrefix[precision] : precisionMap[precision];
    return Eiya.format(date1, fmt) === Eiya.format(date2, fmt);
  }
  // 比较日期是否在start,end两个日期日期中间， precision为比较精度， easy表示是否只比较指定精度而忽略其它精度， left和right表示左右边界的开闭
  static isBetween(date, start, end, option = {}) {
    if (typeof option === 'string') {
      option = { precision: option };
    }
    const { precision = 'millisecond', easy = false, left = 'close', right = 'close' } = option;
    const fmt = easy ? precisionMapIgnorePrefix[precision] : precisionMap[precision];
    date = Eiya.format(date, fmt);
    start = Eiya.format(start, fmt);
    end = Eiya.format(end, fmt);

    if (date < start) {
      return false;
    }
    if (date === start && left === 'open') {
      return false;
    }
    if (date > end) {
      return false;
    }
    if (date === end && right === 'open') {
      return false;
    }
    return true;
  }
  static isAfter(date, target, option = {}) {
    if (typeof option === 'string') {
      option = { precision: option };
    }
    const { precision = 'millisecond', easy = false, self = false } = option;

    const fmt = easy ? precisionMapIgnorePrefix[precision] : precisionMap[precision];
    date = Eiya.format(date, fmt);
    target = Eiya.format(target, fmt);

    if (date > target) {
      return true;
    }
    if (self && date === target) {
      return true;
    }
    return false;
  }
  static isBefore(date, target, option = {}) {
    return Eiya.isAfter(target, date, option);
  }
  static add(date, addend, option = {}) {
    if (typeof option === 'string') {
      option = { precision: option };
    }
    const { precision = 'millisecond', overstep = false, end = true } = option;

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
    let tdate = cdate === maxCdate && end ? maxTdate : overstep ? cdate : Math.min(cdate, maxTdate);

    const newDate = new Date(date);
    newDate.setFullYear(tyear, tmonth, tdate);
    return newDate;
  }
  static subtract(date, subtrahend, option) {
    return Eiya.add(date, -subtrahend, option);
  }
  static startOf(date, precision) {
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
    }
    throw Error('错误的精度');
  }
  static endOf(date, precision) {
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
    }
    throw Error('错误的精度');
  }
  static clone(date) {
    return new Date(date);
  }
  static compare(date1, date2, option) {
    if (Eiya.isBefore(date1, date2, option)) {
      return -1;
    } else if (Eiya.isSame(date1, date2, option)) {
      return 0;
    }
    return 1;
  }
  static max(option, ...args) {
    if (option instanceof Date) {
      args.unshift(option);
      option = {};
    } else if (typeof option === 'string') {
      option = { precision: option };
    }
    const { precision = 'millisecond', easy = false } = option;
    const fmt = easy ? precisionMapIgnorePrefix[precision] : precisionMap[precision];
    const maxDate = args.reduce(
      (last, current) => {
        const date = Eiya.format(current, fmt);
        if (last.date >= date) {
          return last;
        }
        return { date, max: current };
      },
      { date: Eiya.format(args[0], fmt), max: args[0] },
    );
    return maxDate.max;
  }
  static min(option, ...args) {
    if (option instanceof Date) {
      args.unshift(option);
      option = {};
    } else if (typeof option === 'string') {
      option = { precision: option };
    }
    const { precision = 'millisecond', easy = false } = option;
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
  static locale(config) {
    const ins = Object.create(Eiya);
    ins.localLocale = mergeLocale(config);

    return ins;
  }
}

function buildReg(fmt, locale = defaultLocale) {
  const regStr = fmt.replace(/y+|Y+|M+|d+|H+|h+|m+|s+|S+|E+|a+|A+/g, match => {
    if (/y/i.test(match)) {
      if (match.length === 2) {
        return `(?<${match}>\\d{2})`;
      }
      return `(?<${match}>\\d{1,})`;
    }
    if (/[MdHhmsE]/.test(match)) {
      if (locale[match]) {
        return `(?<${match}>${locale[match].join('|')})`;
      }
      if (match.length === 2) {
        return `(?<${match}>\\d{2})`;
      }
      return `(?<${match}>\\d{1,2})`;
    }
    if (/S/.test(match)) {
      if (match.length === 3) {
        return `(?<${match}>\\d{3})`;
      }
      return `(?<${match}>\\d{1,3})`;
    }
    if (/a/i.test(match)) {
      return `(?<${match}>am|pm|AM|PM)`;
    }
  });

  return new RegExp(`^${regStr}$`, 'i');
}

const precisionMap = {
  year: 'yyyy',
  month: 'yyyy/MM',
  date: 'yyyy/MM/dd',
  hour: 'yyyy/MM/dd HH',
  minute: 'yyyy/MM/dd HH:mm',
  second: 'yyyy/MM/dd HH:mm:ss',
  millisecond: 'yyyy/MM/dd HH:mm:ss SSS',
  week: 'yyyy/MM/dd',
};
const precisionMapIgnorePrefix = {
  year: 'yyyy',
  month: 'MM',
  date: 'dd',
  hour: 'HH',
  minute: 'mm',
  second: 'ss',
  millisecond: 'SSS',
  week: 'EE',
};

export default Eiya;
