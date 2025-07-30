import { TestBed } from '@angular/core/testing';
import { Timestamp } from '@angular/fire/firestore';
import { TimestampUtil } from './timestamp.util';

describe('TimestampUtil', () => {
  let mockTimestamp: Timestamp;
  let testDate: Date;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    testDate = new Date('2023-12-25T10:30:00Z');
    
    // Mock Firestore Timestamp
    mockTimestamp = {
      toDate: jasmine.createSpy('toDate').and.returnValue(testDate),
      seconds: Math.floor(testDate.getTime() / 1000),
      nanoseconds: 0
    } as any as Timestamp;
    
    // Make mockTimestamp appear as instanceof Timestamp
    Object.setPrototypeOf(mockTimestamp, Timestamp.prototype);
  });

  describe('isFirestoreTimestamp', () => {
    it('should return true for Firestore Timestamp objects', () => {
      expect(TimestampUtil.isFirestoreTimestamp(mockTimestamp)).toBe(true);
    });

    it('should return false for Date objects', () => {
      expect(TimestampUtil.isFirestoreTimestamp(new Date())).toBe(false);
    });

    it('should return false for null', () => {
      expect(TimestampUtil.isFirestoreTimestamp(null)).toBe(false);
    });

    it('should return false for undefined', () => {
      expect(TimestampUtil.isFirestoreTimestamp(undefined)).toBe(false);
    });

    it('should return false for strings', () => {
      expect(TimestampUtil.isFirestoreTimestamp('2023-12-25')).toBe(false);
    });

    it('should return false for numbers', () => {
      expect(TimestampUtil.isFirestoreTimestamp(1703505000000)).toBe(false);
    });

    it('should return false for plain objects', () => {
      expect(TimestampUtil.isFirestoreTimestamp({})).toBe(false);
    });
  });

  describe('safeTimestampToDate', () => {
    it('should convert Firestore Timestamp to Date', () => {
      const result = TimestampUtil.safeTimestampToDate(mockTimestamp);
      expect(result).toEqual(testDate);
      expect(mockTimestamp.toDate).toHaveBeenCalled();
    });

    it('should return null for null input', () => {
      expect(TimestampUtil.safeTimestampToDate(null)).toBeNull();
    });

    it('should return null for undefined input', () => {
      expect(TimestampUtil.safeTimestampToDate(undefined)).toBeNull();
    });

    it('should return Date object as-is if valid', () => {
      const validDate = new Date('2023-12-25');
      expect(TimestampUtil.safeTimestampToDate(validDate)).toEqual(validDate);
    });

    it('should return null for invalid Date object', () => {
      const invalidDate = new Date('invalid-date');
      expect(TimestampUtil.safeTimestampToDate(invalidDate)).toBeNull();
    });

    it('should convert valid string to Date', () => {
      const dateString = '2023-12-25T10:30:00Z';
      const result = TimestampUtil.safeTimestampToDate(dateString);
      expect(result).toEqual(new Date(dateString));
    });

    it('should convert valid number to Date', () => {
      const timestamp = 1703505000000;
      const result = TimestampUtil.safeTimestampToDate(timestamp);
      expect(result).toEqual(new Date(timestamp));
    });

    it('should return null for invalid string', () => {
      expect(TimestampUtil.safeTimestampToDate('invalid-date')).toBeNull();
    });

    it('should return null for invalid number', () => {
      expect(TimestampUtil.safeTimestampToDate(NaN)).toBeNull();
    });

    it('should return null for other types', () => {
      expect(TimestampUtil.safeTimestampToDate({})).toBeNull();
      expect(TimestampUtil.safeTimestampToDate([])).toBeNull();
      expect(TimestampUtil.safeTimestampToDate(true)).toBeNull();
    });

    it('should handle errors gracefully', () => {
      const faultyTimestamp = {
        toDate: jasmine.createSpy('toDate').and.throwError('Conversion error')
      };
      Object.setPrototypeOf(faultyTimestamp, Timestamp.prototype);
      
      spyOn(console, 'warn');
      const result = TimestampUtil.safeTimestampToDate(faultyTimestamp);
      
      expect(result).toBeNull();
      expect(console.warn).toHaveBeenCalled();
    });
  });

  describe('convertToFirestoreTimestamp', () => {
    beforeEach(() => {
      spyOn(Timestamp, 'fromDate').and.returnValue(mockTimestamp);
    });

    it('should convert valid Date to Firestore Timestamp', () => {
      const result = TimestampUtil.convertToFirestoreTimestamp(testDate);
      expect(Timestamp.fromDate).toHaveBeenCalledWith(testDate);
      expect(result).toBe(mockTimestamp);
    });

    it('should throw error for null date', () => {
      expect(() => TimestampUtil.convertToFirestoreTimestamp(null as any))
        .toThrowError('TimestampUtil: Invalid date provided - must be a Date object');
    });

    it('should throw error for undefined date', () => {
      expect(() => TimestampUtil.convertToFirestoreTimestamp(undefined as any))
        .toThrowError('TimestampUtil: Invalid date provided - must be a Date object');
    });

    it('should throw error for non-Date object', () => {
      expect(() => TimestampUtil.convertToFirestoreTimestamp('2023-12-25' as any))
        .toThrowError('TimestampUtil: Invalid date provided - must be a Date object');
    });

    it('should throw error for invalid Date', () => {
      const invalidDate = new Date('invalid');
      expect(() => TimestampUtil.convertToFirestoreTimestamp(invalidDate))
        .toThrowError('TimestampUtil: Invalid date provided - date is not valid');
    });

    it('should handle Timestamp.fromDate errors', () => {
      (Timestamp.fromDate as jasmine.Spy).and.throwError('Firestore error');
      spyOn(console, 'error');
      
      expect(() => TimestampUtil.convertToFirestoreTimestamp(testDate))
        .toThrowError('Firestore error');
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('convertTimestampFieldsRecursively', () => {
    it('should return null for null input', () => {
      expect(TimestampUtil.convertTimestampFieldsRecursively(null)).toBe(null);
    });

    it('should return undefined for undefined input', () => {
      expect(TimestampUtil.convertTimestampFieldsRecursively(undefined)).toBe(undefined);
    });

    it('should convert Firestore Timestamp to Date', () => {
      const result = TimestampUtil.convertTimestampFieldsRecursively(mockTimestamp);
      expect(result).toEqual(testDate);
    });

    it('should handle arrays with timestamps', () => {
      const input = [mockTimestamp, 'string', 123];
      const result = TimestampUtil.convertTimestampFieldsRecursively(input);
      expect(result).toEqual([testDate, 'string', 123]);
    });

    it('should handle nested objects with timestamps', () => {
      const input = {
        createdAt: mockTimestamp,
        name: 'test',
        nested: {
          updatedAt: mockTimestamp,
          value: 42
        }
      };
      const result = TimestampUtil.convertTimestampFieldsRecursively(input);
      expect(result).toEqual({
        createdAt: testDate,
        name: 'test',
        nested: {
          updatedAt: testDate,
          value: 42
        }
      });
    });

    it('should handle arrays of objects with timestamps', () => {
      const input = [
        { createdAt: mockTimestamp, name: 'item1' },
        { createdAt: mockTimestamp, name: 'item2' }
      ];
      const result = TimestampUtil.convertTimestampFieldsRecursively(input);
      expect(result).toEqual([
        { createdAt: testDate, name: 'item1' },
        { createdAt: testDate, name: 'item2' }
      ]);
    });

    it('should return primitive values as-is', () => {
      expect(TimestampUtil.convertTimestampFieldsRecursively('string')).toBe('string');
      expect(TimestampUtil.convertTimestampFieldsRecursively(123)).toBe(123);
      expect(TimestampUtil.convertTimestampFieldsRecursively(true)).toBe(true);
    });

    it('should return Date objects as-is', () => {
      expect(TimestampUtil.convertTimestampFieldsRecursively(testDate)).toBe(testDate);
    });

    it('should handle complex nested structures', () => {
      const input = {
        level1: {
          level2: {
            level3: {
              timestamp: mockTimestamp,
              array: [mockTimestamp, { nested: mockTimestamp }]
            }
          }
        }
      };
      const result = TimestampUtil.convertTimestampFieldsRecursively(input);
      expect(result.level1.level2.level3.timestamp).toEqual(testDate);
      expect(result.level1.level2.level3.array[0]).toEqual(testDate);
      expect(result.level1.level2.level3.array[1].nested).toEqual(testDate);
    });
  });

  describe('convertFirestoreDocument', () => {
    it('should convert document with timestamps', () => {
      const input = {
        id: '123',
        name: 'test',
        createdAt: mockTimestamp,
        updatedAt: mockTimestamp
      };
      const result = TimestampUtil.convertFirestoreDocument(input);
      expect(result).toEqual({
        id: '123',
        name: 'test',
        createdAt: testDate,
        updatedAt: testDate
      });
    });

    it('should return non-object data as-is', () => {
      expect(TimestampUtil.convertFirestoreDocument('string')).toBe('string');
      expect(TimestampUtil.convertFirestoreDocument(123)).toBe(123);
      expect(TimestampUtil.convertFirestoreDocument(null)).toBe(null);
    });

    it('should handle errors gracefully', () => {
      spyOn(TimestampUtil, 'convertTimestampFieldsRecursively').and.throwError('Test error');
      spyOn(console, 'error');
      
      const input = { test: 'data' };
      const result = TimestampUtil.convertFirestoreDocument(input);
      
      expect(result).toBe(input);
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('convertFirestoreArray', () => {
    it('should convert array of documents', () => {
      const input = [
        { name: 'item1', createdAt: mockTimestamp },
        { name: 'item2', createdAt: mockTimestamp }
      ];
      const result = TimestampUtil.convertFirestoreArray(input);
      expect(result).toEqual([
        { name: 'item1', createdAt: testDate },
        { name: 'item2', createdAt: testDate }
      ]);
    });

    it('should return empty array for non-array input', () => {
      spyOn(console, 'warn');
      expect(TimestampUtil.convertFirestoreArray('not an array' as any)).toEqual([]);
      expect(console.warn).toHaveBeenCalled();
    });

    it('should handle errors gracefully', () => {
      spyOn(TimestampUtil, 'convertFirestoreDocument').and.throwError('Test error');
      spyOn(console, 'error');
      
      const result = TimestampUtil.convertFirestoreArray([{ test: 'data' }]);
      
      expect(result).toEqual([]);
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('convertDatesToTimestamps', () => {
    beforeEach(() => {
      spyOn(TimestampUtil, 'convertToFirestoreTimestamp').and.returnValue(mockTimestamp);
    });

    it('should return null for null input', () => {
      expect(TimestampUtil.convertDatesToTimestamps(null)).toBe(null);
    });

    it('should return undefined for undefined input', () => {
      expect(TimestampUtil.convertDatesToTimestamps(undefined)).toBe(undefined);
    });

    it('should convert Date to Firestore Timestamp', () => {
      const result = TimestampUtil.convertDatesToTimestamps(testDate);
      expect(TimestampUtil.convertToFirestoreTimestamp).toHaveBeenCalledWith(testDate);
      expect(result).toBe(mockTimestamp);
    });

    it('should handle arrays with dates', () => {
      const input = [testDate, 'string', 123];
      const result = TimestampUtil.convertDatesToTimestamps(input);
      expect(result).toEqual([mockTimestamp, 'string', 123]);
    });

    it('should handle objects with dates', () => {
      const input = {
        createdAt: testDate,
        name: 'test',
        value: 42
      };
      const result = TimestampUtil.convertDatesToTimestamps(input);
      expect(result).toEqual({
        createdAt: mockTimestamp,
        name: 'test',
        value: 42
      });
    });

    it('should return primitive values as-is', () => {
      expect(TimestampUtil.convertDatesToTimestamps('string')).toBe('string');
      expect(TimestampUtil.convertDatesToTimestamps(123)).toBe(123);
      expect(TimestampUtil.convertDatesToTimestamps(true)).toBe(true);
    });

    it('should handle invalid dates gracefully', () => {
      (TimestampUtil.convertToFirestoreTimestamp as jasmine.Spy).and.throwError('Invalid date');
      spyOn(console, 'warn');
      
      const invalidDate = new Date('invalid');
      const result = TimestampUtil.convertDatesToTimestamps(invalidDate);
      
      expect(result).toBe(invalidDate);
      expect(console.warn).toHaveBeenCalled();
    });

    it('should handle nested structures', () => {
      const input = {
        user: {
          profile: {
            createdAt: testDate,
            settings: {
              lastLogin: testDate
            }
          }
        },
        items: [
          { date: testDate, name: 'item1' }
        ]
      };
      
      const result = TimestampUtil.convertDatesToTimestamps(input);
      expect(result.user.profile.createdAt).toBe(mockTimestamp);
      expect(result.user.profile.settings.lastLogin).toBe(mockTimestamp);
      expect(result.items[0].date).toBe(mockTimestamp);
    });
  });

  describe('prepareForFirestore', () => {
    it('should prepare data for Firestore', () => {
      const input = {
        name: 'test',
        createdAt: testDate,
        nested: {
          updatedAt: testDate
        }
      };
      
      spyOn(TimestampUtil, 'convertDatesToTimestamps').and.returnValue('converted');
      const result = TimestampUtil.prepareForFirestore(input);
      
      expect(TimestampUtil.convertDatesToTimestamps).toHaveBeenCalledWith(input);
      expect(result).toBe('converted');
    });

    it('should handle errors and rethrow them', () => {
      spyOn(TimestampUtil, 'convertDatesToTimestamps').and.throwError('Conversion error');
      spyOn(console, 'error');
      
      expect(() => TimestampUtil.prepareForFirestore({ test: 'data' }))
        .toThrowError('Conversion error');
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('Edge Cases and Integration', () => {
    it('should handle empty objects', () => {
      expect(TimestampUtil.convertFirestoreDocument({})).toEqual({});
      expect(TimestampUtil.convertDatesToTimestamps({})).toEqual({});
    });

    it('should handle empty arrays', () => {
      expect(TimestampUtil.convertFirestoreArray([])).toEqual([]);
      expect(TimestampUtil.convertDatesToTimestamps([])).toEqual([]);
    });

    it('should handle mixed data types in arrays', () => {
      const input = [
        mockTimestamp,
        testDate,
        'string',
        123,
        null,
        undefined,
        { nested: mockTimestamp }
      ];
      
      const result = TimestampUtil.convertTimestampFieldsRecursively(input);
      expect(result[0]).toEqual(testDate); // Timestamp converted
      expect(result[1]).toEqual(testDate); // Date unchanged
      expect(result[2]).toBe('string');
      expect(result[3]).toBe(123);
      expect(result[4]).toBe(null);
      expect(result[5]).toBe(undefined);
      expect(result[6].nested).toEqual(testDate);
    });

    it('should handle circular references safely without stack overflow', () => {
      const obj: any = { name: 'test' };
      obj.self = obj; // Create circular reference
      
      spyOn(console, 'warn');
      
      // Should not throw stack overflow error with circular reference protection
      const result = TimestampUtil.convertTimestampFieldsRecursively(obj);
      
      expect(result.name).toBe('test');
      expect(result.self).toBe('[Circular Reference]');
      expect(console.warn).toHaveBeenCalledWith(
        'TimestampUtil: Circular reference detected in object, skipping to prevent stack overflow'
      );
    });

    it('should handle circular references in arrays safely', () => {
      const arr: any[] = ['test'];
      arr.push(arr); // Create circular reference in array
      
      spyOn(console, 'warn');
      
      const result = TimestampUtil.convertTimestampFieldsRecursively(arr);
      
      expect(result[0]).toBe('test');
      expect(result[1]).toBe('[Circular Reference]');
      expect(console.warn).toHaveBeenCalledWith(
        'TimestampUtil: Circular reference detected in array, skipping to prevent stack overflow'
      );
    });

    it('should handle circular references in convertDatesToTimestamps', () => {
      const obj: any = { date: new Date(), name: 'test' };
      obj.self = obj; // Create circular reference
      
      spyOn(console, 'warn');
      spyOn(TimestampUtil, 'convertToFirestoreTimestamp').and.returnValue(mockTimestamp);
      
      const result = TimestampUtil.convertDatesToTimestamps(obj);
      
      expect(result.name).toBe('test');
      expect(result.date).toBe(mockTimestamp);
      expect(result.self).toBe('[Circular Reference]');
      expect(console.warn).toHaveBeenCalledWith(
        'TimestampUtil: Circular reference detected in object, skipping to prevent stack overflow'
      );
    });
  });
});