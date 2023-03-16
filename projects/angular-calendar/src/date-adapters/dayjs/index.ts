import { DateAdapter } from '../date-adapter';
import * as dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';
import minMax from 'dayjs/plugin/minMax';

dayjs.extend(minMax);
dayjs.extend(isoWeek);

export function adapterFactory(): DateAdapter {
  return {
    endOfDay(date: Date | number): Date {
      return dayjs(date).endOf('day').toDate();
    },
    endOfMonth(date: Date | number): Date {
      return dayjs(date).endOf('month').toDate();
    },
    endOfWeek(date: Date | number, options?: { weekStartsOn?: number }): Date {
      return dayjs(date).endOf('week').toDate();
    },
    addDays(date: Date | number, amount: number): Date {
      return dayjs(date).add(amount, 'day').toDate();
    },
    addHours(date: Date | number, amount: number): Date {
      return dayjs(date).add(amount, 'hour').toDate();
    },
    addMinutes(date: Date | number, amount: number): Date {
      return dayjs(date).add(amount, 'minute').toDate();
    },
    addMonths(date: Date | number, amount: number): Date {
      return dayjs(date).add(amount, 'month').toDate();
    },
    addSeconds(date: Date | number, amount: number): Date {
      return dayjs(date).add(amount, 'second').toDate();
    },
    addWeeks(date: Date | number, amount: number): Date {
      return dayjs(date).add(amount, 'week').toDate();
    },
    differenceInDays(
      dateLeft: Date | number,
      dateRight: Date | number
    ): number {
      return dayjs(dateLeft).diff(dayjs(dateRight, 'day'));
    },
    differenceInSeconds(
      dateLeft: Date | number,
      dateRight: Date | number
    ): number {
      return dayjs(dateLeft).diff(dayjs(dateRight, 'second'));
    },
    differenceInMinutes(
      dateLeft: Date | number,
      dateRight: Date | number
    ): number {
      return dayjs(dateLeft).diff(dayjs(dateRight, 'minute'));
    },
    getDate(date: Date | number): number {
      return dayjs(date).date();
    },
    getDay(date: Date | number): number {
      return dayjs(date).day();
    },
    getISOWeek(date: Date | number): number {
      return dayjs(date).isoWeek();
    },
    getMonth(date: Date | number): number {
      return dayjs(date).month();
    },
    getYear(date: Date | number): number {
      return dayjs(date).year();
    },
    isSameDay(dateLeft: Date | number, dateRight: Date | number): boolean {
      return dayjs(dateLeft).isSame(dayjs(dateRight), 'day');
    },
    isSameMonth(dateLeft: Date | number, dateRight: Date | number): boolean {
      return dayjs(dateLeft).isSame(dayjs(dateRight), 'month');
    },
    isSameSecond(dateLeft: Date | number, dateRight: Date | number): boolean {
      return dayjs(dateLeft).isSame(dayjs(dateRight), 'second');
    },
    setDate(date: Date | number, dayOfMonth: number): Date {
      return dayjs(date).set('date', dayOfMonth).toDate();
    },
    setMonth(date: Date | number, month: number): Date {
      return dayjs(date).set('month', month).toDate();
    },
    setYear(date: Date | number, year: number): Date {
      return dayjs(date).set('year', year).toDate();
    },
    subDays(date: Date | number, amount: number): Date {
      return dayjs(date).subtract(amount, 'day').toDate();
    },
    subMonths(date: Date | number, amount: number): Date {
      return dayjs(date).subtract(amount, 'month').toDate();
    },
    subWeeks(date: Date | number, amount: number): Date {
      return dayjs(date).subtract(amount, 'week').toDate();
    },
    getHours(date: Date | number): number {
      return dayjs(date).hour();
    },
    getMinutes(date: Date | number): number {
      return dayjs(date).minute();
    },
    max(dates: (Date | number)[]): Date {
      const dayjsDates = dates.map((date) => dayjs(date));
      return dayjs.max(...dayjsDates).toDate();
    },
    setHours(date: Date | number, hours: number): Date {
      return dayjs(date).set('hour', hours).toDate();
    },
    setMinutes(date: Date | number, minutes: number): Date {
      return dayjs(date).set('minute', minutes).toDate();
    },
    startOfDay(date: Date | number): Date {
      return dayjs(date).startOf('day').toDate();
    },
    startOfMinute(date: Date | number): Date {
      return dayjs(date).startOf('minute').toDate();
    },
    startOfMonth(date: Date | number): Date {
      return dayjs(date).startOf('month').toDate();
    },
    startOfWeek(
      date: Date | number,
      options?: { weekStartsOn?: number }
    ): Date {
      return dayjs(date).startOf('week').toDate();
    },
    reverseTz(date: Date | number): Date {
      return new Date(date);
    },
    withTimezone(timezone: string): DateAdapter {
      return this;
    },
  };
}
