import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Text, Hr,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

interface BirthdayAdminDigestMonthlyProps {
  list?: string
  monthLabel?: string
  count?: number
}

const BirthdayAdminDigestMonthlyEmail = ({ list, monthLabel, count }: BirthdayAdminDigestMonthlyProps) => (
  <Html lang="fr" dir="ltr">
    <Head />
    <Preview>🎂 Anniversaires du mois {monthLabel ?? ''}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>🎂 Anniversaires du mois</Heading>
        <Text style={text}>
          {monthLabel ? `Mois de ${monthLabel}` : 'Ce mois-ci'}
          {typeof count === 'number' ? ` — ${count} anniversaire${count > 1 ? 's' : ''}` : ''}.
        </Text>
        <div style={listBox}>
          <pre style={pre}>{list ?? 'Aucun anniversaire ce mois-ci.'}</pre>
        </div>
        <Hr style={hr} />
        <Text style={footer}>
          Récapitulatif RH mensuel pour anticiper cartes, attentions et plannings d'équipe.
        </Text>
        <Text style={footer}>— Système RH Help Confort</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: BirthdayAdminDigestMonthlyEmail,
  subject: (d: Record<string, any>) =>
    d?.monthLabel ? `🎂 Anniversaires du mois — ${d.monthLabel}` : '🎂 Anniversaires du mois',
  displayName: 'Anniversaire — digest mensuel admin',
  previewData: {
    monthLabel: 'mai 2026',
    count: 3,
    list: '• Tony MACREL — lundi 12 mai\n• Johnny MUTTEZ — vendredi 16 mai\n• Sophie DUPONT — mardi 27 mai',
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: "'Montserrat', Arial, sans-serif" }
const container = { padding: '30px 25px', maxWidth: '560px', margin: '0 auto' }
const h1 = { fontSize: '22px', fontWeight: 'bold' as const, color: '#ea580c', margin: '0 0 20px' }
const text = { fontSize: '15px', color: '#2a3a4a', lineHeight: '1.6', margin: '0 0 16px' }
const listBox = {
  backgroundColor: '#fff7ed',
  border: '1px solid #fdba74',
  borderRadius: '8px',
  padding: '12px 16px',
  margin: '12px 0',
}
const pre = { fontFamily: 'inherit', whiteSpace: 'pre-wrap' as const, margin: 0, fontSize: '14px' }
const hr = { borderColor: '#e5e7eb', margin: '24px 0' }
const footer = { fontSize: '13px', color: '#8899aa', margin: '0 0 8px' }
