import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddBunnyFormComponent } from './add-bunny-form.component';

describe('AddBunnyFormComponent', () => {
  let component: AddBunnyFormComponent;
  let fixture: ComponentFixture<AddBunnyFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddBunnyFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddBunnyFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
