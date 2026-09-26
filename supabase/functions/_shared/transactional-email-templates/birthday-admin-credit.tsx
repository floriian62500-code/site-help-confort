import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Text, Hr,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

interface BirthdayAdminCreditProps {
  techName?: string
  hours?: number
  contextLabel?: string
}

const BirthdayAdminCreditEmail = ({ techName, hours, contextLabel }: BirthdayAdminCreditProps) => (
  <Html lang="fr" dir="ltr">
    <Head />
    <Preview>🎂 Crédit anniversaire automatique pour {techName} (+{hours}h)</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>🎂 Crédit anniversaire automatique</Heading>
        <Text style={text}>
          Le système RH événementiel vient d'appliquer un crédit anniversaire pour :
        </Text>
        <Text style={highlight}>
          <strong>{techName ?? 'un salarié'}</strong> — +{hours ?? 0}h
        </Text>
        <Text style={text}>
          Motif : anniversaire tombant un <strong>{contextLabel ?? 'jour non travaillé'}</strong>.
        </Text>
        <Hr style={hr} />
        <Text style={footer}>
          Cette opération est tracée dans le journal d'audit (action <code>hr_birthday_credit_granted</code>).
          Consultez le détail dans le module Audit Log.
        </Text>
        <Text style={footer}>— Système RH automatique</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: BirthdayAdminCreditEmail,
  subject: (d: Record<string, any>) => `🎂 Crédit anniversaire — ${d.techName ?? ''}`.trim(),
  displayName: 'Anniversaire — notif admin crédit',
  previewData: { techName: 'Tony MACREL', hours: 7, contextLabel: 'week-end' },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: "'Montserrat', Arial, sans-serif" }
const container = { padding: '30px 25px', maxWidth: '560px', margin: '0 auto' }
const h1 = { fontSize: '22px', fontWeight: 'bold' as const, color: '#0066B3', margin: '0 0 20px' }
const text = { fontSize: '15px', color: '#2a3a4a', lineHeight: '1.6', margin: '0 0 16px' }
const highlight = {
  fontSize: '18px',
  color: '#0066B3',
  textAlign: 'center' as const,
  backgroundColor: '#e6f2fa',
  border: '1px solid #0066B3',
  borderRadius: '8px',
  padding: '12px',
  margin: '16px 0',
}
const hr = { borderColor: '#e5e7eb', margin: '24px 0' }
const footer = { fontSize: '13px', color: '#8899aa', margin: '0 0 8px' }
