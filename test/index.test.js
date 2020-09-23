/* global describe, test, expect */

import Eiya from '../index.js';

describe('格式化使用', () => {
  const now = new Eiya(2020, 9, 4, 9, 34, 55, 234);
  const date19 = new Eiya(1994, 10, 23, 12, 12, 23, 234);

  test('普通格式化', () => {
    expect(now.format('yyyy/MM/dd HH:mm:ss SSS')).toBe('2020/10/04 09:34:55 234');
  });
  test('月份缩写', () => {
    expect(now.format('yyyy/MMM/dd HH:mm:ss SSS')).toBe('2020/Oct/04 09:34:55 234');
  });
  test('星期', () => {
    expect(now.format('yyyy/MMM/dd 星期EEEEE HH:mm:ss SSS')).toBe('2020/Oct/04 星期日 09:34:55 234');
  });
  test('上午', () => {
    expect(now.format('yyyy/MM/dd hh:mm:ss SSS A')).toBe('2020/10/04 09:34:55 234 AM');
  });
  test('下午', () => {
    expect(date19.format('yy/MMM/dd hh:mm:ss SSS a')).toBe('94/Nov/23 00:12:23 234 pm');
  });
  test('1900', () => {
    expect(date19.format('yy/MMM/dd HH:mm:ss SSS')).toBe('94/Nov/23 12:12:23 234');
  });
});

describe('解析使用', () => {
  test('常规解析', () => {
    const date = Eiya.parse('2020/Oct/10 11:23:34 234', 'yyyy/MMM/dd HH:mm:ss SSS');
    const beDate = new Date(2020, 9, 10, 11, 23, 34, 234);
    expect(date.getTime()).toBe(beDate.getTime());
  });
  test('1900', () => {
    const date = Eiya.parse('90/Oct/10 11:23:34 234', 'yy/MMM/dd HH:mm:ss SSS');
    const beDate = new Date(1990, 9, 10, 11, 23, 34, 234);
    expect(date.getTime()).toBe(beDate.getTime());
  });
  test('单M', () => {
    const date = Eiya.parse('90/4/10 11:23:34 234', 'yy/M/dd HH:mm:ss SSS');
    const beDate = new Date(1990, 3, 10, 11, 23, 34, 234);
    expect(date.getTime()).toBe(beDate.getTime());
  });
  test('下午', () => {
    const date = Eiya.parse('90/4/10 11:23:34 234 pm', 'yy/M/dd hh:mm:ss SSS a');
    const beDate = new Date(1990, 3, 10, 23, 23, 34, 234);
    expect(date.getTime()).toBe(beDate.getTime());
  });
  test('上午', () => {
    const date = Eiya.parse('2020/2/10 11:23:34 23 AM', 'yyyy/M/dd hh:mm:ss S A');
    const beDate = new Date(2020, 1, 10, 11, 23, 34, 23);
    expect(date.getTime()).toBe(beDate.getTime());
  });
});

describe('默认值解析使用', () => {
  test('全部为空，使用当前日期值', () => {
    const date = Eiya.parse('', '');
    const beDate = new Date();
    expect(date.getTime() - beDate.getTime()).toBeLessThanOrEqual(2);
  });
});

