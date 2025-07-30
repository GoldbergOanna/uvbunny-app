import { TestBed } from '@angular/core/testing';
import { ConfigService } from './config.service';
import {
  Firestore,
  doc,
  getDoc,
  setDoc,
  onSnapshot,
} from '@angular/fire/firestore';
import { PointsConfig } from '../models/bunny.model';
import { TimestampUtil } from '../../shared/utils/timestamp.util';

describe('ConfigService', () => {
  let service: ConfigService;
  let mockFirestore: any;
  let mockDoc: jasmine.Spy;
  let mockGetDoc: jasmine.Spy;
  let mockSetDoc: jasmine.Spy;
  let mockOnSnapshot: jasmine.Spy;
  let mockDocumentSnapshot: any;

  const defaultConfig: PointsConfig = {
    lettuce: 1,
    carrot: 3,
    playing: 2,
    repeatPlaying: 4,
  };

  const testConfig: PointsConfig = {
    lettuce: 2,
    carrot: 5,
    playing: 3,
    repeatPlaying: 6,
  };

  beforeEach(() => {
    mockFirestore = {};
    mockDoc = jasmine.createSpy('doc').and.returnValue('mock-doc-ref');
    mockGetDoc = jasmine.createSpy('getDoc');
    mockSetDoc = jasmine.createSpy('setDoc');
    mockOnSnapshot = jasmine.createSpy('onSnapshot');

    mockDocumentSnapshot = {
      exists: jasmine.createSpy('exists'),
      data: jasmine.createSpy('data'),
    };

    TestBed.configureTestingModule({
      providers: [
        ConfigService,
        { provide: Firestore, useValue: mockFirestore },
      ],
    });

    (doc as jasmine.Spy) = mockDoc;
    (getDoc as jasmine.Spy) = mockGetDoc;
    (setDoc as jasmine.Spy) = mockSetDoc;
    (onSnapshot as jasmine.Spy) = mockOnSnapshot;

    spyOn(TimestampUtil, 'convertFirestoreDocument').and.callFake(
      (data) => data
    );
    spyOn(TimestampUtil, 'prepareForFirestore').and.callFake((data) => data);
  });

  describe('Service Initialization', () => {
    it('should be created', () => {
      service = TestBed.inject(ConfigService);
      expect(service).toBeTruthy();
    });

    it('should initialize config document reference', () => {
      service = TestBed.inject(ConfigService);
      expect(mockDoc).toHaveBeenCalledWith(mockFirestore, 'config/points');
    });

    it('should set up real-time listener on initialization', () => {
      service = TestBed.inject(ConfigService);
      expect(mockOnSnapshot).toHaveBeenCalled();
    });
  });

  describe('Real-time Configuration Updates', () => {
    beforeEach(() => {
      service = TestBed.inject(ConfigService);
    });

    it('should update config when document exists', () => {
      mockDocumentSnapshot.exists.and.returnValue(true);
      mockDocumentSnapshot.data.and.returnValue(testConfig);

      const snapshotCallback = mockOnSnapshot.calls.mostRecent().args[1];
      snapshotCallback(mockDocumentSnapshot);

      expect(TimestampUtil.convertFirestoreDocument).toHaveBeenCalledWith(
        testConfig
      );
      expect(service.getCurrentConfig()).toEqual(testConfig);
    });

    it('should initialize default config when document does not exist', () => {
      mockDocumentSnapshot.exists.and.returnValue(false);
      mockSetDoc.and.returnValue(Promise.resolve());

      const snapshotCallback = mockOnSnapshot.calls.mostRecent().args[1];
      snapshotCallback(mockDocumentSnapshot);

      expect(mockSetDoc).toHaveBeenCalled();
    });

    it('should handle snapshot errors gracefully', () => {
      spyOn(console, 'error');

      const errorCallback = mockOnSnapshot.calls.mostRecent().args[2];
      errorCallback(new Error('Snapshot error'));

      expect(console.error).toHaveBeenCalledWith(
        'Error listening to config changes:',
        jasmine.any(Error)
      );
      expect(service.getCurrentConfig()).toEqual(defaultConfig);
    });
  });

  describe('getPointsConfig', () => {
    beforeEach(() => {
      service = TestBed.inject(ConfigService);
    });

    it('should return config when document exists', async () => {
      mockDocumentSnapshot.exists.and.returnValue(true);
      mockDocumentSnapshot.data.and.returnValue(testConfig);
      mockGetDoc.and.returnValue(Promise.resolve(mockDocumentSnapshot));

      const result = await service.getPointsConfig();

      expect(mockGetDoc).toHaveBeenCalledWith('mock-doc-ref');
      expect(TimestampUtil.convertFirestoreDocument).toHaveBeenCalledWith(
        testConfig
      );
      expect(result).toEqual(testConfig);
    });

    it('should initialize and return default config when document does not exist', async () => {
      mockDocumentSnapshot.exists.and.returnValue(false);
      mockGetDoc.and.returnValue(Promise.resolve(mockDocumentSnapshot));
      mockSetDoc.and.returnValue(Promise.resolve());

      const result = await service.getPointsConfig();

      expect(mockSetDoc).toHaveBeenCalled();
      expect(result).toEqual(defaultConfig);
    });

    it('should return default config on error', async () => {
      spyOn(console, 'error');
      mockGetDoc.and.returnValue(Promise.reject(new Error('Firestore error')));

      const result = await service.getPointsConfig();

      expect(console.error).toHaveBeenCalledWith(
        'Error getting points config:',
        jasmine.any(Error)
      );
      expect(result).toEqual(defaultConfig);
    });
  });

  describe('updatePointsConfig', () => {
    beforeEach(() => {
      service = TestBed.inject(ConfigService);
      spyOn(service, 'recalculateAllHappiness').and.returnValue(
        Promise.resolve()
      );
    });

    it('should update config successfully', async () => {
      mockSetDoc.and.returnValue(Promise.resolve());

      const result = await service.updatePointsConfig(testConfig);

      expect(TimestampUtil.prepareForFirestore).toHaveBeenCalledWith(
        testConfig
      );
      expect(mockSetDoc).toHaveBeenCalledWith('mock-doc-ref', testConfig);
      expect(service.recalculateAllHappiness).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('should handle update errors', async () => {
      spyOn(console, 'error');
      mockSetDoc.and.returnValue(Promise.reject(new Error('Update error')));

      const result = await service.updatePointsConfig(testConfig);

      expect(console.error).toHaveBeenCalledWith(
        'Error updating points config:',
        jasmine.any(Error)
      );
      expect(result).toBe(false);
    });
  });

  describe('initializeDefaultConfig', () => {
    beforeEach(() => {
      service = TestBed.inject(ConfigService);
    });

    it('should initialize default config successfully', async () => {
      mockSetDoc.and.returnValue(Promise.resolve());

      await service.initializeDefaultConfig();

      expect(TimestampUtil.prepareForFirestore).toHaveBeenCalledWith(
        defaultConfig
      );
      expect(mockSetDoc).toHaveBeenCalledWith('mock-doc-ref', defaultConfig);
      expect(service.getCurrentConfig()).toEqual(defaultConfig);
    });

    it('should handle initialization errors', async () => {
      spyOn(console, 'error');
      mockSetDoc.and.returnValue(Promise.reject(new Error('Init error')));

      await service.initializeDefaultConfig();

      expect(console.error).toHaveBeenCalledWith(
        'Error initializing default config:',
        jasmine.any(Error)
      );
      expect(service.getCurrentConfig()).toEqual(defaultConfig);
    });
  });

  describe('recalculateAllHappiness', () => {
    beforeEach(() => {
      service = TestBed.inject(ConfigService);
    });

    it('should trigger happiness recalculation', async () => {
      spyOn(console, 'log');

      await service.recalculateAllHappiness();

      expect(console.log).toHaveBeenCalledWith(
        'Triggering happiness recalculation due to config change...'
      );
    });

    it('should handle recalculation errors', async () => {
      spyOn(console, 'error');
      spyOn(console, 'log').and.throwError('Test error');

      await service.recalculateAllHappiness();

      expect(console.error).toHaveBeenCalledWith(
        'Error triggering happiness recalculation:',
        jasmine.any(Error)
      );
    });
  });

  describe('getCurrentConfig and getConfigValue', () => {
    beforeEach(() => {
      service = TestBed.inject(ConfigService);
    });

    it('should return current config value', () => {
      service['configSubject'].next(testConfig);
      expect(service.getCurrentConfig()).toEqual(testConfig);
    });

    it('should return null when no config is set', () => {
      service['configSubject'].next(null);
      expect(service.getCurrentConfig()).toBeNull();
    });

    it('should return current config or default in getConfigValue', () => {
      service['configSubject'].next(testConfig);
      expect(service.getConfigValue()).toEqual(testConfig);
    });

    it('should return default config when current is null in getConfigValue', () => {
      service['configSubject'].next(null);
      expect(service.getConfigValue()).toEqual(defaultConfig);
    });
  });

  describe('Observable Config Stream', () => {
    beforeEach(() => {
      service = TestBed.inject(ConfigService);
    });

    it('should emit config changes', (done) => {
      let emissionCount = 0;
      const expectedConfigs = [null, testConfig];

      service.config$.subscribe((config) => {
        expect(config).toEqual(expectedConfigs[emissionCount]);
        emissionCount++;

        if (emissionCount === expectedConfigs.length) {
          done();
        }
      });

      service['configSubject'].next(testConfig);
    });

    it('should be a BehaviorSubject (emit current value to new subscribers)', () => {
      service['configSubject'].next(testConfig);

      service.config$.subscribe((config) => {
        expect(config).toEqual(testConfig);
      });
    });
  });
});
