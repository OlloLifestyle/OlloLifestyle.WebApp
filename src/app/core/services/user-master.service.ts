import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { defer, of, throwError } from 'rxjs';
import { catchError, delay, finalize, tap } from 'rxjs/operators';

import { Company } from '../models/auth.models';
import {
  UserProfile,
  UserRole,
  UserTimelineEvent,
  UserUpsertPayload,
  UserInsight,
  TrendDirection
} from '../models/user-master.models';
import { ConfigService } from './config.service';

@Injectable({
  providedIn: 'root'
})
export class UserMasterService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(ConfigService);

  private readonly roleCatalog = this.seedRoles();
  private readonly companyCatalog = this.seedCompanies();

  private readonly rolesSignal = signal<UserRole[]>(this.roleCatalog);
  private readonly companiesSignal = signal<Company[]>(this.companyCatalog);
  private readonly usersSignal = signal<UserProfile[]>(this.seedUsers(this.roleCatalog, this.companyCatalog));
  private readonly isLoadingSignal = signal(false);

  readonly users = this.usersSignal.asReadonly();
  readonly roles = this.rolesSignal.asReadonly();
  readonly companies = this.companiesSignal.asReadonly();
  readonly isLoading = this.isLoadingSignal.asReadonly();

  /**
   * Example hook for real API integration.
   * Falls back to the local dataset if the backend is not reachable yet.
   */
  syncWithApi() {
    const endpoint = this.config.buildApiUrl('users');
    this.isLoadingSignal.set(true);

    return this.http.get<UserProfile[]>(endpoint).pipe(
      tap(users => this.usersSignal.set(users)),
      catchError(error => {
        console.warn('UserMasterService.syncWithApi fallback to local dataset', error);
        return of(this.usersSignal());
      }),
      finalize(() => this.isLoadingSignal.set(false))
    );
  }

  createUser(payload: UserUpsertPayload) {
    return defer(() => {
      const newUser = this.mapPayloadToUser(this.generateUserId(), payload);
      this.usersSignal.update(users => [newUser, ...users]);
      return of(newUser).pipe(delay(320));
    });
  }

  updateUser(userId: number, payload: UserUpsertPayload) {
    return defer(() => {
      const existingUser = this.usersSignal().find(user => user.id === userId);
      if (!existingUser) {
        return throwError(() => new Error('User not found'));
      }

      const updatedUser = this.mapPayloadToUser(userId, payload, existingUser);
      this.usersSignal.update(users => users.map(user => (user.id === userId ? updatedUser : user)));
      return of(updatedUser).pipe(delay(260));
    });
  }

  deleteUser(userId: number) {
    return defer(() => {
      const exists = this.usersSignal().some(user => user.id === userId);
      if (!exists) {
        return throwError(() => new Error('User not found'));
      }

      this.usersSignal.update(users => users.filter(user => user.id !== userId));
      return of(userId).pipe(delay(180));
    });
  }

  private mapPayloadToUser(id: number, payload: UserUpsertPayload, base?: UserProfile): UserProfile {
    const roles = this.rolesSignal().filter(role => payload.roleIds.includes(role.id));
    const companies = this.companiesSignal().filter(company => payload.companyIds.includes(company.id));
    const now = new Date().toISOString();

    return {
      id,
      userName: payload.userName,
      firstName: payload.firstName,
      lastName: payload.lastName,
      fullName: `${payload.firstName} ${payload.lastName}`.trim(),
      isActive: payload.isActive,
      headline: base?.headline ?? 'Strategic contributor across journeys',
      location: base?.location ?? 'Remote • Flexible timezone',
      timezone: base?.timezone ?? 'GMT+5:30',
      heroTagline: base?.heroTagline ?? 'Creates calm, resilient systems for modern teams.',
      playbookStage: base?.playbookStage ?? 'Launch',
      avatarAccent: base?.avatarAccent ?? this.avatarPalette[(id - 1) % this.avatarPalette.length],
      lastLoginAt: base?.lastLoginAt ?? now,
      createdAt: base?.createdAt ?? now,
      roles,
      companies,
      insights: base?.insights ?? this.generateInsights(id),
      timeline: base?.timeline ?? this.generateTimeline(payload.userName),
      badges: base?.badges ?? ['New profile', 'Awaiting welcome ritual'],
      favoriteActions: base?.favoriteActions ?? ['Send welcome packet', 'Request security review']
    };
  }

  private generateUserId(): number {
    const ids = this.usersSignal().map(user => user.id);
    return ids.length ? Math.max(...ids) + 1 : 1;
  }

  private seedRoles(): UserRole[] {
    return [
      {
        id: 1,
        name: 'Administrator',
        description: 'Full visibility and governance access across the workspace.',
        isSystemRole: true,
        accentColor: '#7c3aed'
      },
      {
        id: 2,
        name: 'People Operations',
        description: 'Can shape rituals, schedules, and wellbeing programs.',
        isSystemRole: false,
        accentColor: '#ec4899'
      },
      {
        id: 3,
        name: 'Finance Controller',
        description: 'Owns billing, forecasting, and runway guardrails.',
        isSystemRole: false,
        accentColor: '#f59e0b'
      },
      {
        id: 4,
        name: 'Creator Studio',
        description: 'Publishes stories, playbooks, and campaign assets.',
        isSystemRole: false,
        accentColor: '#0ea5e9'
      },
      {
        id: 5,
        name: 'Viewer',
        description: 'Read-only access with personalized dashboards.',
        isSystemRole: true,
        accentColor: '#22c55e'
      }
    ];
  }

  private seedCompanies(): Company[] {
    return [
      { id: 1, name: 'OLLO Lifestyle', isActive: true },
      { id: 2, name: 'OLLO Wellness', isActive: true },
      { id: 3, name: 'OLLO Retail', isActive: true },
      { id: 4, name: 'OLLO Labs', isActive: false }
    ];
  }

  private seedUsers(roles: UserRole[], companies: Company[]): UserProfile[] {
    const pickRoles = (...names: string[]) => roles.filter(role => names.includes(role.name));
    const pickCompanies = (...names: string[]) => companies.filter(company => names.includes(company.name));

    return [
      {
        id: 1,
        userName: 'amelia.rivers@ollo.com',
        firstName: 'Amelia',
        lastName: 'Rivers',
        fullName: 'Amelia Rivers',
        isActive: true,
        headline: 'Head of Product Transformation',
        location: 'Lisbon, PT',
        timezone: 'GMT+1',
        heroTagline: 'Designs calm, resilient experiences for the wellness market.',
        playbookStage: 'Scale',
        avatarAccent: 'linear-gradient(135deg, #6366f1, #a855f7)',
        lastLoginAt: '2025-11-13T09:40:51.703Z',
        createdAt: '2024-02-18T10:25:00.000Z',
        roles: pickRoles('Administrator', 'People Operations'),
        companies: pickCompanies('OLLO Lifestyle', 'OLLO Wellness'),
        insights: [
          { id: 'activation', label: 'Activation', value: '92%', trend: 'up', delta: 6 },
          { id: 'cadence', label: 'Cadence Health', value: 'Weekly sprint', trend: 'steady', delta: 0 },
          { id: 'sentiment', label: 'Sentiment', value: '+18 NPS', trend: 'up', delta: 4 }
        ],
        timeline: [
          {
            id: 'a1',
            title: 'Published calm rituals kit',
            description: 'Shared a 4-week mindful leadership loop.',
            timestamp: '2025-11-12T14:12:00.000Z',
            icon: 'fas fa-seedling',
            tone: 'success'
          },
          {
            id: 'a2',
            title: 'Governance review passed',
            description: 'Aligned security scopes with OLLO Labs.',
            timestamp: '2025-11-04T08:33:00.000Z',
            icon: 'fas fa-shield-check',
            tone: 'info'
          },
          {
            id: 'a3',
            title: 'Hosted intent workshop',
            description: 'Facilitated a 30-person future framing session.',
            timestamp: '2025-10-28T18:05:00.000Z',
            icon: 'fas fa-people-group',
            tone: 'success'
          }
        ],
        badges: ['Voice of customer', 'Pilot architect'],
        favoriteActions: ['Share executive digest', 'Launch wellness ritual']
      },
      {
        id: 2,
        userName: 'devan.patel@ollo.com',
        firstName: 'Devan',
        lastName: 'Patel',
        fullName: 'Devan Patel',
        isActive: true,
        headline: 'Principal Systems Designer',
        location: 'Bengaluru, IN',
        timezone: 'GMT+5:30',
        heroTagline: 'Connects data, insights, and storytelling for every launch.',
        playbookStage: 'Pulse',
        avatarAccent: 'linear-gradient(135deg, #0ea5e9, #6366f1)',
        lastLoginAt: '2025-11-13T05:22:31.123Z',
        createdAt: '2023-11-09T07:18:00.000Z',
        roles: pickRoles('Creator Studio', 'Administrator'),
        companies: pickCompanies('OLLO Lifestyle', 'OLLO Retail'),
        insights: [
          { id: 'activation', label: 'Activation', value: '88%', trend: 'up', delta: 3 },
          { id: 'cadence', label: 'Cadence Health', value: 'Bi-weekly', trend: 'up', delta: 1 },
          { id: 'sentiment', label: 'Sentiment', value: '+12 NPS', trend: 'steady', delta: 0 }
        ],
        timeline: [
          {
            id: 'd1',
            title: 'Deployed creator studio v2',
            description: 'Unlocked live collaboration for ritual kits.',
            timestamp: '2025-11-10T10:05:00.000Z',
            icon: 'fas fa-bolt',
            tone: 'success'
          },
          {
            id: 'd2',
            title: 'Finance sync completed',
            description: 'Aligned budget guardrails with finance.',
            timestamp: '2025-11-08T06:40:00.000Z',
            icon: 'fas fa-coins',
            tone: 'info'
          },
          {
            id: 'd3',
            title: 'Launched story kit',
            description: 'Shared a new founder narrative deck.',
            timestamp: '2025-10-29T17:15:00.000Z',
            icon: 'fas fa-feather',
            tone: 'success'
          }
        ],
        badges: ['Flow architect', 'Realtime co-creation'],
        favoriteActions: ['Push live update', 'Export storyboard']
      },
      {
        id: 3,
        userName: 'lucia.rojas@ollo.com',
        firstName: 'Lucia',
        lastName: 'Rojas',
        fullName: 'Lucia Rojas',
        isActive: false,
        headline: 'Finance Flow Partner',
        location: 'Mexico City, MX',
        timezone: 'GMT-6',
        heroTagline: 'Keeps every launch grounded in mindful forecasting.',
        playbookStage: 'Align',
        avatarAccent: 'linear-gradient(135deg, #f97316, #fb923c)',
        lastLoginAt: '2025-11-03T16:10:43.812Z',
        createdAt: '2024-05-21T12:10:00.000Z',
        roles: pickRoles('Finance Controller', 'Viewer'),
        companies: pickCompanies('OLLO Retail'),
        insights: [
          { id: 'activation', label: 'Activation', value: '64%', trend: 'down', delta: -3 },
          { id: 'cadence', label: 'Cadence Health', value: 'Monthly', trend: 'steady', delta: 0 },
          { id: 'sentiment', label: 'Sentiment', value: '+4 NPS', trend: 'down', delta: -2 }
        ],
        timeline: [
          {
            id: 'l1',
            title: 'Paused spend alerts',
            description: 'Investigating duplicate vendor workflows.',
            timestamp: '2025-10-31T09:00:00.000Z',
            icon: 'fas fa-pause-circle',
            tone: 'warning'
          },
          {
            id: 'l2',
            title: 'Ran variance retro',
            description: 'Shared insights from Q3 runway projections.',
            timestamp: '2025-10-24T14:45:00.000Z',
            icon: 'fas fa-chart-line',
            tone: 'info'
          },
          {
            id: 'l3',
            title: 'Handoff w/ Labs',
            description: 'Coordinated labs tooling on spend transparency.',
            timestamp: '2025-10-16T11:15:00.000Z',
            icon: 'fas fa-handshake',
            tone: 'info'
          }
        ],
        badges: ['Variance pilot', 'Calm finance'],
        favoriteActions: ['Resume approvals', 'Share insights pack']
      },
      {
        id: 4,
        userName: 'marcus.chen@ollo.com',
        firstName: 'Marcus',
        lastName: 'Chen',
        fullName: 'Marcus Chen',
        isActive: true,
        headline: 'Experience Engineering Lead',
        location: 'Singapore, SG',
        timezone: 'GMT+8',
        heroTagline: 'Moves ideas from Figma to launch-ready realities.',
        playbookStage: 'Scale',
        avatarAccent: 'linear-gradient(135deg, #22d3ee, #3b82f6)',
        lastLoginAt: '2025-11-13T11:50:12.501Z',
        createdAt: '2022-09-02T05:55:00.000Z',
        roles: pickRoles('Administrator', 'Creator Studio'),
        companies: pickCompanies('OLLO Lifestyle', 'OLLO Labs'),
        insights: [
          { id: 'activation', label: 'Activation', value: '97%', trend: 'up', delta: 7 },
          { id: 'cadence', label: 'Cadence Health', value: 'Daily stand-ups', trend: 'up', delta: 2 },
          { id: 'sentiment', label: 'Sentiment', value: '+22 NPS', trend: 'up', delta: 5 }
        ],
        timeline: [
          {
            id: 'm1',
            title: 'Staged immersive story',
            description: 'Crafted the OLLO portal motion kit.',
            timestamp: '2025-11-11T07:45:00.000Z',
            icon: 'fas fa-cube',
            tone: 'success'
          },
          {
            id: 'm2',
            title: 'Latency audit completed',
            description: 'Improved creator studio load by 32%.',
            timestamp: '2025-11-05T19:20:00.000Z',
            icon: 'fas fa-gauge-high',
            tone: 'info'
          },
          {
            id: 'm3',
            title: 'Hosted maker circle',
            description: 'Mentored Labs team on storytelling.',
            timestamp: '2025-10-27T16:05:00.000Z',
            icon: 'fas fa-lightbulb',
            tone: 'success'
          }
        ],
        badges: ['Zero-to-one', 'Maker mentor'],
        favoriteActions: ['Start design review', 'Share sprint playlist']
      },
      {
        id: 5,
        userName: 'priya.nair@ollo.com',
        firstName: 'Priya',
        lastName: 'Nair',
        fullName: 'Priya Nair',
        isActive: true,
        headline: 'People Programs Partner',
        location: 'Dubai, AE',
        timezone: 'GMT+4',
        heroTagline: 'Keeps every ritual grounded in generosity and care.',
        playbookStage: 'Mature',
        avatarAccent: 'linear-gradient(135deg, #f472b6, #fb7185)',
        lastLoginAt: '2025-11-12T20:12:03.991Z',
        createdAt: '2023-04-14T09:20:00.000Z',
        roles: pickRoles('People Operations', 'Viewer'),
        companies: pickCompanies('OLLO Lifestyle'),
        insights: [
          { id: 'activation', label: 'Activation', value: '84%', trend: 'up', delta: 2 },
          { id: 'cadence', label: 'Cadence Health', value: 'Weekly circles', trend: 'up', delta: 1 },
          { id: 'sentiment', label: 'Sentiment', value: '+16 NPS', trend: 'steady', delta: 0 }
        ],
        timeline: [
          {
            id: 'p1',
            title: 'Rolled onboarding garden',
            description: 'Welcomed 42 teammates with guided rituals.',
            timestamp: '2025-11-09T09:15:00.000Z',
            icon: 'fas fa-hand-holding-heart',
            tone: 'success'
          },
          {
            id: 'p2',
            title: 'Care week curated',
            description: 'Partnered with Labs on pause practices.',
            timestamp: '2025-11-02T15:30:00.000Z',
            icon: 'fas fa-heart',
            tone: 'info'
          },
          {
            id: 'p3',
            title: 'Pulse survey drop',
            description: 'Shared week 45 belonging report.',
            timestamp: '2025-10-25T07:50:00.000Z',
            icon: 'fas fa-chart-pie',
            tone: 'info'
          }
        ],
        badges: ['Culture keeper', 'Belonging lead'],
        favoriteActions: ['Launch care ritual', 'Send gratitude kit']
      },
      {
        id: 6,
        userName: 'ethan.cole@ollo.com',
        firstName: 'Ethan',
        lastName: 'Cole',
        fullName: 'Ethan Cole',
        isActive: true,
        headline: 'Customer Listening Lead',
        location: 'Austin, US',
        timezone: 'GMT-5',
        heroTagline: 'Keeps the customer signal alive in every planning cycle.',
        playbookStage: 'Launch',
        avatarAccent: 'linear-gradient(135deg, #34d399, #22d3ee)',
        lastLoginAt: '2025-11-06T13:41:21.712Z',
        createdAt: '2024-08-30T13:05:00.000Z',
        roles: pickRoles('Viewer'),
        companies: pickCompanies('OLLO Wellness', 'OLLO Retail'),
        insights: [
          { id: 'activation', label: 'Activation', value: '78%', trend: 'steady', delta: 0 },
          { id: 'cadence', label: 'Cadence Health', value: 'Customer loops', trend: 'up', delta: 2 },
          { id: 'sentiment', label: 'Sentiment', value: '+9 NPS', trend: 'up', delta: 1 }
        ],
        timeline: [
          {
            id: 'e1',
            title: 'Shared weekly pulse',
            description: 'Delivered wellness member signal.',
            timestamp: '2025-11-07T12:25:00.000Z',
            icon: 'fas fa-wave-square',
            tone: 'info'
          },
          {
            id: 'e2',
            title: 'Aligned playbook assets',
            description: 'Synced with Priya on belonging voice.',
            timestamp: '2025-11-01T08:05:00.000Z',
            icon: 'fas fa-people-arrows',
            tone: 'success'
          },
          {
            id: 'e3',
            title: 'Hosted listening salon',
            description: 'Brought 12 partners into a care circle.',
            timestamp: '2025-10-22T10:45:00.000Z',
            icon: 'fas fa-ear-listen',
            tone: 'info'
          }
        ],
        badges: ['Signal first', 'Listening core'],
        favoriteActions: ['Share listening report', 'Invite to care loop']
      }
    ];
  }

  private generateInsights(seed?: number): UserInsight[] {
    const base = this.computeSeed(seed);
    const trend = (value: number): TrendDirection => {
      if (value % 5 === 0) {
        return 'steady';
      }
      return value % 2 === 0 ? 'up' : 'down';
    };

    return [
      {
        id: `engagement-${base}`,
        label: 'Engagement',
        value: `${70 + (base % 25)}%`,
        trend: trend(base),
        delta: (base % 7) - 2
      },
      {
        id: `rituals-${base}`,
        label: 'Ritual Cadence',
        value: `${2 + (base % 3)} / week`,
        trend: trend(base + 1),
        delta: (base % 5) - 1
      },
      {
        id: `sentiment-${base}`,
        label: 'Sentiment',
        value: `${(base % 20) - 5 >= 0 ? '+' : ''}${(base % 20) - 5} NPS`,
        trend: trend(base + 2),
        delta: (base % 4) - 1
      }
    ];
  }

  private generateTimeline(seedSource?: string): UserTimelineEvent[] {
    const base = this.computeSeed(seedSource);
    const now = Date.now();

    const templates = [
      {
        title: 'Workspace provisioned',
        description: 'Profile synced with governance policies.',
        icon: 'fas fa-user-shield',
        tone: 'success' as const
      },
      {
        title: 'Roles refreshed',
        description: 'Updated role blueprint and approvals.',
        icon: 'fas fa-layer-group',
        tone: 'info' as const
      },
      {
        title: 'Runway milestone',
        description: 'Captured momentum update for the team.',
        icon: 'fas fa-rocket',
        tone: 'success' as const
      }
    ];

    return templates.map((template, index) => ({
      id: `${seedSource ?? 'user'}-${index}`,
      title: template.title,
      description: template.description,
      timestamp: new Date(now - (index + 1) * (base % 6 + 1) * 86400000).toISOString(),
      icon: template.icon,
      tone: template.tone
    }));
  }

  private computeSeed(source?: string | number): number {
    if (typeof source === 'number') {
      return source;
    }
    if (!source) {
      return 0;
    }
    return Array.from(source).reduce((acc, char) => acc + char.charCodeAt(0), 0);
  }

  private readonly avatarPalette = [
    'linear-gradient(135deg, #6366f1, #a855f7)',
    'linear-gradient(135deg, #ec4899, #f472b6)',
    'linear-gradient(135deg, #f97316, #facc15)',
    'linear-gradient(135deg, #0ea5e9, #22d3ee)',
    'linear-gradient(135deg, #10b981, #06b6d4)',
    'linear-gradient(135deg, #f43f5e, #fb7185)'
  ];
}