describe('静态方法', () => {
  describe('isValidDate', () => {
    test('实例方法', () => expect(new Eiya().isValidDate()).toBeTruthy());
    test('1900', () => expect(Eiya.isValidDate(89, 10, 11, 12, 12, 12, 788)).toBeTruthy());
    test('月份过小', () => expect(Eiya.isValidDate(2020, -1, 11, 12, 12, 12, 788)).toBeFalsy());
    test('月份过大', () => expect(Eiya.isValidDate(2020, 12, 11, 12, 12, 12, 788)).toBeFalsy());
    test('日期过小', () => expect(Eiya.isValidDate(2020, 10, 0, 12, 12, 12, 788)).toBeFalsy());
    test('日期过大', () => expect(Eiya.isValidDate(2020, 10, 32, 12, 12, 12, 788)).toBeFalsy());
    test('时过小', () => expect(Eiya.isValidDate(2020, 10, 11, -1, 12, 12, 788)).toBeFalsy());
    test('时过大', () => expect(Eiya.isValidDate(2020, 10, 11, 24, 12, 12, 788)).toBeFalsy());
    test('分过小', () => expect(Eiya.isValidDate(2020, 10, 11, 12, -1, 12, 788)).toBeFalsy());
    test('分过大', () => expect(Eiya.isValidDate(2020, 10, 11, 12, 60, 12, 788)).toBeFalsy());
    test('秒过小', () => expect(Eiya.isValidDate(2020, 10, 11, 12, 12, -1, 788)).toBeFalsy());
    test('秒过大', () => expect(Eiya.isValidDate(2020, 10, 11, 12, 12, 60, 788)).toBeFalsy());
    test('毫秒过小', () => expect(Eiya.isValidDate(2020, 10, 11, 12, 12, 12, -1)).toBeFalsy());
    test('毫秒过大', () => expect(Eiya.isValidDate(2020, 10, 11, 12, 12, 12, 1000)).toBeFalsy());
    test('日期超过当月最大值', () => expect(Eiya.isValidDate(1990, 1, 29, 12, 12, 12, 383)).toBeFalsy());
  });
  describe('substract', () => {
    expect(Eiya.subtract(new Date(2019, 11, 12), 1, 'year').getFullYear()).toBe(2018);
  });
  describe('clone', () => {
    const args = [2019, 11, 12, 12, 23, 43, 899];
    expect(Eiya.clone(new Date(...args)).getTime()).toBe(new Date(...args).getTime());
  });
});

