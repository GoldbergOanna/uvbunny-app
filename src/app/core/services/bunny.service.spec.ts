import { TestBed } from '@angular/core/testing';
import { BunnyService } from './bunny.service';
import {
  Firestore,
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  query,
  onSnapshot,
} from '@angular/fire/firestore';
import { Bunny } from '../models/bunny.model';
import { TimestampUtil } from '../../shared/utils/timestamp.util';
import { throwError } from 'rxjs';

describe('BunnyService', () => {
  let service: BunnyService;
  let mockFirestore: any;
  let mockCollection: jasmine.Spy;
  let mockDoc: jasmine.Spy;
  let mockAddDoc: jasmine.Spy;
  let mockUpdateDoc: jasmine.Spy;
  let mockDeleteDoc: jasmine.Spy;
  let mockGetDoc: jasmine.Spy;
  let mockQuery: jasmine.Spy;
  let mockOnSnapshot: jasmine.Spy;

  const testBunny: Bunny = {
    id: 'bunny1',
    name: 'Test Bunny',
    avatarUrl: 'https://example.com/avatar.jpg',
    happiness: 75,
    createdAt: new Date('2023-01-01T00:00:00Z'),
    updatedAt: new Date('2023-01-02T00:00:00Z'),
  };

  const testBunny2: Bunny = {
    id: 'bunny2',
    name: 'Happy Bunny',
    happiness: 90,
    createdAt: new Date('2023-01-03T00:00:00Z'),
    updatedAt: new Date('2023-01-04T00:00:00Z'),
  };

  const mockDocumentSnapshot = {
    id: 'bunny1',
    exists: jasmine.createSpy('exists').and.returnValue(true),
    data: jasmine.createSpy('data').and.returnValue({
      name: testBunny.name,
      avatarUrl: testBunny.avatarUrl,
      happiness: testBunny.happiness,
      createdAt: testBunny.createdAt,
      updatedAt: testBunny.updatedAt,
    }),
  };

  beforeEach(() => {
    mockFirestore = {};
    mockCollection = jasmine
      .createSpy('collection')
      .and.returnValue('mock-collection');
    mockDoc = jasmine.createSpy('doc').and.returnValue('mock-doc-ref');
    mockAddDoc = jasmine.createSpy('addDoc');
    mockUpdateDoc = jasmine.createSpy('updateDoc');
    mockDeleteDoc = jasmine.createSpy('deleteDoc');
    mockGetDoc = jasmine.createSpy('getDoc');
    mockQuery = jasmine.createSpy('query').and.returnValue('mock-query');
    mockOnSnapshot = jasmine.createSpy('onSnapshot');

    TestBed.configureTestingModule({
      providers: [
        BunnyService,
        { provide: Firestore, useValue: mockFirestore },
      ],
    });

    (collection as jasmine.Spy) = mockCollection;
    (doc as jasmine.Spy) = mockDoc;
    (addDoc as jasmine.Spy) = mockAddDoc;
    (updateDoc as jasmine.Spy) = mockUpdateDoc;
    (deleteDoc as jasmine.Spy) = mockDeleteDoc;
    (getDoc as jasmine.Spy) = mockGetDoc;
    (query as jasmine.Spy) = mockQuery;
    (onSnapshot as jasmine.Spy) = mockOnSnapshot;

    spyOn(TimestampUtil, 'convertDatesToTimestamps').and.callFake(
      (data) => data
    );
    spyOn(TimestampUtil, 'convertFirestoreDocument').and.callFake(
      (data) => data
    );
  });

  describe('Service Initialization', () => {
    it('should be created', () => {
      service = TestBed.inject(BunnyService);
      expect(service).toBeTruthy();
    });

    it('should initialize bunnies collection', () => {
      service = TestBed.inject(BunnyService);
      expect(mockCollection).toHaveBeenCalledWith(mockFirestore, 'bunnies');
    });

    it('should set up real-time listener on initialization', () => {
      service = TestBed.inject(BunnyService);
      expect(mockQuery).toHaveBeenCalledWith('mock-collection');
      expect(mockOnSnapshot).toHaveBeenCalled();
    });

    it('should initialize with empty bunnies array', () => {
      service = TestBed.inject(BunnyService);
      service.bunnies$.subscribe((bunnies) => {
        expect(bunnies).toEqual([]);
      });
    });
  });

  describe('Real-time Bunny Loading', () => {
    beforeEach(() => {
      service = TestBed.inject(BunnyService);
    });

    it('should load bunnies from snapshot', () => {
      const mockDocs = [
        { id: 'bunny1', data: () => ({ name: 'Bunny 1', happiness: 75 }) },
        { id: 'bunny2', data: () => ({ name: 'Bunny 2', happiness: 85 }) },
      ];
      const mockSnapshot = { docs: mockDocs };

      const snapshotCallback = mockOnSnapshot.calls.mostRecent().args[1];
      snapshotCallback(mockSnapshot);

      expect(TimestampUtil.convertDatesToTimestamps).toHaveBeenCalledTimes(2);

      service.bunnies$.subscribe((bunnies) => {
        expect(bunnies).toHaveSize(2);
        expect(bunnies[0].id).toBe('bunny1');
        expect(bunnies[1].id).toBe('bunny2');
      });
    });

    it('should handle empty snapshots', () => {
      const mockSnapshot = { docs: [] };

      const snapshotCallback = mockOnSnapshot.calls.mostRecent().args[1];
      snapshotCallback(mockSnapshot);

      service.bunnies$.subscribe((bunnies) => {
        expect(bunnies).toEqual([]);
      });
    });

    it('should handle snapshot updates', () => {
      let emissionCount = 0;
      const expectedArrays = [[], [testBunny], [testBunny, testBunny2]];

      service.bunnies$.subscribe((bunnies) => {
        expect(bunnies).toEqual(expectedArrays[emissionCount] as any);
        emissionCount++;
      });

      // First snapshot with one bunny
      const snapshot1 = { docs: [{ id: 'bunny1', data: () => testBunny }] };
      const snapshotCallback = mockOnSnapshot.calls.mostRecent().args[1];
      snapshotCallback(snapshot1);

      // Second snapshot with two bunnies
      const snapshot2 = {
        docs: [
          { id: 'bunny1', data: () => testBunny },
          { id: 'bunny2', data: () => testBunny2 },
        ],
      };
      snapshotCallback(snapshot2);
    });
  });

  describe('getBunnies', () => {
    beforeEach(() => {
      service = TestBed.inject(BunnyService);
    });

    it('should return bunnies observable', () => {
      const bunniesObservable = service.getBunnies();
      expect(bunniesObservable).toBe(service.bunnies$);
    });

    it('should emit current bunnies to new subscribers', () => {
      // Simulate snapshot with bunnies
      const mockSnapshot = { docs: [{ id: 'bunny1', data: () => testBunny }] };
      const snapshotCallback = mockOnSnapshot.calls.mostRecent().args[1];
      snapshotCallback(mockSnapshot);

      // New subscription should get current value
      service.getBunnies().subscribe((bunnies) => {
        expect(bunnies).toHaveSize(1);
        expect(bunnies[0].id).toBe('bunny1');
      });
    });
  });

  describe('addBunny', () => {
    beforeEach(() => {
      service = TestBed.inject(BunnyService);
    });

    it('should successfully add a new bunny', async () => {
      const newBunnyData = {
        name: 'New Bunny',
        avatarUrl: 'https://example.com/new-avatar.jpg',
        happiness: 50,
      };
      const mockDocRef = { id: 'new-bunny-id' };
      mockAddDoc.and.returnValue(Promise.resolve(mockDocRef));

      const result = await service.addBunny(newBunnyData);

      expect(mockAddDoc).toHaveBeenCalledWith(
        'mock-collection',
        jasmine.any(Object)
      );
      expect(TimestampUtil.convertDatesToTimestamps).toHaveBeenCalled();
      expect(result).toBe('new-bunny-id');

      // Verify the data passed to addDoc includes timestamps
      const addedData = mockAddDoc.calls.mostRecent().args[1];
      expect(addedData.name).toBe(newBunnyData.name);
      expect(addedData.avatarUrl).toBe(newBunnyData.avatarUrl);
      expect(addedData.happiness).toBe(newBunnyData.happiness);
      expect(addedData.createdAt).toBeInstanceOf(Date);
      expect(addedData.updatedAt).toBeInstanceOf(Date);
    });

    it('should add bunny without optional fields', async () => {
      const minimalBunnyData = {
        name: 'Minimal Bunny',
        happiness: 25,
      };
      const mockDocRef = { id: 'minimal-bunny-id' };
      mockAddDoc.and.returnValue(Promise.resolve(mockDocRef));

      const result = await service.addBunny(minimalBunnyData);

      expect(result).toBe('minimal-bunny-id');
      const addedData = mockAddDoc.calls.mostRecent().args[1];
      expect(addedData.name).toBe(minimalBunnyData.name);
      expect(addedData.happiness).toBe(minimalBunnyData.happiness);
      expect(addedData.avatarUrl).toBeUndefined();
    });

    it('should handle add bunny errors', async () => {
      spyOn(console, 'error');
      mockAddDoc.and.returnValue(Promise.reject(new Error('Firestore error')));

      const result = await service.addBunny({
        name: 'Error Bunny',
        happiness: 0,
      });

      expect(console.error).toHaveBeenCalledWith(
        'Error adding bunny:',
        jasmine.any(Error)
      );
      expect(result).toBeNull();
    });

    it('should use TimestampUtil for data conversion', async () => {
      const bunnyData = { name: 'Test Bunny', happiness: 60 };
      mockAddDoc.and.returnValue(Promise.resolve({ id: 'test-id' }));

      await service.addBunny(bunnyData);

      expect(TimestampUtil.convertDatesToTimestamps).toHaveBeenCalled();
      const convertedData = (
        TimestampUtil.convertDatesToTimestamps as jasmine.Spy
      ).calls.mostRecent().args[0];
      expect(convertedData.createdAt).toBeInstanceOf(Date);
      expect(convertedData.updatedAt).toBeInstanceOf(Date);
    });
  });

  describe('updateBunny', () => {
    beforeEach(() => {
      service = TestBed.inject(BunnyService);
    });

    it('should successfully update a bunny', async () => {
      const updates = { name: 'Updated Bunny', happiness: 95 };
      mockUpdateDoc.and.returnValue(Promise.resolve());

      const result = await service.updateBunny('bunny1', updates);

      expect(mockDoc).toHaveBeenCalledWith(mockFirestore, 'bunnies/bunny1');
      expect(mockUpdateDoc).toHaveBeenCalledWith(
        'mock-doc-ref',
        jasmine.any(Object)
      );
      expect(TimestampUtil.convertDatesToTimestamps).toHaveBeenCalled();
      expect(result).toBe(true);

      // Verify updatedAt is set
      const updateData = mockUpdateDoc.calls.mostRecent().args[1];
      expect(updateData.name).toBe(updates.name);
      expect(updateData.happiness).toBe(updates.happiness);
      expect(updateData.updatedAt).toBeInstanceOf(Date);
    });

    it('should update partial bunny data', async () => {
      const partialUpdates = { happiness: 80 };
      mockUpdateDoc.and.returnValue(Promise.resolve());

      const result = await service.updateBunny('bunny1', partialUpdates);

      expect(result).toBe(true);
      const updateData = mockUpdateDoc.calls.mostRecent().args[1];
      expect(updateData.happiness).toBe(80);
      expect(updateData.name).toBeUndefined();
      expect(updateData.updatedAt).toBeInstanceOf(Date);
    });

    it('should handle update bunny errors', async () => {
      spyOn(console, 'error');
      mockUpdateDoc.and.returnValue(Promise.reject(new Error('Update error')));

      const result = await service.updateBunny('bunny1', { happiness: 100 });

      expect(console.error).toHaveBeenCalledWith(
        'Error updating bunny:',
        jasmine.any(Error)
      );
      expect(result).toBe(false);
    });

    it('should not allow updating id or createdAt', async () => {
      // TypeScript should prevent this, but test the omit type
      const updates = { name: 'Test', happiness: 50 } as Partial<
        Omit<Bunny, 'id' | 'createdAt'>
      >;
      mockUpdateDoc.and.returnValue(Promise.resolve());

      await service.updateBunny('bunny1', updates);

      const updateData = mockUpdateDoc.calls.mostRecent().args[1];
      expect(updateData.id).toBeUndefined();
      expect(updateData.createdAt).toBeUndefined();
    });

    it('should use TimestampUtil for data conversion', async () => {
      const updates = { name: 'Timestamp Test', happiness: 70 };
      mockUpdateDoc.and.returnValue(Promise.resolve());

      await service.updateBunny('bunny1', updates);

      expect(TimestampUtil.convertDatesToTimestamps).toHaveBeenCalled();
    });
  });

  describe('deleteBunny', () => {
    beforeEach(() => {
      service = TestBed.inject(BunnyService);
    });

    it('should successfully delete a bunny', async () => {
      mockDeleteDoc.and.returnValue(Promise.resolve());

      const result = await service.deleteBunny('bunny1');

      expect(mockDoc).toHaveBeenCalledWith(mockFirestore, 'bunnies/bunny1');
      expect(mockDeleteDoc).toHaveBeenCalledWith('mock-doc-ref');
      expect(result).toBe(true);
    });

    it('should handle delete bunny errors', async () => {
      spyOn(console, 'error');
      mockDeleteDoc.and.returnValue(Promise.reject(new Error('Delete error')));

      const result = await service.deleteBunny('bunny1');

      expect(console.error).toHaveBeenCalledWith(
        'Error deleting bunny:',
        jasmine.any(Error)
      );
      expect(result).toBe(false);
    });

    it('should handle empty bunny id', async () => {
      mockDeleteDoc.and.returnValue(Promise.resolve());

      const result = await service.deleteBunny('');

      expect(mockDoc).toHaveBeenCalledWith(mockFirestore, 'bunnies/');
      expect(result).toBe(true);
    });
  });

  describe('getBunnyById', () => {
    beforeEach(() => {
      service = TestBed.inject(BunnyService);
    });

    it('should successfully get a bunny by id', async () => {
      mockGetDoc.and.returnValue(Promise.resolve(mockDocumentSnapshot));

      const result = await service.getBunnyById('bunny1');

      expect(mockDoc).toHaveBeenCalledWith(mockFirestore, 'bunnies/bunny1');
      expect(mockGetDoc).toHaveBeenCalledWith('mock-doc-ref');
      expect(TimestampUtil.convertDatesToTimestamps).toHaveBeenCalled();
      expect(result).toBeTruthy();
      expect(result?.id).toBe('bunny1');
      expect(result?.name).toBe(testBunny.name);
    });

    it('should return null when bunny does not exist', async () => {
      const nonExistentSnapshot = {
        exists: jasmine.createSpy('exists').and.returnValue(false),
      };
      mockGetDoc.and.returnValue(Promise.resolve(nonExistentSnapshot));

      const result = await service.getBunnyById('nonexistent');

      expect(result).toBeNull();
    });

    it('should handle get bunny by id errors', async () => {
      spyOn(console, 'error');
      mockGetDoc.and.returnValue(Promise.reject(new Error('Get error')));

      const result = await service.getBunnyById('bunny1');

      expect(console.error).toHaveBeenCalledWith(
        'Error getting bunny by ID:',
        jasmine.any(Error)
      );
      expect(result).toBeNull();
    });

    it('should use TimestampUtil to convert document data', async () => {
      mockGetDoc.and.returnValue(Promise.resolve(mockDocumentSnapshot));

      await service.getBunnyById('bunny1');

      expect(TimestampUtil.convertDatesToTimestamps).toHaveBeenCalledWith(
        mockDocumentSnapshot.data()
      );
    });

    it('should handle malformed document data', async () => {
      const malformedSnapshot = {
        id: 'malformed',
        exists: jasmine.createSpy('exists').and.returnValue(true),
        data: jasmine.createSpy('data').and.returnValue(null),
      };
      mockGetDoc.and.returnValue(Promise.resolve(malformedSnapshot));

      const result = await service.getBunnyById('malformed');

      expect(result?.id).toBe('malformed');
      expect(TimestampUtil.convertDatesToTimestamps).toHaveBeenCalledWith(null);
    });
  });

  describe('getAverageHappiness', () => {
    beforeEach(() => {
      service = TestBed.inject(BunnyService);
    });

    it('should calculate average happiness correctly', (done) => {
      // Set up bunnies with known happiness values
      const bunnies = [
        { ...testBunny, happiness: 60 },
        { ...testBunny2, happiness: 80 },
        { ...testBunny, id: 'bunny3', happiness: 70 },
      ];

      // Simulate snapshot
      const mockSnapshot = {
        docs: bunnies.map((bunny) => ({
          id: bunny.id,
          data: () => bunny,
        })),
      };
      const snapshotCallback = mockOnSnapshot.calls.mostRecent().args[1];
      snapshotCallback(mockSnapshot);

      service.getAverageHappiness().subscribe((average) => {
        expect(average).toBe(70); // (60 + 80 + 70) / 3 = 70
        done();
      });
    });

    it('should return 0 for empty bunny list', (done) => {
      // Simulate empty snapshot
      const mockSnapshot = { docs: [] };
      const snapshotCallback = mockOnSnapshot.calls.mostRecent().args[1];
      snapshotCallback(mockSnapshot);

      service.getAverageHappiness().subscribe((average) => {
        expect(average).toBe(0);
        done();
      });
    });

    it('should round average happiness to 2 decimal places', (done) => {
      const bunnies = [
        { ...testBunny, happiness: 33 },
        { ...testBunny2, happiness: 66 },
        { ...testBunny, id: 'bunny3', happiness: 34 },
      ];

      const mockSnapshot = {
        docs: bunnies.map((bunny) => ({
          id: bunny.id,
          data: () => bunny,
        })),
      };
      const snapshotCallback = mockOnSnapshot.calls.mostRecent().args[1];
      snapshotCallback(mockSnapshot);

      service.getAverageHappiness().subscribe((average) => {
        expect(average).toBe(44.33); // (33 + 66 + 34) / 3 = 44.333... rounded to 44.33
        done();
      });
    });

    it('should handle calculation errors gracefully', (done) => {
      // Force an error in the map operator
      spyOn(service.bunnies$, 'pipe').and.returnValue(
        throwError('Calculation error')
      );

      service.getAverageHappiness().subscribe((average) => {
        expect(average).toBe(0);
        done();
      });
    });

    it('should handle single bunny correctly', (done) => {
      const mockSnapshot = {
        docs: [{ id: 'bunny1', data: () => ({ ...testBunny, happiness: 85 }) }],
      };
      const snapshotCallback = mockOnSnapshot.calls.mostRecent().args[1];
      snapshotCallback(mockSnapshot);

      service.getAverageHappiness().subscribe((average) => {
        expect(average).toBe(85);
        done();
      });
    });

    it('should update when bunny list changes', (done) => {
      let emissionCount = 0;
      const expectedAverages = [0, 75, 67.5]; // empty, one bunny (75), two bunnies (75+60)/2

      service.getAverageHappiness().subscribe((average) => {
        expect(average).toBe(expectedAverages[emissionCount]);
        emissionCount++;
        if (emissionCount === expectedAverages.length) {
          done();
        }
      });

      const snapshotCallback = mockOnSnapshot.calls.mostRecent().args[1];
      // First snapshot: one bunny
      snapshotCallback({
        docs: [{ id: 'bunny1', data: () => ({ ...testBunny, happiness: 75 }) }],
      });

      // Second snapshot: two bunnies
      snapshotCallback({
        docs: [
          { id: 'bunny1', data: () => ({ ...testBunny, happiness: 75 }) },
          { id: 'bunny2', data: () => ({ ...testBunny2, happiness: 60 }) },
        ],
      });
    });
  });

  describe('Integration Tests', () => {
    beforeEach(() => {
      service = TestBed.inject(BunnyService);
    });

    it('should handle complete CRUD lifecycle', async () => {
      // Create
      mockAddDoc.and.returnValue(Promise.resolve({ id: 'lifecycle-bunny' }));
      const addResult = await service.addBunny({
        name: 'Lifecycle Bunny',
        happiness: 50,
      });
      expect(addResult).toBe('lifecycle-bunny');

      // Read
      mockGetDoc.and.returnValue(
        Promise.resolve({
          id: 'lifecycle-bunny',
          exists: () => true,
          data: () => ({ name: 'Lifecycle Bunny', happiness: 50 }),
        })
      );
      const getResult = await service.getBunnyById('lifecycle-bunny');
      expect(getResult?.name).toBe('Lifecycle Bunny');

      // Update
      mockUpdateDoc.and.returnValue(Promise.resolve());
      const updateResult = await service.updateBunny('lifecycle-bunny', {
        happiness: 75,
      });
      expect(updateResult).toBe(true);

      // Delete
      mockDeleteDoc.and.returnValue(Promise.resolve());
      const deleteResult = await service.deleteBunny('lifecycle-bunny');
      expect(deleteResult).toBe(true);
    });

    it('should maintain consistent state with real-time updates', () => {
      const initialBunnies = [testBunny];
      const updatedBunnies = [testBunny, testBunny2];

      let emissionCount = 0;
      service.bunnies$.subscribe((bunnies) => {
        if (emissionCount === 0) {
          expect(bunnies).toEqual([]);
        } else if (emissionCount === 1) {
          expect(bunnies).toHaveSize(1);
          expect(bunnies[0].id).toBe('bunny1');
        } else if (emissionCount === 2) {
          expect(bunnies).toHaveSize(2);
          expect(bunnies.find((b) => b.id === 'bunny2')).toBeTruthy();
        }
        emissionCount++;
      });

      const snapshotCallback = mockOnSnapshot.calls.mostRecent().args[1];

      // Simulate adding bunnies
      snapshotCallback({ docs: [{ id: 'bunny1', data: () => testBunny }] });
      snapshotCallback({
        docs: [
          { id: 'bunny1', data: () => testBunny },
          { id: 'bunny2', data: () => testBunny2 },
        ],
      });
    });

    it('should handle concurrent operations', async () => {
      mockAddDoc.and.returnValue(Promise.resolve({ id: 'concurrent-1' }));
      mockUpdateDoc.and.returnValue(Promise.resolve());
      mockDeleteDoc.and.returnValue(Promise.resolve());

      const operations = [
        service.addBunny({ name: 'Concurrent Add', happiness: 30 }),
        service.updateBunny('existing-bunny', { happiness: 40 }),
        service.deleteBunny('old-bunny'),
      ];

      const results = await Promise.all(operations);

      expect(results[0]).toBe('concurrent-1'); // add result
      expect(results[1]).toBe(true); // update result
      expect(results[2]).toBe(true); // delete result
    });
  });

  describe('Error Handling and Edge Cases', () => {
    beforeEach(() => {
      service = TestBed.inject(BunnyService);
    });

    it('should handle Firestore connection issues', async () => {
      spyOn(console, 'error');
      const connectionError = new Error('Connection failed');
      mockAddDoc.and.returnValue(Promise.reject(connectionError));
      mockGetDoc.and.returnValue(Promise.reject(connectionError));
      mockUpdateDoc.and.returnValue(Promise.reject(connectionError));
      mockDeleteDoc.and.returnValue(Promise.reject(connectionError));

      const [addResult, getResult, updateResult, deleteResult] =
        await Promise.all([
          service.addBunny({ name: 'Connection Test', happiness: 50 }),
          service.getBunnyById('test-id'),
          service.updateBunny('test-id', { happiness: 75 }),
          service.deleteBunny('test-id'),
        ]);

      expect(addResult).toBeNull();
      expect(getResult).toBeNull();
      expect(updateResult).toBe(false);
      expect(deleteResult).toBe(false);
      expect(console.error).toHaveBeenCalledTimes(4);
    });

    it('should handle malformed snapshot data', () => {
      const malformedSnapshot = {
        docs: [
          {
            id: 'good-bunny',
            data: () => ({ name: 'Good Bunny', happiness: 50 }),
          },
          { id: 'bad-bunny', data: () => null },
          { id: 'empty-bunny', data: () => ({}) },
        ],
      };

      const snapshotCallback = mockOnSnapshot.calls.mostRecent().args[1];
      snapshotCallback(malformedSnapshot);

      service.bunnies$.subscribe((bunnies) => {
        expect(bunnies).toHaveSize(3);
        expect(bunnies[0].name).toBe('Good Bunny');
        expect(bunnies[1].id).toBe('bad-bunny');
        expect(bunnies[2].id).toBe('empty-bunny');
      });
    });

    it('should handle extreme happiness values in average calculation', (done) => {
      const extremeBunnies = [
        { ...testBunny, id: 'bunny1', happiness: 0 },
        { ...testBunny, id: 'bunny2', happiness: 100 },
        { ...testBunny, id: 'bunny3', happiness: Number.MAX_SAFE_INTEGER },
      ];

      const mockSnapshot = {
        docs: extremeBunnies.map((bunny) => ({
          id: bunny.id,
          data: () => bunny,
        })),
      };
      const snapshotCallback = mockOnSnapshot.calls.mostRecent().args[1];
      snapshotCallback(mockSnapshot);

      service.getAverageHappiness().subscribe((average) => {
        expect(typeof average).toBe('number');
        expect(isFinite(average)).toBe(true);
        done();
      });
    });
  });
});
