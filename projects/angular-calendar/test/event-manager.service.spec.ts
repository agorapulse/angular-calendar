import { expect } from 'chai';
import type { CalendarEvent } from 'calendar-utils';
import { adapterFactory } from '../src/date-adapters/date-fns';
import { EventManagerService } from '../src/modules/services/event-manager.service';

describe('EventManagerService', () => {
  let service: EventManagerService;

  beforeEach(() => {
    const dateAdapter = adapterFactory();
    service = new EventManagerService(dateAdapter);
  });

  function makeEvent(start: Date, end: Date, title = 'test'): CalendarEvent {
    return { start, end, title, meta: {} };
  }

  /** Helper: build a week of 7 consecutive days from UTC timestamps */
  function makeWeek(dates: Date[]): Date[] {
    return dates;
  }

  /** Helper: a simple week with no DST (all days at T00:00:00Z) */
  function simpleWeek(): Date[] {
    return [
      new Date('2026-06-01T00:00:00Z'), // Mon
      new Date('2026-06-02T00:00:00Z'),
      new Date('2026-06-03T00:00:00Z'),
      new Date('2026-06-04T00:00:00Z'),
      new Date('2026-06-05T00:00:00Z'),
      new Date('2026-06-06T00:00:00Z'),
      new Date('2026-06-07T00:00:00Z'), // Sun
    ];
  }

  describe('eventsOnWeek', () => {
    it('should include an event fully within the week', () => {
      const week = simpleWeek();
      const event = makeEvent(
        new Date('2026-06-03T00:00:00Z'),
        new Date('2026-06-05T00:00:00Z')
      );
      const result = service.eventsOnWeek([event], week);
      expect(result).to.have.length(1);
    });

    it('should exclude an event entirely before the week', () => {
      const week = simpleWeek();
      const event = makeEvent(
        new Date('2026-05-25T00:00:00Z'),
        new Date('2026-05-27T00:00:00Z')
      );
      const result = service.eventsOnWeek([event], week);
      expect(result).to.have.length(0);
    });

    it('should exclude an event entirely after the week', () => {
      const week = simpleWeek();
      const event = makeEvent(
        new Date('2026-06-10T00:00:00Z'),
        new Date('2026-06-12T00:00:00Z')
      );
      const result = service.eventsOnWeek([event], week);
      expect(result).to.have.length(0);
    });

    it('should include an event that starts before and ends within the week', () => {
      const week = simpleWeek();
      const event = makeEvent(
        new Date('2026-05-30T00:00:00Z'),
        new Date('2026-06-03T00:00:00Z')
      );
      const result = service.eventsOnWeek([event], week);
      expect(result).to.have.length(1);
    });

    it('should include an event that starts within and ends after the week', () => {
      const week = simpleWeek();
      const event = makeEvent(
        new Date('2026-06-05T00:00:00Z'),
        new Date('2026-06-10T00:00:00Z')
      );
      const result = service.eventsOnWeek([event], week);
      expect(result).to.have.length(1);
    });

    it('should include an event that spans the entire week', () => {
      const week = simpleWeek();
      const event = makeEvent(
        new Date('2026-05-28T00:00:00Z'),
        new Date('2026-06-10T00:00:00Z')
      );
      const result = service.eventsOnWeek([event], week);
      expect(result).to.have.length(1);
    });

    it('should include an event ending exactly on the last day of the week', () => {
      const week = simpleWeek();
      const event = makeEvent(
        new Date('2026-05-28T00:00:00Z'),
        new Date('2026-06-07T00:00:00Z') // last day of week
      );
      const result = service.eventsOnWeek([event], week);
      expect(result).to.have.length(1);
    });

    describe('DST boundary (Europe/Paris CET→CEST)', () => {
      // Europe/Paris DST change: March 29 2026
      // Before DST: midnight = T23:00:00Z (UTC+1)
      // After DST:  midnight = T22:00:00Z (UTC+2)

      function dstWeekSundayStart(): Date[] {
        return makeWeek([
          new Date('2026-03-28T23:00:00Z'), // Sun Mar 29 (CET, last day before DST)
          new Date('2026-03-29T22:00:00Z'), // Mon Mar 30 (CEST)
          new Date('2026-03-30T22:00:00Z'), // Tue Mar 31
          new Date('2026-03-31T22:00:00Z'), // Wed Apr 1
          new Date('2026-04-01T22:00:00Z'), // Thu Apr 2
          new Date('2026-04-02T22:00:00Z'), // Fri Apr 3
          new Date('2026-04-03T22:00:00Z'), // Sat Apr 4
        ]);
      }

      it('should include a note that spans across the DST day when it is the first day of the week', () => {
        // Week starts on Sunday March 29 (DST day: CET→CEST).
        // The DST shift changes midnight UTC offsets (T23:00Z → T22:00Z),
        // which caused nextDayStart === weekEnd, making the strict > comparison fail.
        const week = dstWeekSundayStart();
        const event = makeEvent(
          new Date('2026-03-25T23:00:00Z'), // Mar 26 midnight CET (before DST day)
          new Date('2026-04-03T22:00:00Z') // Apr 4 midnight CEST (after DST day)
        );
        const result = service.eventsOnWeek([event], week);
        expect(result).to.have.length(1);
      });

      it('should include a note spanning the entire DST-crossing week', () => {
        const week = dstWeekSundayStart();
        const event = makeEvent(
          new Date('2026-03-20T23:00:00Z'), // well before week
          new Date('2026-04-10T22:00:00Z') // well after week
        );
        const result = service.eventsOnWeek([event], week);
        expect(result).to.have.length(1);
      });

      it('should include a note starting before and ending mid DST-crossing week', () => {
        const week = dstWeekSundayStart();
        const event = makeEvent(
          new Date('2026-03-25T23:00:00Z'), // before week
          new Date('2026-04-01T22:00:00Z') // Apr 2 CEST, mid-week
        );
        const result = service.eventsOnWeek([event], week);
        expect(result).to.have.length(1);
      });
    });
  });

  describe('eventsPerDayOnWeek', () => {
    it('should distribute a multi-day event across all its days', () => {
      const week = simpleWeek();
      // Event spans days 2-4 (Wed-Fri)
      const event = makeEvent(
        new Date('2026-06-03T00:00:00Z'),
        new Date('2026-06-05T00:00:00Z')
      );
      const result = service.eventsPerDayOnWeek([event], week);

      expect(result[0]).to.have.length(0); // Mon
      expect(result[1]).to.have.length(0); // Tue
      expect(result[2]).to.have.length(1); // Wed (start)
      expect(result[3]).to.have.length(1); // Thu
      expect(result[4]).to.have.length(1); // Fri (end)
      expect(result[5]).to.have.length(0); // Sat
      expect(result[6]).to.have.length(0); // Sun
    });

    it('should return empty days for an event outside the week', () => {
      const week = simpleWeek();
      const event = makeEvent(
        new Date('2026-06-10T00:00:00Z'),
        new Date('2026-06-12T00:00:00Z')
      );
      const result = service.eventsPerDayOnWeek([event], week);

      for (let i = 0; i < 7; i++) {
        expect(result[i]).to.have.length(0);
      }
    });

    it('should populate all days for a DST-crossing week when note ends on last day', () => {
      const week = [
        new Date('2026-03-28T23:00:00Z'),
        new Date('2026-03-29T22:00:00Z'),
        new Date('2026-03-30T22:00:00Z'),
        new Date('2026-03-31T22:00:00Z'),
        new Date('2026-04-01T22:00:00Z'),
        new Date('2026-04-02T22:00:00Z'),
        new Date('2026-04-03T22:00:00Z'),
      ];
      const event = makeEvent(
        new Date('2026-03-25T23:00:00Z'),
        new Date('2026-04-03T22:00:00Z')
      );
      const result = service.eventsPerDayOnWeek([event], week);

      for (let i = 0; i < 7; i++) {
        expect(result[i]).to.have.length(1, `expected note on day index ${i}`);
      }
    });
  });

  describe('eventPositionOnWeek', () => {
    it('should return correct start and length for an event within the week', () => {
      const week = simpleWeek();
      const event = makeEvent(
        new Date('2026-06-03T00:00:00Z'), // index 2
        new Date('2026-06-05T00:00:00Z') // index 4, nextDay=index 5
      );
      const pos = service.eventPositionOnWeek(event, week);
      expect(pos.start).to.equal(2);
      expect(pos.length).to.equal(3); // Wed, Thu, Fri
    });

    it('should start at 0 when event starts before the week', () => {
      const week = simpleWeek();
      const event = makeEvent(
        new Date('2026-05-28T00:00:00Z'), // before week
        new Date('2026-06-03T00:00:00Z') // index 2, nextDay=index 3
      );
      const pos = service.eventPositionOnWeek(event, week);
      expect(pos.start).to.equal(0);
      expect(pos.length).to.equal(3); // Mon, Tue, Wed
    });

    it('should extend to week end when event ends after the week', () => {
      const week = simpleWeek();
      const event = makeEvent(
        new Date('2026-06-05T00:00:00Z'), // index 4
        new Date('2026-06-12T00:00:00Z') // after week
      );
      const pos = service.eventPositionOnWeek(event, week);
      expect(pos.start).to.equal(4);
      expect(pos.length).to.equal(3); // Fri, Sat, Sun
    });

    it('should span the full week when event starts before and ends after', () => {
      const week = simpleWeek();
      const event = makeEvent(
        new Date('2026-05-28T00:00:00Z'),
        new Date('2026-06-12T00:00:00Z')
      );
      const pos = service.eventPositionOnWeek(event, week);
      expect(pos.start).to.equal(0);
      expect(pos.length).to.equal(7);
    });
  });
});