describe('实例方法', () => {
  describe('isLeapYear', () => {
    test('平年', () => expect(new Eiya(2019, 11, 1).isLeapYear()).toBeFalsy());
    test('闰年', () => expect(new Eiya(2020, 11, 1).isLeapYear()).toBeTruthy());
    test('整100平年', () => expect(new Eiya(2100, 11, 1).isLeapYear()).toBeFalsy());
    test('整400闰年', () => expect(new Eiya(2000, 11, 1).isLeapYear()).toBeTruthy());
  });

  describe('daysInMonth', () => {
    test('1月', () => expect(new Eiya(2019, 0, 1).daysInMonth()).toBe(31));
    test('2月', () => expect(new Eiya(2019, 1, 1).daysInMonth()).toBe(28));
    test('2月-闰年', () => expect(new Eiya(2020, 1, 1).daysInMonth()).toBe(29));
    test('3月', () => expect(new Eiya(2019, 2, 1).daysInMonth()).toBe(31));
    test('4月', () => expect(new Eiya(2019, 3, 1).daysInMonth()).toBe(30));
    test('5月', () => expect(new Eiya(2019, 4, 1).daysInMonth()).toBe(31));
    test('6月', () => expect(new Eiya(2019, 5, 1).daysInMonth()).toBe(30));
    test('7月', () => expect(new Eiya(2019, 6, 1).daysInMonth()).toBe(31));
    test('8月', () => expect(new Eiya(2019, 7, 1).daysInMonth()).toBe(31));
    test('9月', () => expect(new Eiya(2019, 8, 1).daysInMonth()).toBe(30));
    test('10月', () => expect(new Eiya(2019, 9, 1).daysInMonth()).toBe(31));
    test('11月', () => expect(new Eiya(2019, 10, 1).daysInMonth()).toBe(30));
    test('12月', () => expect(new Eiya(2019, 11, 1).daysInMonth()).toBe(31));
  });

  describe('isSame', () => {
    const eiya = new Eiya(2020, 3, 4, 14, 15, 16, 348);
    test('年', () => {
      expect(eiya.isSame(new Eiya(2020, 0, 1), 'year')).toBeTruthy();
      expect(eiya.isSame(new Eiya(2019, 0, 1), 'year')).toBeFalsy();
      expect(eiya.isSame(new Eiya(2020, 0, 1), { precision: 'year', easy: true })).toBeTruthy();
    });
    test('月', () => {
      expect(eiya.isSame(new Eiya(2020, 3, 1), 'month')).toBeTruthy();
      expect(eiya.isSame(new Eiya(2020, 4, 1), 'month')).toBeFalsy();
      expect(eiya.isSame(new Eiya(2019, 3, 1), 'month')).toBeFalsy();
      expect(eiya.isSame(new Eiya(2019, 3, 1), { precision: 'month', easy: true })).toBeTruthy();
    });
    test('日', () => {
      expect(eiya.isSame(new Eiya(2020, 3, 4), 'date')).toBeTruthy();
      expect(eiya.isSame(new Eiya(2020, 4, 4))).toBeFalsy();
    });
    test('时', () => {
      expect(eiya.isSame(new Eiya(2020, 3, 4, 14), 'hour')).toBeTruthy();
      expect(eiya.isSame(new Eiya(2020, 3, 5, 14), 'hour')).toBeFalsy();
    });
    test('分', () => {
      expect(eiya.isSame(new Eiya(2020, 3, 4, 14, 15), 'minute')).toBeTruthy();
      expect(eiya.isSame(new Eiya(2020, 3, 4, 13, 15), 'minute')).toBeFalsy();
    });
    test('秒', () => {
      expect(eiya.isSame(new Eiya(2020, 3, 4, 14, 15, 16), 'second')).toBeTruthy();
      expect(eiya.isSame(new Eiya(2020, 3, 4, 14, 13, 16), 'second')).toBeFalsy();
    });
    test('毫秒', () => {
      expect(eiya.isSame(new Eiya(2020, 3, 4, 14, 15, 16, 348))).toBeTruthy();
      expect(eiya.isSame(new Eiya(2020, 3, 4, 14, 15, 18, 348))).toBeFalsy();
    });
  });

  describe('isBetween', () => {
    const eiya = new Eiya(2020, 3, 4, 14, 15, 16, 348);
    test('年', () => {
      expect(eiya.isBetween(new Eiya(2019, 0, 1), new Eiya(2021, 3, 4), 'year')).toBeTruthy();
      expect(
        eiya.isBetween(new Eiya(2019, 0, 1), new Eiya(2020, 3, 4), {
          precision: 'year',
          left: 'open',
          right: 'close',
        }),
      ).toBeTruthy();
      expect(
        eiya.isBetween(new Eiya(2020, 0, 1), new Eiya(2020, 3, 4), {
          precision: 'year',
          left: 'close',
          right: 'close',
        }),
      ).toBeTruthy();
    });
    test('月', () => {
      expect(eiya.isBetween(new Eiya(2019, 6, 1), new Eiya(2021, 3, 4), 'month')).toBeTruthy();
      expect(
        eiya.isBetween(new Eiya(2019, 6, 1), new Eiya(2021, 3, 4), {
          precision: 'month',
          easy: true,
        }),
      ).toBeFalsy();
    });
    test('日', () => {
      expect(eiya.isBetween(new Eiya(2019, 4, 1), new Eiya(2021, 3, 4), 'date')).toBeTruthy();
      expect(
        eiya.isBetween(new Eiya(2020, 3, 4), new Eiya(2021, 3, 4), {
          precision: 'date',
          left: 'open',
        }),
      ).toBeFalsy();
    });
    test('时', () => {
      expect(eiya.isBetween(new Eiya(2019, 3, 4, 14), new Eiya(2020, 3, 4, 13), 'hour')).toBeFalsy();
    });
    test('分', () => {
      expect(
        eiya.isBetween(new Eiya(2020, 3, 4, 14, 15), new Eiya(2020, 3, 4, 14, 15), {
          precision: 'minute',
          right: 'open',
        }),
      ).toBeFalsy();
    });
  });

  describe('isAfter', () => {
    const eiya = new Eiya(2020, 3, 4, 14, 15, 16, 348);
    test('年', () => {
      expect(eiya.isAfter(new Eiya(2019, 0, 1), 'year')).toBeTruthy();
      expect(eiya.isAfter(new Eiya(2020, 0, 1), { precision: 'year', self: true })).toBeTruthy();
      expect(eiya.isAfter(new Eiya(2020, 0, 1), { precision: 'year', self: false })).toBeFalsy();
    });
    test('月', () => {
      expect(eiya.isAfter(new Eiya(2019, 4, 1), 'month')).toBeTruthy();
      expect(eiya.isAfter(new Eiya(2019, 4, 1), { precision: 'month', easy: true })).toBeFalsy();
    });
  });
  describe('isBefore', () => {
    const eiya = new Eiya(2020, 3, 4, 14, 15, 16, 348);
    test('年', () => {
      expect(eiya.isBefore(new Eiya(2021, 0, 1), 'year')).toBeTruthy();
      expect(eiya.isBefore(new Eiya(2020, 0, 1), { precision: 'year', self: true })).toBeTruthy();
      expect(eiya.isBefore(new Eiya(2020, 0, 1), { precision: 'year', self: false })).toBeFalsy();
    });
    test('月', () => {
      expect(eiya.isBefore(new Eiya(2020, 4, 1), 'month')).toBeTruthy();
      expect(eiya.isBefore(new Eiya(2019, 2, 1), { precision: 'month', easy: true })).toBeFalsy();
    });
  });

  describe('add', () => {
    const eiya = new Eiya(2020, 2, 31, 14, 15, 16, 348);
    test('年', () => {
      expect(eiya.add(1, 'year').format('yyyy')).toBe('2021');
    });
    test('月', () => {
      expect(eiya.add(1, 'month').format('yyyyMM')).toBe('202004');
      expect(eiya.add(1, { precision: 'month', end: false, overstep: true }).format('yyyyMMdd')).toBe('20200501');
      expect(eiya.add(1, { precision: 'month', end: true }).format('yyyyMMdd')).toBe('20200430');
      expect(new Eiya(2020, 1, 29).add(1, 'month').format('yyyyMMdd')).toBe('20200331');
    });
    test('日', () => {
      expect(eiya.add(1, 'date').format('yyyyMMdd')).toBe('20200401');
    });
    test('时', () => {
      expect(eiya.add(1, 'hour').format('yyyyMMdd HH')).toBe('20200331 15');
    });
    test('分', () => {
      expect(eiya.add(50, 'minute').format('yyyyMMdd HH:mm')).toBe('20200331 15:05');
    });
    test('秒', () => {
      expect(eiya.add(50, 'second').format('yyyyMMdd HH:mm:ss')).toBe('20200331 14:16:06');
    });
    test('毫秒', () => {
      expect(eiya.add(900, 'millisecond').format('yyyyMMdd HH:mm:ss SSS')).toBe('20200331 14:15:17 248');
    });
  });
  describe('subtract', () => {
    const eiya = new Eiya(2021, 1, 28, 14, 15, 16, 348);
    test('年', () => {
      expect(eiya.subtract(1, 'year').format('yyyyMMdd')).toBe('20200229');
    });
    test('周', () => {
      expect(eiya.subtract(1, 'week').format('yyyyMMdd')).toBe('20210221');
    });
  });

  describe('startOf', () => {
    const eiya = new Eiya(2020, 2, 31, 14, 15, 16, 348);
    test('年', () => expect(eiya.startOf('year').format('yyyyMMdd HHmmss SSS')).toBe('20200101 000000 000'));
    test('月', () => expect(eiya.startOf('month').format('yyyyMMdd HHmmss SSS')).toBe('20200301 000000 000'));
    test('日', () => expect(eiya.startOf('date').format('yyyyMMdd HHmmss SSS')).toBe('20200331 000000 000'));
    test('时', () => expect(eiya.startOf('hour').format('yyyyMMdd HHmmss SSS')).toBe('20200331 140000 000'));
    test('分', () => expect(eiya.startOf('minute').format('yyyyMMdd HHmmss SSS')).toBe('20200331 141500 000'));
    test('秒', () => expect(eiya.startOf('second').format('yyyyMMdd HHmmss SSS')).toBe('20200331 141516 000'));
    test('周', () => expect(eiya.startOf('week').format('yyyyMMdd HHmmss SSS')).toBe('20200329 000000 000'));
  });

  describe('endOf', () => {
    const eiya = new Eiya(2020, 2, 30, 14, 15, 16, 348);
    test('年', () => expect(eiya.endOf('year').format('yyyyMMdd HHmmss SSS')).toBe('20201231 235959 999'));
    test('月', () => expect(eiya.endOf('month').format('yyyyMMdd HHmmss SSS')).toBe('20200331 235959 999'));
    test('日', () => expect(eiya.endOf('date').format('yyyyMMdd HHmmss SSS')).toBe('20200330 235959 999'));
    test('时', () => expect(eiya.endOf('hour').format('yyyyMMdd HHmmss SSS')).toBe('20200330 145959 999'));
    test('分', () => expect(eiya.endOf('minute').format('yyyyMMdd HHmmss SSS')).toBe('20200330 141559 999'));
    test('秒', () => expect(eiya.endOf('second').format('yyyyMMdd HHmmss SSS')).toBe('20200330 141516 999'));
    test('周', () => expect(eiya.endOf('week').format('yyyyMMdd HHmmss SSS')).toBe('20200404 235959 999'));
  });

  describe('clone', () => {
    const eiya = new Eiya(2020, 2, 20, 14, 15, 16, 348);
    test('克隆', () => expect(eiya.clone().format('yyyyMMdd HHmmss SSS')).toBe('20200320 141516 348'));
  });

  describe('compare', () => {
    const eiya = new Eiya(2020, 2, 20, 14, 15, 16, 348);
    test('小于', () => expect(eiya.compare(new Eiya(2020, 2, 21, 14, 15, 16, 348))).toBe(-1));
    test('相等', () => expect(eiya.compare(new Eiya(2020, 2, 21, 14, 15, 16, 348), 'month')).toBe(0));
    test('小于', () => expect(eiya.compare(new Eiya(2020, 2, 19, 14, 15, 16, 348))).toBe(1));
  });
});

