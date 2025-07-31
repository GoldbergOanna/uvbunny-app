import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoadindStateComponent } from './loadind-state.component';

describe('LoadindStateComponent', () => {
  let component: LoadindStateComponent;
  let fixture: ComponentFixture<LoadindStateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoadindStateComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoadindStateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
