import { getGreetingByHour } from '../greetingUtils';

describe('getGreetingByHour', () => {
  describe('morning (5:00 - 11:59)', () => {
    it('returns "Good morning" at 5:00', () => {
      expect(getGreetingByHour(5)).toBe('Good morning');
    });

    it('returns "Good morning" at 8:00', () => {
      expect(getGreetingByHour(8)).toBe('Good morning');
    });

    it('returns "Good morning" at 11:00', () => {
      expect(getGreetingByHour(11)).toBe('Good morning');
    });
  });

  describe('afternoon (12:00 - 16:59)', () => {
    it('returns "Good afternoon" at 12:00', () => {
      expect(getGreetingByHour(12)).toBe('Good afternoon');
    });

    it('returns "Good afternoon" at 14:00', () => {
      expect(getGreetingByHour(14)).toBe('Good afternoon');
    });

    it('returns "Good afternoon" at 16:00', () => {
      expect(getGreetingByHour(16)).toBe('Good afternoon');
    });
  });

  describe('evening (17:00 - 20:59)', () => {
    it('returns "Good evening" at 17:00', () => {
      expect(getGreetingByHour(17)).toBe('Good evening');
    });

    it('returns "Good evening" at 19:00', () => {
      expect(getGreetingByHour(19)).toBe('Good evening');
    });

    it('returns "Good evening" at 20:00', () => {
      expect(getGreetingByHour(20)).toBe('Good evening');
    });
  });

  describe('night (21:00 - 4:59)', () => {
    it('returns "Good night" at 21:00', () => {
      expect(getGreetingByHour(21)).toBe('Good night');
    });

    it('returns "Good night" at 23:00', () => {
      expect(getGreetingByHour(23)).toBe('Good night');
    });

    it('returns "Good night" at midnight (0:00)', () => {
      expect(getGreetingByHour(0)).toBe('Good night');
    });

    it('returns "Good night" at 3:00', () => {
      expect(getGreetingByHour(3)).toBe('Good night');
    });

    it('returns "Good night" at 4:00', () => {
      expect(getGreetingByHour(4)).toBe('Good night');
    });
  });

  describe('boundary conditions', () => {
    it('returns "Good night" at 4:59 (just before morning)', () => {
      expect(getGreetingByHour(4)).toBe('Good night');
    });

    it('returns "Good morning" at 5:00 (start of morning)', () => {
      expect(getGreetingByHour(5)).toBe('Good morning');
    });

    it('returns "Good morning" at 11:59 (end of morning)', () => {
      expect(getGreetingByHour(11)).toBe('Good morning');
    });

    it('returns "Good afternoon" at 12:00 (start of afternoon)', () => {
      expect(getGreetingByHour(12)).toBe('Good afternoon');
    });

    it('returns "Good afternoon" at 16:59 (end of afternoon)', () => {
      expect(getGreetingByHour(16)).toBe('Good afternoon');
    });

    it('returns "Good evening" at 17:00 (start of evening)', () => {
      expect(getGreetingByHour(17)).toBe('Good evening');
    });

    it('returns "Good evening" at 20:59 (end of evening)', () => {
      expect(getGreetingByHour(20)).toBe('Good evening');
    });

    it('returns "Good night" at 21:00 (start of night)', () => {
      expect(getGreetingByHour(21)).toBe('Good night');
    });
  });
});
