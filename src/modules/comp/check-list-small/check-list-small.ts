import {Component, Input, Output, EventEmitter, OnDestroy} from '@angular/core';
import {CommonModule} from '@angular/common';
import {Subject, Subscription, debounceTime, distinctUntilChanged} from 'rxjs';

export interface ChecklistStep
{
  id: number;
  title: string;
  completed: boolean;
  description: string;
}

@Component({
  selector: 'app-check-list-small',
  imports: [CommonModule],
  templateUrl: './check-list-small.html',
  styleUrl: './check-list-small.scss'
})
export class CheckListSmall implements OnDestroy
{
  @Input() steps: ChecklistStep[] = [
    {id: 1, title: '需求收集', completed: false, description: '与客户沟通需求细节'},
    {id: 2, title: 'UI设计', completed: false, description: '创建界面原型和视觉稿'},
    {id: 3, title: '开发实现', completed: false, description: '前端组件开发与集成'},
    {id: 4, title: '测试验证', completed: false, description: '功能测试与用户验收'},
    {id: 5, title: '部署上线', completed: false, description: '生产环境部署与监控'},
  ];

  @Output() stepChange = new EventEmitter<number>();

  currentStepId = 1;
  private lastCompletedIndex = -1;
  private clickSubject = new Subject<number>();
  private clickSubscription!: Subscription;

  constructor()
  {
    this.clickSubscription = this.clickSubject.pipe(
      distinctUntilChanged(),
      debounceTime(100)
    ).subscribe((stepId) =>
    {
      this.handleActualStepClick(stepId);
    });

    this.updateLastCompletedIndex();
  }

  ngOnDestroy()
  {
    this.clickSubscription.unsubscribe();
  }

  private updateLastCompletedIndex(): void
  {
    this.lastCompletedIndex = this.steps.reduce(
      (maxIndex, step, index) => step.completed ? index : maxIndex,
      -1
    );
  }

  isStepClickable(stepId: number): boolean
  {
    if (this.areAllStepsCompleted()) return true;

    const stepIndex = this.steps.findIndex(s => s.id === stepId);
    return stepIndex <= this.lastCompletedIndex + 1;
  }

  handleStepClick(stepId: number): void
  {
    if (this.isStepClickable(stepId))
    {
      this.clickSubject.next(stepId);
    }
  }

  private handleActualStepClick(stepId: number): void
  {
    this.currentStepId = stepId;
    this.stepChange.emit(stepId);
  }

  get currentStep()
  {
    return this.steps.find(s => s.id === this.currentStepId);
  }

  get canCompleteCurrentStep()
  {
    const currentStep = this.currentStep;
    return currentStep && !currentStep.completed;
  }

  completeCurrentStep(): void
  {
    const currentIndex = this.steps.findIndex(s => s.id === this.currentStepId);
    if (currentIndex === -1) return;

    this.steps[currentIndex].completed = true;

    if (currentIndex > this.lastCompletedIndex)
    {
      this.lastCompletedIndex = currentIndex;
    }

    this.stepChange.emit(this.currentStepId);

    if (currentIndex < this.steps.length - 1)
    {
      this.currentStepId = this.steps[currentIndex + 1].id;
      this.stepChange.emit(this.currentStepId);
    }
  }

  getStepStatusClass(step: ChecklistStep): string
  {
    return step.completed ? 'completed' : 'pending';
  }

  areAllStepsCompleted(): boolean
  {
    return this.steps.every(step => step.completed);
  }
}
