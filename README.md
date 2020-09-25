# Eiya

一个日期常用处理方法的集合，包括格式化，解析，加减，比较等方法



## install

```bash
$ yarn add eiya
```

or

```bash
$ npm install eiya
```



## usage

```js
import Eiya from 'eiya'; //或者安装后直接通过script脚本引用dist目录下编译后的文件

// 实例链式调用
const date = new Eiya();
date.add(1, 'year').subtract('1', 'month').startOf('date');

// 静态方法使用
const now = new Eiya();
Eiya.startOf(now, 'date');
```



## api

### 静态方法

>  Eiya.format(date, fmt)

- 概述

  格式化日期到指定格式字符串形式

- 参数

  @param {Date} date 被格式化的日期对象

  @param {String} fmt 格式化字符串, 支持的格式请参考[格式说明](#格式说明)

- 示例

  ```javascript
  Eiya.format(new Date(2020, 10, 10, 12, 14, 45, 453), 'yyyy/MM/dd HH:mm:ss SSS');
  // 2020/11/10 12:14:45 453
  ```

> Eiya.parse(str, fmt)

 - 概述

   将指定格式的日期字符串解析成日期对象

- 参数

  @param {String} str 表示日期的字符串

  @param {String} fmt 日期字符串的格式

- 示例

  ```js
  Eiya.parse('2020/11/10 12:14:45 453', 'yyyy/MM/dd HH:mm:ss SSS')
  // 2020-11-10T04:14:45.453Z  这是0时区表示时间，所以小时差了8小时
  ```

> Eiya.isLeapYear(year)

 - 概述

   判断指定年份是否是闰年

- 参数

  @param {Number} year 需要判断的年份

- 示例

  ```js
  Eiya.isLeapYear(2020) // true
  ```

> Eiya.daysInMonth(year, month)

 - 概述

   判断指定月份有多少天

- 参数

  @param {Number} year 年份，用于判断是否是闰年

  @param {Number} month 月份，1月份为0

- 示例

  ```js
  Eiya.daysInMonth(2020, 1) // 29
  ```

> Eiya.isValidDate(year, month, date, hour, minute, second, millisecond)

 - 概述

   判断指定的年月日时分秒毫秒是否是一个真实合法的时间

- 参数

  依次是年，月(从0开始)，日，时，分，秒，毫秒

- 示例

  ```js
  Eiya.isValidDate(2020, 3, 32, 12, 12, 23, 345) // false
  ```

> Eiya.isSame(date1, date2, option)

 - 概述

   判断两个日期是否相同

- 参数

  @param {Date} date1, date2 待比较Date对象

  @option {String, Object} 比较选项设置

  	- option.precision 比较精度，支持year, month, date, hour, minute, second, millisecond, week。默认为millisecond
  	- option.easy 是否只比较设置的精度，不考虑前置时间，如只比较月份而不用考虑年份
  	- option 也可以传字符串，代表option.precision

- 示例

  ```js
  const date1 = new Date(2020, 10, 15);
  const date2 = new Date(2020, 8, 15);
  Eiya.isSame(date1, date2, 'date') // false
  Eiya.isSame(date1, date2, {precision: 'date', easy: true}) // true
  ```

> Eiya.isBetween(date, start, end, option)

 - 概述

   判断date是否处于start，end之间

- 参数

  @param {Date} date, start, end 分别是被判断时间，区间起始时间，区间结束时间

  @option {String,Object} 比较选项设置

  	- option.precision 同 `Eiya.isSame` 中的设置
   - option.easy 同 `Eiya.isSame` 中的设置
   - option.left  open:区间不包含起始边界， close:区间包含起始边界(默认)
   - option.right open:区间不包含结束边界， close:区间包含结束边界(默认)

- 示例

  ```js
  const date = new Date(2020, 10, 15);
  const start = new Date(2020, 10, 15);
  const end = new Date(2020, 11, 15);
  Eiya.isBetween(date, start, end, 'date') // true
  Eiya.isBetween(date, start, end, {precision: 'date', left: 'open'}) // false
  ```

> Eiya.isAfter(date, target, option)

 - 概述

   判断date日期是否在target日期以后

- 参数

  @param {Date} date, target 比较的日期对象

  @param option 参数同 `Eiya.isSame` 支持 precision, easy, self

  	- option.self 表示是否包含target日期

> Eiya.isBefore(date, target, option)

 - 概述

   判断date日期是否在target日期以前。其余同 `Eiya.isAfter`

> Eiya.add(date, addend, option)

 - 概述

   对date日期进行加法运算

- 参数

  @param {Date} date 被运算的日期对象

  @param {Number} addend 增量

  @param {String, Object} option 运算选项设置

  	- option.precision 需要在哪个单位上进行加运算，支持 year, month, date, hour, minute, second, millisecond, week
  	- option.end 是否月末对齐
  	- option.overstep 超过月份最大日期，是否跨到下一月

- 示例

  ```js
  const date = new Date(2020, 1, 29, 12, 23, 24, 456);
  Eiya.add(date, 1, 'year') // 2021-02-28T04:23:24.456Z
  Eiya.add(date, 1, {precision: 'year', end: false, overstep: true}) //2021-03-01T04:23:24.456Z
  Eiya.add(date, 1, 'month') //2020-03-31T04:23:24.456Z
  ```

> Eiya.subtract(date, subtrahend, option)

 - 概述

   相当于 `Eiya.add` 方法参数 addend 为负数。其它一致

> Eiya.startOf(date, precision)

 - 概述

   返回日期指定精度的起始时间

- 参数

  @param {Date} date 参考日期对象

  @param {String} precision 支持year, month, date, hour, minute, second, week

- 示例

  ```js
  const date = new Date(2020, 1, 12, 12, 24, 45, 235);
  Eiya.startOf(date, 'year') // 2019-12-31T16:00:00.000Z 转化为当前东八时间，就是2020/01/01 00:00:00 000
  ```

> Eiya.endOf(date, precision)

 - 概述

   返回日期指定精度的最后时刻，其它和 `Eiya.startOf` 相同

- 示例

  ```js
  const date = new Date(2020, 1, 12, 12, 24, 45, 235);
  Eiya.endOf(date, 'year') // 2020-12-31T15:59:59.999Z 转化为当前东八时间，就是2020/12/31 23:59:59.999
  ```

> Eiya.clone(date)

 - 概述

   返回一个和参数日期对象表示相同时间的新日期对象

> Eiya.compare(date1, date2, option)

 - 概述

   在指定精度下，date1如果在date2之前，返回-1， date1和date2相同返回0, date1在date2之后，返回1

- 参数

  option和 `Eiya.isAfter` 有相同的意义

> Eiya.max(option, ...args)

 - 概述

   返回参数日期列表中最大的日期，第一个参数可以是精度设置，支持 `precision` 和 `easy`

> Eiya.min(option, ...args)

 - 概述

   返回参数日期列表中最小的日期，第一个参数可以是精度设置，支持 `precision` 和 `easy` 



### 实例方法

实例方法和方法基本一致，没有，`parse`, `max`, `min` 等方法，实例方法接收的日期参数不仅可以是Date实例对象，还可以是Eiya实例对象。并且操作型的方法，add, subtract, startOf, endOf, clone 支持链式调用



### 格式说明

| 符号 | 说明                                        |
| ---- | ------------------------------------------- |
| yyyy | 完整年份                                    |
| yy   | 19**年的时候返回后两位数字                  |
| M    | 月份                                        |
| d    | 日期                                        |
| H    | 24小时制的小时                              |
| h    | 12小时制的小时, 需要配制am/pm来标记上午下午 |
| m    | 分钟                                        |
| s    | 秒                                          |
| S    | 毫秒                                        |
| E    | 一周中的天数，从0开始，周日为第一天         |
| a    | am/pm                                       |
| A    | AM/PM                                       |

