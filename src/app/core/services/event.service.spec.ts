import { TestBed } from '@angular/core/testing';
import { EventService } from './event.service';
import { ConfigService } from './config.service';
import { BunnyService } from './bunny.service';
import {
  Firestore,
  collection,
  doc,
  addDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  getDocs,
  limit,
} from '@angular/fire/firestore';
import {
  Bunny,
  PointsConfig,
} from '../models/bunny.model';
import { TimestampUtil } from '../../shared/utils/timestamp.util';
import { of } from 'rxjs';

describe('EventService', () => {
  let service: EventService;
  let mockFirestore: any;
  let mockConfigService: any;
  let mockBunnyService: any;
  let mockCollection: jasmine.Spy;
  let mockDoc: jasmine.Spy;
  let mockAddDoc: jasmine.Spy;
  let mockQuery: jasmine.Spy;
  let mockWhere: jasmine.Spy;
  let mockOrderBy: jasmine.Spy;
  let mockLimit: jasmine.Spy;
  let mockOnSnapshot: jasmine.Spy;
  let mockGetDocs: jasmine.Spy;

  const testConfig: PointsConfig = {
    lettuce: 2,
    carrot: 5,
    playing: 3,
    repeatPlaying: 6,
  };

  const testBunny: Bunny = {
    id: 'bunny1',
    name: 'Test Bunny',
    happiness: 50,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const testPlaymate: Bunny = {
    id: 'bunny2',
    name: 'Playmate Bunny',
    happiness: 60,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    mockFirestore = {};
    mockConfigService = {
      getConfigValue: jasmine
        .createSpy('getConfigValue')
        .and.returnValue(testConfig),
    };
    mockBunnyService = {
      getBunnyById: jasmine
        .createSpy('getBunnyById')
        .and.returnValue(Promise.resolve(testBunny)),
      updateBunny: jasmine
        .createSpy('updateBunny')
        .and.returnValue(Promise.resolve(true)),
      getBunnies: jasmine
        .createSpy('getBunnies')
        .and.returnValue(of([testBunny, testPlaymate])),
    };

    mockCollection = jasmine
      .createSpy('collection')
      .and.returnValue('mock-collection');
    mockDoc = jasmine.createSpy('doc').and.returnValue('mock-doc-ref');
    mockAddDoc = jasmine.createSpy('addDoc');
    mockQuery = jasmine.createSpy('query').and.returnValue('mock-query');
    mockWhere = jasmine.createSpy('where').and.returnValue('mock-where');
    mockOrderBy = jasmine.createSpy('orderBy').and.returnValue('mock-orderby');
    mockLimit = jasmine.createSpy('limit').and.returnValue('mock-limit');
    mockOnSnapshot = jasmine.createSpy('onSnapshot');
    mockGetDocs = jasmine.createSpy('getDocs');

    TestBed.configureTestingModule({
      providers: [
        EventService,
        { provide: Firestore, useValue: mockFirestore },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: BunnyService, useValue: mockBunnyService },
      ],
    });

    (collection as jasmine.Spy) = mockCollection;
    (doc as jasmine.Spy) = mockDoc;
    (addDoc as jasmine.Spy) = mockAddDoc;
    (query as jasmine.Spy) = mockQuery;
    (where as jasmine.Spy) = mockWhere;
    (orderBy as jasmine.Spy) = mockOrderBy;
    (limit as jasmine.Spy) = mockLimit;
    (onSnapshot as jasmine.Spy) = mockOnSnapshot;
    (getDocs as jasmine.Spy) = mockGetDocs;

    spyOn(TimestampUtil, 'convertFirestoreDocument').and.callFake(
      (data) => data
    );
    spyOn(TimestampUtil, 'prepareForFirestore').and.callFake((data) => data);
  });

  describe('Service Initialization', () => {
    it('should be created', () => {
      service = TestBed.inject(EventService);
      expect(service).toBeTruthy();
    });

    it('should initialize events collection', () => {
      service = TestBed.inject(EventService);
      expect(mockCollection).toHaveBeenCalledWith(mockFirestore, 'events');
    });

    it('should set up real-time listener for events', () => {
      service = TestBed.inject(EventService);
      expect(mockQuery).toHaveBeenCalled();
      expect(mockOrderBy).toHaveBeenCalledWith('timestamp', 'desc');
      expect(mockOnSnapshot).toHaveBeenCalled();
    });
  });

  describe('feedBunny', () => {
    beforeEach(() => {
      service = TestBed.inject(EventService);
      mockAddDoc.and.returnValue(Promise.resolve({ id: 'new-event-id' }));
    });

    it('should successfully feed bunny with lettuce', async () => {
      const result = await service.feedBunny('bunny1', 'lettuce');

      expect(mockBunnyService.getBunnyById).toHaveBeenCalledWith('bunny1');
      expect(mockAddDoc).toHaveBeenCalled();
      expect(mockBunnyService.updateBunny).toHaveBeenCalledWith('bunny1', {
        happiness: 52,
      }); // 50 + 2 (lettuce points)
      expect(result).toBe(true);
    });

    it('should successfully feed bunny with carrot', async () => {
      const result = await service.feedBunny('bunny1', 'carrot');

      expect(mockBunnyService.getBunnyById).toHaveBeenCalledWith('bunny1');
      expect(mockAddDoc).toHaveBeenCalled();
      expect(mockBunnyService.updateBunny).toHaveBeenCalledWith('bunny1', {
        happiness: 55,
      }); // 50 + 5 (carrot points)
      expect(result).toBe(true);
    });

    it('should use TimestampUtil for data preparation', async () => {
      await service.feedBunny('bunny1', 'lettuce');

      expect(TimestampUtil.prepareForFirestore).toHaveBeenCalled();
      const preparedData = (
        TimestampUtil.prepareForFirestore as jasmine.Spy
      ).calls.mostRecent().args[0];
      expect(preparedData.type).toBe('eating');
      expect(preparedData.details.foodType).toBe('lettuce');
      expect(preparedData.pointsEarned).toBe(2);
    });

    it('should handle non-existent bunny', async () => {
      spyOn(console, 'error');
      mockBunnyService.getBunnyById.and.returnValue(Promise.resolve(null));

      const result = await service.feedBunny('nonexistent', 'lettuce');

      expect(console.error).toHaveBeenCalledWith(
        'Bunny not found:',
        'nonexistent'
      );
      expect(result).toBe(false);
    });

    it('should cap happiness at 100', async () => {
      const happyBunny = { ...testBunny, happiness: 98 };
      mockBunnyService.getBunnyById.and.returnValue(
        Promise.resolve(happyBunny)
      );

      await service.feedBunny('bunny1', 'carrot'); // +5 points would exceed 100

      expect(mockBunnyService.updateBunny).toHaveBeenCalledWith('bunny1', {
        happiness: 100,
      });
    });
  });

  describe('playWithBunny', () => {
    beforeEach(() => {
      service = TestBed.inject(EventService);
      mockAddDoc.and.returnValue(Promise.resolve({ id: 'new-event-id' }));
      spyOn(service as any, 'checkRepeatPlay').and.returnValue(
        Promise.resolve(false)
      );
    });

    it('should successfully create play session', async () => {
      mockBunnyService.getBunnyById.and.callFake((id: string) => {
        return Promise.resolve(id === 'bunny1' ? testBunny : testPlaymate);
      });

      const result = await service.playWithBunny('bunny1', 'bunny2');

      expect(mockBunnyService.getBunnyById).toHaveBeenCalledWith('bunny1');
      expect(mockBunnyService.getBunnyById).toHaveBeenCalledWith('bunny2');
      expect(mockAddDoc).toHaveBeenCalled();
      expect(mockBunnyService.updateBunny).toHaveBeenCalledWith('bunny1', {
        happiness: 53,
      }); // 50 + 3
      expect(mockBunnyService.updateBunny).toHaveBeenCalledWith('bunny2', {
        happiness: 63,
      }); // 60 + 3
      expect(result).toBe(true);
    });

    it('should handle repeat play sessions with higher points', async () => {
      (service as any).checkRepeatPlay.and.returnValue(Promise.resolve(true));
      mockBunnyService.getBunnyById.and.callFake((id: string) => {
        return Promise.resolve(id === 'bunny1' ? testBunny : testPlaymate);
      });

      await service.playWithBunny('bunny1', 'bunny2');

      expect(mockBunnyService.updateBunny).toHaveBeenCalledWith('bunny1', {
        happiness: 56,
      }); // 50 + 6 (repeat)
      expect(mockBunnyService.updateBunny).toHaveBeenCalledWith('bunny2', {
        happiness: 66,
      }); // 60 + 6 (repeat)
    });

    it('should prevent bunny from playing with itself', async () => {
      spyOn(console, 'error');

      const result = await service.playWithBunny('bunny1', 'bunny1');

      expect(console.error).toHaveBeenCalledWith(
        'Bunny cannot play with itself'
      );
      expect(result).toBe(false);
    });
  });

  describe('checkRepeatPlay', () => {
    beforeEach(() => {
      service = TestBed.inject(EventService);
    });

    it('should detect repeat play', async () => {
      const mockPlayEvent = {
        id: 'play1',
        bunnyId: 'bunny1',
        type: 'playing',
        details: { playmateBunnyId: 'bunny2', isRepeatPlay: false },
        timestamp: new Date(),
        pointsEarned: 3,
      };

      const mockSnapshot = {
        docs: [{ id: 'play1', data: () => mockPlayEvent }],
      };
      mockGetDocs.and.returnValue(Promise.resolve(mockSnapshot));

      const result = await (service as any).checkRepeatPlay('bunny1', 'bunny2');

      expect(mockQuery).toHaveBeenCalled();
      expect(mockWhere).toHaveBeenCalledWith('bunnyId', '==', 'bunny1');
      expect(mockWhere).toHaveBeenCalledWith('type', '==', 'playing');
      expect(mockOrderBy).toHaveBeenCalledWith('timestamp', 'desc');
      expect(mockLimit).toHaveBeenCalledWith(10);
      expect(result).toBe(true);
    });

    it('should return false when no previous play found', async () => {
      const mockSnapshot = { docs: [] };
      mockGetDocs.and.returnValue(Promise.resolve(mockSnapshot));

      const result = await (service as any).checkRepeatPlay('bunny1', 'bunny3');

      expect(result).toBe(false);
    });
  });

  describe('recalculateHappinessFromEvents', () => {
    beforeEach(() => {
      service = TestBed.inject(EventService);
    });

    it('should recalculate happiness from all events', async () => {
      const events = [
        { type: 'eating', details: { foodType: 'lettuce' } },
        {
          type: 'playing',
          details: { playmateBunnyId: 'bunny2', isRepeatPlay: false },
        },
        {
          type: 'playing',
          details: { playmateBunnyId: 'bunny2', isRepeatPlay: true },
        },
      ];

      const mockSnapshot = {
        docs: events.map((event, index) => ({
          id: `event${index}`,
          data: () => event,
        })),
      };
      mockGetDocs.and.returnValue(Promise.resolve(mockSnapshot));

      const result = await service.recalculateHappinessFromEvents('bunny1');

      // Expected: lettuce(2) + playing(3) + repeatPlaying(6) = 11
      expect(mockBunnyService.updateBunny).toHaveBeenCalledWith('bunny1', {
        happiness: 11,
      });
      expect(result).toBe(true);
    });

    it('should handle non-existent bunny', async () => {
      spyOn(console, 'error');
      mockBunnyService.getBunnyById.and.returnValue(Promise.resolve(null));

      const result = await service.recalculateHappinessFromEvents(
        'nonexistent'
      );

      expect(console.error).toHaveBeenCalledWith(
        'Bunny not found for happiness recalculation:',
        'nonexistent'
      );
      expect(result).toBe(false);
    });

    it('should cap happiness at 100', async () => {
      const highPointEvents = Array(50)
        .fill(null)
        .map((_, index) => ({
          id: `event${index}`,
          type: 'eating',
          details: { foodType: 'carrot' }, // 5 points each
        }));

      const mockSnapshot = {
        docs: highPointEvents.map((event) => ({
          id: event.id,
          data: () => event,
        })),
      };
      mockGetDocs.and.returnValue(Promise.resolve(mockSnapshot));

      await service.recalculateHappinessFromEvents('bunny1');

      // 50 events * 5 points = 250, but should cap at 100
      expect(mockBunnyService.updateBunny).toHaveBeenCalledWith('bunny1', {
        happiness: 100,
      });
    });
  });

  describe('recalculateAllBunniesHappiness', () => {
    beforeEach(() => {
      service = TestBed.inject(EventService);
      spyOn(service, 'recalculateHappinessFromEvents').and.returnValue(
        Promise.resolve(true)
      );
    });

    it('should recalculate happiness for all bunnies', async () => {
      spyOn(console, 'log');

      await service.recalculateAllBunniesHappiness();

      expect(mockBunnyService.getBunnies).toHaveBeenCalled();
      expect(service.recalculateHappinessFromEvents).toHaveBeenCalledWith(
        'bunny1'
      );
      expect(service.recalculateHappinessFromEvents).toHaveBeenCalledWith(
        'bunny2'
      );
      expect(console.log).toHaveBeenCalledWith(
        'Successfully recalculated happiness for all bunnies'
      );
    });

    it('should handle recalculation errors', async () => {
      spyOn(console, 'error');
      mockBunnyService.getBunnies.and.returnValue(
        Promise.reject(new Error('Service error')) as any
      );

      await service.recalculateAllBunniesHappiness();

      expect(console.error).toHaveBeenCalledWith(
        'Error recalculating happiness for all bunnies:',
        jasmine.any(Error)
      );
    });
  });

  describe('getAllEvents', () => {
    beforeEach(() => {
      service = TestBed.inject(EventService);
    });

    it('should return events observable', () => {
      const eventsObservable = service.getAllEvents();
      expect(eventsObservable).toBe(service.events$);
    });
  });
});
