import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmContainerComponent } from './confirm-container.component';

describe('ConfirmContainerComponent', () => {
  let component: ConfirmContainerComponent;
  let fixture: ComponentFixture<ConfirmContainerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfirmContainerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConfirmContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
