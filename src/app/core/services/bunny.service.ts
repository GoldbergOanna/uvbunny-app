import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  onSnapshot,
  Timestamp,
  DocumentData,
  QuerySnapshot,
} from '@angular/fire/firestore';
import { BehaviorSubject, Observable, map, catchError, of } from 'rxjs';
import { Bunny } from '../models/bunny.model';


@Injectable({  providedIn: 'root',})
export class BunnyService {
  private firestore: Firestore = inject(Firestore);
  private bunniesCollection = collection(this.firestore, 'bunnies');
  private bunniesSubject = new BehaviorSubject<Bunny[]>([]);
  public bunnies$: Observable<Bunny[]> = this.bunniesSubject.asObservable();

  constructor() {
    this.loadBunnies();
  }

  private loadBunnies(): void {
    const q = query(this.bunniesCollection);
    onSnapshot(q, (snapshot: QuerySnapshot<DocumentData>) => {
      const bunnies: Bunny[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Bunny[];
      this.bunniesSubject.next(bunnies);
    });
  }

  public async addBunny(bunny: Bunny): Promise<void> {
    await addDoc(this.bunniesCollection, { ...bunny, createdAt: Timestamp.now(), updatedAt: Timestamp.now() });
  }

  public async updateBunny(bunny: Bunny): Promise<void> {
    const bunnyDoc = doc(this.firestore, `bunnies/${bunny.id}`);
    await updateDoc(bunnyDoc, { ...bunny, updatedAt: Timestamp.now() });
  }

  public async deleteBunny(bunnyId: string): Promise<void> {
    const bunnyDoc = doc(this.firestore, `bunnies/${bunnyId}`);
    await deleteDoc(bunnyDoc);
  }

  public getBunnyById(bunnyId: string): Observable<Bunny | null> {
    const bunnyDoc = doc(this.firestore, `bunnies/${bunnyId}`);
    return new Observable<Bunny | null>(observer => {
      const unsubscribe = onSnapshot(bunnyDoc, (doc) => {
        if (doc.exists()) {
          observer.next({ id: doc.id, ...doc.data() } as Bunny);
        } else {
          observer.next(null);
        }
      }, error => {
        observer.error(error);
      });

      return () => unsubscribe();
    });
  }

}
