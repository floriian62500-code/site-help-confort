import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Text, Hr,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

interface BirthdayTeamProps {
  actorName?: string
}

const BirthdayTeamEmail = ({ actorName }: BirthdayTeamProps) => (
  <Html lang="fr" dir="ltr">
    <Head />
    <Preview>🎂 Aujourd'hui, c'est l'anniversaire de {actorName || 'un collègue'}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>🎂 Anniversaire d'équipe</Heading>
        <Text style={text}>
          Aujourd'hui, c'est l'anniversaire de <strong>{actorName || 'un collègue'}</strong> !
        </Text>
        <Text style={text}>
          Pensez à lui souhaiter une excellente journée 🎉
        </Text>
        <Hr style={hr} />
        <Text style={footer}>— Vie d'équipe Help Confort</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: BirthdayTeamEmail,
  subject: (d: Record<string, any>) => `🎂 Anniversaire — ${d.actorName ?? ''}`.trim(),
  displayName: 'Anniversaire — annonce équipe',
  previewData: { actorName: 'Tony MACREL' },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: "'Montserrat', Arial, sans-serif" }
const container = { padding: '30px 25px', maxWidth: '560px', margin: '0 auto' }
const h1 = { fontSize: '22px', fontWeight: 'bold' as const, color: '#ea580c', margin: '0 0 20px' }
const text = { fontSize: '15px', color: '#2a3a4a', lineHeight: '1.6', margin: '0 0 16px' }
const hr = { borderColor: '#e5e7eb', margin: '24px 0' }
const footer = { fontSize: '13px', color: '#8899aa', margin: '0 0 8px' }
