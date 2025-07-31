import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BunnyCardComponent } from './bunny-card.component';

describe('BunnyCardComponent', () => {
  let component: BunnyCardComponent;
  let fixture: ComponentFixture<BunnyCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BunnyCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BunnyCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
