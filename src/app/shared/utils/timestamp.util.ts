import { Injectable } from '@angular/core';
import { Timestamp } from '@angular/fire/firestore';

/**
 * Pure utility service for Firebase timestamp conversions
 * Contains only pure functions with no dependencies or side effects
 * Safe from circular dependency issues
 */
@Injectable({
  providedIn: 'root'
})
export class TimestampUtil {

  /**
   * Type guard to check if a value is a Firestore Timestamp
   * @param value - The value to check
   * @returns true if the value is a Firestore Timestamp, false otherwise
   * @example
   * ```typescript
   * if (TimestampUtil.isFirestoreTimestamp(data.createdAt)) {
   *   const date = data.createdAt.toDate();
   * }
   * ```
   */
  static isFirestoreTimestamp(value: any): value is Timestamp {
    return value instanceof Timestamp;
  }

  /**
   * Safely converts a Firestore Timestamp to a JavaScript Date
   * Handles null/undefined values and provides fallbacks for invalid timestamps
   * @param timestamp - The timestamp value to convert (can be null/undefined)
   * @returns JavaScript Date object or null for null/undefined input
   * @example
   * ```typescript
   * const date = TimestampUtil.safeTimestampToDate(doc.data().createdAt);
   * ```
   */
  static safeTimestampToDate(timestamp: any): Date | null {
    try {
      if (timestamp === null || timestamp === undefined) {
        return null;
      }
      if (TimestampUtil.isFirestoreTimestamp(timestamp)) {
        return timestamp.toDate();
      }
      if (timestamp instanceof Date) {
        return isNaN(timestamp.getTime()) ? null : timestamp;
      }
      if (typeof timestamp === 'string' || typeof timestamp === 'number') {
        const date = new Date(timestamp);
        return isNaN(date.getTime()) ? null : date;
      }
      return null;
    } catch (error) {
      console.warn('TimestampUtil: Error converting timestamp to Date:', error);
      return null;
    }
  }

  /**
   * Converts a JavaScript Date to a Firestore Timestamp
   * @param date - The Date object to convert
   * @returns Firestore Timestamp
   * @throws Error if the date is null, undefined, or invalid
   * @example
   * ```typescript
   * const timestamp = TimestampUtil.convertToFirestoreTimestamp(new Date());
   * ```
   */
  static convertToFirestoreTimestamp(date: Date): Timestamp {
    if (!date || !(date instanceof Date)) {
      throw new Error('TimestampUtil: Invalid date provided - must be a Date object');
    }
    if (isNaN(date.getTime())) {
      throw new Error('TimestampUtil: Invalid date provided - date is not valid');
    }
    try {
      return Timestamp.fromDate(date);
    } catch (error) {
      console.error('TimestampUtil: Error converting Date to Timestamp:', error);
      throw error;
    }
  }

  /**
   * Recursively converts all Timestamp fields in an object to Date objects
   * Handles nested objects, arrays, and optional timestamp fields safely
   * Includes circular reference protection to prevent stack overflow
   * @param obj - The object to process (can be any type)
   * @param visited - Set of visited objects to detect circular references (internal use)
   * @returns Object with all Timestamps converted to Dates
   * @example
   * ```typescript
   * const converted = TimestampUtil.convertTimestampFieldsRecursively(firestoreDoc);
   * ```
   */
  static convertTimestampFieldsRecursively(obj: any, visited?: WeakSet<object>): any {
    if (obj === null || obj === undefined) {
      return obj;
    }

    // Handle Firestore Timestamps
    if (TimestampUtil.isFirestoreTimestamp(obj)) {
      return TimestampUtil.safeTimestampToDate(obj);
    }

    // Handle Arrays
    if (Array.isArray(obj)) {
      // Initialize visited set on first call
      if (!visited) {
        visited = new WeakSet<object>();
      }
      
      // Check for circular reference
      if (visited.has(obj)) {
        console.warn('TimestampUtil: Circular reference detected in array, skipping to prevent stack overflow');
        return '[Circular Reference]';
      }
      
      // Add to visited set
      visited.add(obj);
      
      const result = obj.map(item => TimestampUtil.convertTimestampFieldsRecursively(item, visited));
      
      // Remove from visited set (backtrack)
      visited.delete(obj);
      
      return result;
    }

    // Handle Objects (but not Date objects or other built-in types)
    if (typeof obj === 'object' && obj.constructor === Object) {
      // Initialize visited set on first call
      if (!visited) {
        visited = new WeakSet<object>();
      }
      
      // Check for circular reference
      if (visited.has(obj)) {
        console.warn('TimestampUtil: Circular reference detected in object, skipping to prevent stack overflow');
        return '[Circular Reference]';
      }
      
      // Add to visited set
      visited.add(obj);
      
      const converted: any = {};
      for (const [key, value] of Object.entries(obj)) {
        converted[key] = TimestampUtil.convertTimestampFieldsRecursively(value, visited);
      }
      
      // Remove from visited set (backtrack)
      visited.delete(obj);
      
      return converted;
    }

    // Return primitive values and other object types as-is
    return obj;
  }

