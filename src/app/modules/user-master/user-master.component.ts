import {
  Component,
  ChangeDetectionStrategy,
  ElementRef,
  ViewChild,
  DestroyRef,
  computed,
  effect,
  inject,
  signal,
  OnDestroy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import {
  animate,
  query,
  stagger,
  style,
  transition,
  trigger
} from '@angular/animations';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs/operators';
import lottie, { AnimationItem } from 'lottie-web';

import { NotificationService } from '../../core/services/notification.service';
import { UserMasterService } from '../../core/services/user-master.service';
import {
  TrendDirection,
  UserInsight,
  UserProfile,
  UserTimelineEvent
} from '../../core/models/user-master.models';
import { ConfigService } from '../../core/services/config.service';

@Component({
  selector: 'app-user-master',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './user-master.component.html',
  styleUrls: ['./user-master.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('fadeScale', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px) scale(0.98)' }),
        animate(
          '320ms cubic-bezier(0.16, 1, 0.3, 1)',
          style({ opacity: 1, transform: 'translateY(0) scale(1)' })
        )
      ]),
      transition(':leave', [
        animate(
          '200ms cubic-bezier(0.4, 0, 0.2, 1)',
          style({ opacity: 0, transform: 'translateY(-10px) scale(0.98)' })
        )
      ])
    ]),
    trigger('listStagger', [
      transition('* <=> *', [
        query(
          ':enter',
          [
            style({ opacity: 0, transform: 'translateY(10px)' }),
            stagger(
              45,
              animate(
                '260ms cubic-bezier(0.16, 1, 0.3, 1)',
                style({ opacity: 1, transform: 'translateY(0)' })
              )
            )
          ],
          { optional: true }
        )
      ])
    ])
  ]
})
export class UserMasterComponent implements OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly notification = inject(NotificationService);
  private readonly userMasterService = inject(UserMasterService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly config = inject(ConfigService);

  @ViewChild('emptyStateLottie')
  set emptyStateHost(element: ElementRef<HTMLDivElement> | undefined) {
    if (!element) {
      this.destroyEmptyStateAnimation();
      return;
    }
    this.buildEmptyStateAnimation(element);
  }

  private emptyStateAnimation?: AnimationItem;

  readonly users = this.userMasterService.users;
  readonly roles = this.userMasterService.roles;
  readonly companies = this.userMasterService.companies;

  readonly searchTerm = signal('');
  readonly isCreatingNew = signal(false);
  readonly selectedUserId = signal<number | null>(null);
  readonly isSaving = signal(false);

  readonly filteredUsers = computed(() => {
    const keyword = this.searchTerm().toLowerCase().trim();
    const dataset = [...this.users()].sort((a, b) =>
      b.lastLoginAt.localeCompare(a.lastLoginAt)
    );

    if (!keyword) {
      return dataset;
    }

    return dataset.filter(user =>
      this.buildSearchStack(user).includes(keyword.toLowerCase())
    );
  });

  readonly selectedUser = computed<UserProfile | null>(() => {
    const id = this.selectedUserId();
    if (!id) {
      return null;
    }

    return this.users().find(user => user.id === id) ?? null;
  });

  readonly userForm = this.fb.group({
    id: this.fb.control<number | null>(null),
    firstName: this.fb.nonNullable.control('', [
      Validators.required,
      Validators.minLength(2)
    ]),
    lastName: this.fb.nonNullable.control('', [
      Validators.required,
      Validators.minLength(2)
    ]),
    userName: this.fb.nonNullable.control('', [
      Validators.required,
      Validators.email
    ]),
    isActive: this.fb.nonNullable.control(true),
    roleIds: this.fb.nonNullable.control<number[]>([], [Validators.required]),
    companyIds: this.fb.nonNullable.control<number[]>([], [Validators.required])
  });

  constructor() {
    effect(() => {
      const filtered = this.filteredUsers();
      const creating = this.isCreatingNew();

      if (!filtered.length) {
        if (!creating) {
          this.selectedUserId.set(null);
        }
        return;
      }

      if (creating) {
        return;
      }

      const currentId = this.selectedUserId();
      const stillExists = filtered.some(user => user.id === currentId);

      if (!currentId || !stillExists) {
        this.selectedUserId.set(filtered[0].id);
      }
    });

    effect(() => {
      const creating = this.isCreatingNew();
      const user = this.selectedUser();

      if (creating) {
        this.resetForm();
        return;
      }

      if (user) {
        this.patchFormFromUser(user);
      }
    });
  }

  ngOnDestroy(): void {
    this.destroyEmptyStateAnimation();
  }

  trackUser(_index: number, user: UserProfile) {
    return user.id;
  }

  trackInsight(_index: number, insight: UserInsight) {
    return insight.id;
  }

  trackTimeline(_index: number, event: UserTimelineEvent) {
    return event.id;
  }

  trackAction(_index: number, action: string) {
    return action;
  }

  handleSearch(term: string) {
    this.searchTerm.set(term);
  }

  clearSearch() {
    this.searchTerm.set('');
  }

  selectUser(user: UserProfile) {
    if (this.selectedUserId() === user.id) {
      return;
    }

    this.isCreatingNew.set(false);
    this.selectedUserId.set(user.id);
  }

  startCreate() {
    this.isCreatingNew.set(true);
    this.selectedUserId.set(null);
    this.resetForm();
  }

  toggleRole(roleId: number) {
    this.toggleSelection('roleIds', roleId);
  }

  toggleCompany(companyId: number) {
    this.toggleSelection('companyIds', companyId);
  }

  isRoleSelected(roleId: number): boolean {
    return (this.userForm.get('roleIds')?.value ?? []).includes(roleId);
  }

  isCompanySelected(companyId: number): boolean {
    return (this.userForm.get('companyIds')?.value ?? []).includes(companyId);
  }

  setUserStatus(isActive: boolean) {
    this.userForm.get('isActive')?.setValue(isActive);
    this.userForm.get('isActive')?.markAsDirty();
  }

  getInitials(user: UserProfile) {
    return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
  }

  trendIcon(trend: TrendDirection) {
    switch (trend) {
      case 'up':
        return 'fas fa-arrow-trend-up text-emerald-300';
      case 'down':
        return 'fas fa-arrow-trend-down text-rose-300';
      default:
        return 'fas fa-wave-square text-slate-200';
    }
  }

  trendLabel(trend: TrendDirection) {
    switch (trend) {
      case 'up':
        return 'Momentum rising';
      case 'down':
        return 'Needs attention';
      default:
        return 'Holding steady';
    }
  }

  saveUser() {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      this.notification.warning(
        'Complete the required fields',
        'First name, last name, email, roles, and companies are mandatory.'
      );
      return;
    }

    const formValue = this.userForm.getRawValue();
    const payload = {
      firstName: formValue.firstName.trim(),
      lastName: formValue.lastName.trim(),
      userName: formValue.userName.trim(),
      isActive: formValue.isActive,
      roleIds: formValue.roleIds,
      companyIds: formValue.companyIds
    };

    const request$ = formValue.id
      ? this.userMasterService.updateUser(formValue.id, payload)
      : this.userMasterService.createUser(payload);

    this.isSaving.set(true);

    request$
      .pipe(
        finalize(() => this.isSaving.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: user => {
          this.notification.success(
            formValue.id ? 'Profile updated' : 'Profile created',
            `${user.fullName} is ${user.isActive ? 'live' : 'paused'} in the workspace.`
          );
          this.isCreatingNew.set(false);
          this.selectedUserId.set(user.id);
          this.patchFormFromUser(user);
        },
        error: (error: Error) => {
          this.notification.error(
            'Unable to save profile',
            error?.message ?? 'Please retry in a few seconds.'
          );
        }
      });
  }

  deleteUser() {
    const userId = this.userForm.get('id')?.value;
    const currentUser = this.selectedUser();

    if (!userId || !currentUser) {
      return;
    }

    const confirmed = confirm(
      `Archive ${currentUser.fullName}? Their access will be revoked immediately.`
    );

    if (!confirmed) {
      return;
    }

    this.isSaving.set(true);

    this.userMasterService
      .deleteUser(userId)
      .pipe(
        finalize(() => this.isSaving.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: () => {
          this.notification.info(
            'Profile archived',
            `${currentUser.fullName} no longer has workspace access.`
          );
          this.isCreatingNew.set(false);
          this.selectedUserId.set(null);
          this.resetForm();
        },
        error: (error: Error) => {
          this.notification.error(
            'Unable to archive profile',
            error?.message ?? 'Please try again later.'
          );
        }
      });
  }

  resetFormView() {
    const currentUser = this.selectedUser();
    if (this.isCreatingNew() || !currentUser) {
      this.resetForm();
      return;
    }
    this.patchFormFromUser(currentUser);
  }

  isFieldInvalid(field: 'firstName' | 'lastName' | 'userName' | 'roleIds' | 'companyIds') {
    const control = this.userForm.get(field);
    return !!control && control.invalid && (control.dirty || control.touched);
  }

  private toggleSelection(controlName: 'roleIds' | 'companyIds', value: number) {
    const control = this.userForm.get(controlName);
    if (!control) {
      return;
    }

    const currentValue = new Set<number>(control.value ?? []);

    if (currentValue.has(value)) {
      currentValue.delete(value);
    } else {
      currentValue.add(value);
    }

    control.setValue([...currentValue]);
    control.markAsDirty();
    control.markAsTouched();
  }

  private patchFormFromUser(user: UserProfile) {
    this.userForm.setValue({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      userName: user.userName,
      isActive: user.isActive,
      roleIds: user.roles.map(role => role.id),
      companyIds: user.companies.map(company => company.id)
    });

    this.userForm.markAsPristine();
    this.userForm.markAsUntouched();
  }

  private resetForm() {
    this.userForm.reset({
      id: null,
      firstName: '',
      lastName: '',
      userName: '',
      isActive: true,
      roleIds: [],
      companyIds: []
    });
    this.userForm.markAsPristine();
    this.userForm.markAsUntouched();
  }

  private buildSearchStack(user: UserProfile) {
    const roleNames = user.roles.map(role => role.name).join(' ');
    const companyNames = user.companies.map(company => company.name).join(' ');
    return `${user.fullName} ${user.userName} ${roleNames} ${companyNames} ${user.heroTagline} ${user.headline}`.toLowerCase();
  }

  private buildEmptyStateAnimation(element: ElementRef<HTMLDivElement>) {
    this.destroyEmptyStateAnimation();

    this.emptyStateAnimation = lottie.loadAnimation({
      container: element.nativeElement,
      renderer: 'svg',
      loop: true,
      autoplay: true,
      path: this.config.lottieAnimations.info
    });
  }

  private destroyEmptyStateAnimation() {
    this.emptyStateAnimation?.destroy();
    this.emptyStateAnimation = undefined;
  }
}