describe('异常', () => {
  test('y不支持1位或者3位', () => {
    let date = new Eiya(2020, 9, 4, 12, 34, 55, 234);
    expect(() => date.format('yyy/MM/dd HH:mm:ss SSS')).toThrow('非法格式字符串: y不支持1位或者3位');
  });
  test('日期字符串和格式字符串不匹配', () => {
    expect(() => Eiya.parse('2020/10/04 09:34:55', 'yyyy/MM/dd HH:mm:ss SSS')).toThrow('日期字符串和格式字符串不匹配');
  });
  test('H不能和h同时存在', () => {
    expect(() => Eiya.parse('2020/10/04 09:34:55', 'yyyy/MM/dd HH:hh:ss')).toThrow(
      '非法格式字符串: H不能和h,a同时存在',
    );
  });
  test('H不能和a同时存在', () => {
    expect(() => Eiya.parse('2020/10/04 09:34:55 pm', 'yyyy/MM/dd HH:mm:ss a')).toThrow(
      '非法格式字符串: H不能和h,a同时存在',
    );
  });
  test('h和a必须成对出现', () => {
    expect(() => Eiya.parse('2020/10/04 09:34:55', 'yyyy/MM/dd hh:mm:ss')).toThrow('非法格式字符串: h和a必须成对出现');
  });
  test('小时超大', () => {
    expect(() => Eiya.parse('2020/10/04 29:34:55', 'yyyy/MM/dd HH:mm:ss')).toThrow('非法日期字符串');
  });
  test('星期不匹配', () => {
    expect(() => Eiya.parse('2020/10/04 12:34:55 Mon', 'yyyy/MM/dd HH:mm:ss EEE')).toThrow('非法日期字符串');
  });
  test('add 精度不存在', () => {
    expect(() => new Eiya().add(1, 'minutes')).toThrow('not valid precision');
  });
  test('startOf/endOf 精度不支持毫秒', () => {
    expect(() => new Eiya().startOf('millisecond')).toThrow('错误的精度');
    expect(() => new Eiya().endOf('millisecond')).toThrow('错误的精度');
  });
});