  /**
   * Converts a Firestore document to a typed object with all Timestamps converted to Dates
   * @param data - The raw Firestore document data
   * @returns Typed object with converted timestamps
   * @example
   * ```typescript
   * const bunny = TimestampUtil.convertFirestoreDocument<Bunny>(doc.data());
   * ```
   */
  static convertFirestoreDocument<T>(data: any): T {
    try {
      if (!data || typeof data !== 'object') {
        return data as T;
      }

      const converted = TimestampUtil.convertTimestampFieldsRecursively(data);
      return converted as T;
    } catch (error) {
      console.error('TimestampUtil: Error converting Firestore document:', error);
      return data as T;
    }
  }

  /**
   * Converts an array of Firestore documents to typed objects with all Timestamps converted to Dates
   * @param array - Array of raw Firestore document data
   * @returns Array of typed objects with converted timestamps
   * @example
   * ```typescript
   * const bunnies = TimestampUtil.convertFirestoreArray<Bunny>(querySnapshot.docs.map(doc => doc.data()));
   * ```
   */
  static convertFirestoreArray<T>(array: any[]): T[] {
    try {
      if (!Array.isArray(array)) {
        console.warn('TimestampUtil: Expected array but received:', typeof array);
        return [];
      }

      return array.map(item => TimestampUtil.convertFirestoreDocument<T>(item));
    } catch (error) {
      console.error('TimestampUtil: Error converting Firestore array:', error);
      return [];
    }
  }

  /**
   * Recursively converts Date objects to Firestore Timestamps for saving to Firestore
   * Handles nested objects and arrays with circular reference protection
   * @param obj - The object to process
   * @param visited - Set of visited objects to detect circular references (internal use)
   * @returns Object with Dates converted to Timestamps
   * @example
   * ```typescript
   * const firestoreData = TimestampUtil.convertDatesToTimestamps(bunnyData);
   * ```
   */
  static convertDatesToTimestamps(obj: any, visited?: WeakSet<object>): any {
    if (obj === null || obj === undefined) {
      return obj;
    }

    // Handle Date objects
    if (obj instanceof Date) {
      try {
        return TimestampUtil.convertToFirestoreTimestamp(obj);
      } catch (error) {
        console.warn('TimestampUtil: Skipping invalid date during conversion:', error);
        return obj;
      }
    }

    // Handle Arrays
    if (Array.isArray(obj)) {
      // Initialize visited set on first call
      if (!visited) {
        visited = new WeakSet<object>();
      }
      
      // Check for circular reference
      if (visited.has(obj)) {
        console.warn('TimestampUtil: Circular reference detected in array, skipping to prevent stack overflow');
        return '[Circular Reference]';
      }
      
      // Add to visited set
      visited.add(obj);
      
      const result = obj.map(item => TimestampUtil.convertDatesToTimestamps(item, visited));
      
      // Remove from visited set (backtrack)
      visited.delete(obj);
      
      return result;
    }

    // Handle Objects (but not Timestamp objects or other built-in types)
    if (typeof obj === 'object' && obj.constructor === Object) {
      // Initialize visited set on first call
      if (!visited) {
        visited = new WeakSet<object>();
      }
      
      // Check for circular reference
      if (visited.has(obj)) {
        console.warn('TimestampUtil: Circular reference detected in object, skipping to prevent stack overflow');
        return '[Circular Reference]';
      }
      
      // Add to visited set
      visited.add(obj);
      
      const converted: any = {};
      for (const [key, value] of Object.entries(obj)) {
        converted[key] = TimestampUtil.convertDatesToTimestamps(value, visited);
      }
      
      // Remove from visited set (backtrack)
      visited.delete(obj);
      
      return converted;
    }

    // Return primitive values and other object types as-is
    return obj;
  }

  /**
   * Prepares data for Firestore by converting all Date objects to Timestamps
   * Pure function with comprehensive error handling
   * @param data - The data to prepare for Firestore
   * @returns Data with Dates converted to Timestamps
   * @example
   * ```typescript
   * const prepared = TimestampUtil.prepareForFirestore(bunnyData);
   * await addDoc(collection, prepared);
   * ```
   */
  static prepareForFirestore<T>(data: T): any {
    try {
      return TimestampUtil.convertDatesToTimestamps(data);
    } catch (error) {
      console.error('TimestampUtil: Error preparing data for Firestore:', error);
      throw error;
    }
  }
}
