/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'

export interface TemplateEntry {
  component: React.ComponentType<any>
  subject: string | ((data: Record<string, any>) => string)
  to?: string
  displayName?: string
  previewData?: Record<string, any>
}

import { template as testNotification } from './test-notification.tsx'
import { template as birthdaySelf } from './birthday-self.tsx'
import { template as birthdayTeam } from './birthday-team.tsx'
import { template as birthdayCreditApplied } from './birthday-credit-applied.tsx'
import { template as birthdayAdminCredit } from './birthday-admin-credit.tsx'
import { template as birthdayAdminDigestWeekly } from './birthday-admin-digest-weekly.tsx'
import { template as birthdayAdminDigestMonthly } from './birthday-admin-digest-monthly.tsx'

export const TEMPLATES: Record<string, TemplateEntry> = {
  'test-notification': testNotification,

  // Chantier 7 — anniversaires / événements RH
  'birthday_self': birthdaySelf,
  'birthday_team': birthdayTeam,
  'birthday_credit_applied': birthdayCreditApplied,
  'birthday_admin_credit': birthdayAdminCredit,
  'birthday_admin_digest_weekly': birthdayAdminDigestWeekly,
  'birthday_admin_digest_monthly': birthdayAdminDigestMonthly,
}
