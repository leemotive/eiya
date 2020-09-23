const locale = {
  MMM: [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ],
  MMMM: [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ],
  MMMMM: [
    '一',
    '二',
    '三',
    '四',
    '五',
    '六',
    '七',
    '八',
    '九',
    '十',
    '十一',
    '十二',
  ],
  EEE: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  EEEE: [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ],
  EEEEE: ['日', '一', '二', '三', '四', '五', '六'],
};

const localeUtils = {
  format(v, fmt) {
    if (/y/.test(fmt)) {
      if (/^19\d{2}$/.test(`${v}`) && fmt.length === 2) {
        return `${v}`.slice(-2);
      }
      if (fmt.length < 4 && fmt.length !== 2) {
        throw Error('非法格式字符串: y不支持1位或者3位');
      }
      return v;
    }
    if (locale[fmt]) {
      return locale[fmt][v];
    }
    if (/M/.test(fmt)) {
      v += 1;
    }
    if (/h/.test(fmt)) {
      v = v % 12;
    }
    return `${v}`.padStart(fmt.length, 0);
  },
  parse(v, type, fmt) {
    if (locale[fmt]) {
      return locale[fmt].findIndex((l) => l.toLowerCase() === v.toLowerCase());
    }
    if (['y', 'Y'].includes(type)) {
      if (fmt.length === 2) {
        return +v + 1900;
      }
      return +v;
    }
    if ('M' === type) {
      return +v - 1;
    }
    if (['d', 'H', 'h', 'm', 's', 'S', 'E'].includes(type)) {
      return +v;
    }
    if ('a' === type) {
      return v.toLowerCase();
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

class Eiya {
  constructor(...args) {
    const date = new Date(...args);
    this.date = date;
    this.isEiya = true;
  }

  format(fmt) {
    return Eiya.format(this.date, fmt);
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
  isBetween(from, to, option) {
    return Eiya.isBetween(
      this.date,
      from.isEiya ? from.date : from,
      to.isEiya ? to.date : to,
      option,
    );
  }
  isAfter(target, option) {
    return Eiya.isAfter(
      this.date,
      target.isEiya ? target.date : target,
      option,
    );
  }
  isBefore(target, option) {
    return Eiya.isBefore(
      this.date,
      target.isEiya ? target.date : target,
      option,
    );
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

  static format(date, fmt) {
    date = new Date(date);
    let methodNames = {
      y: (f) => localeUtils.format(date.getFullYear(), f),
      M: (f) => localeUtils.format(date.getMonth(), f),
      d: (f) => localeUtils.format(date.getDate(), f),
      H: (f) => localeUtils.format(date.getHours(), f),
      h: (f) => localeUtils.format(date.getHours(), f),
      m: (f) => localeUtils.format(date.getMinutes(), f),
      s: (f) => localeUtils.format(date.getSeconds(), f),
      S: (f) => localeUtils.format(date.getMilliseconds(), f),
      E: (f) => localeUtils.format(date.getDay(), f),
      a: () => (date.getHours() > 11 ? 'pm' : 'am'),
      A: () => (date.getHours() > 11 ? 'PM' : 'AM'),
    };

    return fmt.replace(/y+|M+|d+|H+|h+|m+|s+|S+|E+|a|A/g, (match) => {
      const type = match[0];
      return methodNames[type](match);
    });
  }
  static parse(str, fmt) {
    const fmtReg = buildReg(fmt);
    const match = str.match(fmtReg);
    if (!match) {
      throw Error('日期字符串和格式字符串不匹配');
    }

    const units = {};
    Object.entries(match.groups || {}).forEach(([key, value]) => {
      const [type, fmt] = key.split('_');
      units[type] = localeUtils.parse(value, type, fmt);
    });

    let { y, M, d, H, h, m, s, S, E, a } = units;
    if (H > -1 && (h > -1 || a)) {
      throw Error('非法格式字符串: H不能和h,a同时存在');
    }
    if (+!!(h > -1) ^ +!!a) {
      throw Error('非法格式字符串: h和a必须成对出现');
    }

    const now = new Date();
    y = localeUtils.defaults(y, 'y', now);
    M = localeUtils.defaults(M, 'M', now);
    d = localeUtils.defaults(d, 'd', now);
    if (h > -1) {
      H = localeUtils.defaults(a === 'am' ? h : h + 12, 'H', now);
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
    year = 1970,
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
    if (year < 100 && year >= 0) {
      year = +year + 1900;
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
    const fmt = easy
      ? precisionMapIgnorePrefix[precision]
      : precisionMap[precision];
    return Eiya.format(date1, fmt) === Eiya.format(date2, fmt);
  }
  // 比较日期是否在from,to两个日期日期中间， precision为比较精度， easy表示是否只比较指定精度而忽略其它精度， left和right表示左右边界的开闭
  static isBetween(date, from, to, option = {}) {
    if (typeof option === 'string') {
      option = { precision: option };
    }
    const {
      precision = 'millisecond',
      easy = false,
      left = 'close',
      right = 'close',
    } = option;
    const fmt = easy
      ? precisionMapIgnorePrefix[precision]
      : precisionMap[precision];
    date = Eiya.format(date, fmt);
    from = Eiya.format(from, fmt);
    to = Eiya.format(to, fmt);

    if (date < from) {
      return false;
    }
    if (date === from && left === 'open') {
      return false;
    }
    if (date > to) {
      return false;
    }
    if (date === to && right === 'open') {
      return false;
    }
    return true;
  }
  static isAfter(date, target, option = {}) {
    if (typeof option === 'string') {
      option = { precision: option };
    }
    const { precision = 'millisecond', easy = false, self = false } = option;

    const fmt = easy
      ? precisionMapIgnorePrefix[precision]
      : precisionMap[precision];
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
    let tdate =
      cdate === maxCdate && end
        ? maxTdate
        : overstep
        ? cdate
        : Math.min(cdate, maxTdate);

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
  static compare(date1, date2, precision) {
    if (Eiya.isBefore(date1, date2, precision)) {
      return -1;
    } else if (Eiya.isSame(date1, date2, precision)) {
      return 0;
    }
    return 1;
  }
}

function buildReg(fmt) {
  const regStr = fmt.replace(
    /y+|Y+|M+|d+|H+|h+|m+|s+|S+|E+|a+|A+/g,
    (match) => {
      const type = match[0];

      if (['y', 'Y'].includes(type)) {
        if (match.length === 2) {
          return `(?<y_${match}>\\d{2})`;
        }
        return `(?<y_${match}>\\d{1,})`;
      }
      if (['M', 'd', 'H', 'h', 'm', 's', 'E'].includes(type)) {
        if (locale[match]) {
          return `(?<${type}_${match}>${locale[match].join('|')})`;
        }
        if (match.length === 2) {
          return `(?<${type}_${match}>\\d{2})`;
        }
        return `(?<${type}_${match}>\\d{1,2})`;
      }
      if (type === 'S') {
        if (match.length === 3) {
          return `(?<${type}_${match}>\\d{3})`;
        }
        return `(?<${type}_${match}>\\d{1,3})`;
      }
      if (['a', 'A'].includes(type)) {
        return `(?<a_${match}>am|pm|AM|PM)`;
      }
    },
  );

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
