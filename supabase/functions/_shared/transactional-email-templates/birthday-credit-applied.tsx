import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Text, Hr, Section,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

interface BirthdayCreditAppliedProps {
  hours?: number
  contextLabel?: string
}

const BirthdayCreditAppliedEmail = ({ hours, contextLabel }: BirthdayCreditAppliedProps) => (
  <Html lang="fr" dir="ltr">
    <Head />
    <Preview>🎉 Crédit anniversaire ajouté à votre compteur (+{hours}h)</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>🎉 Crédit anniversaire</Heading>
        <Text style={text}>
          Votre anniversaire tombait un <strong>{contextLabel ?? 'jour non travaillé'}</strong>.
        </Text>
        <Section style={highlight}>
          <Text style={highlightText}>
            +{hours ?? 0}h ajoutées à votre compteur
          </Text>
        </Section>
        <Text style={text}>
          Vous pouvez utiliser ce crédit quand vous le souhaitez en accord avec votre planning,
          pour ne pas perdre votre journée offerte.
        </Text>
        <Hr style={hr} />
        <Text style={footer}>— L'équipe RH Help Confort</Text>
        <Text style={footer}>
          Cette opération est tracée dans le journal d'audit. En cas de question, contactez votre responsable.
        </Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: BirthdayCreditAppliedEmail,
  subject: (d: Record<string, any>) => `🎉 Crédit anniversaire (+${d.hours ?? 0}h)`,
  displayName: 'Anniversaire — crédit appliqué',
  previewData: { hours: 7, contextLabel: 'week-end' },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: "'Montserrat', Arial, sans-serif" }
const container = { padding: '30px 25px', maxWidth: '560px', margin: '0 auto' }
const h1 = { fontSize: '22px', fontWeight: 'bold' as const, color: '#ea580c', margin: '0 0 20px' }
const text = { fontSize: '15px', color: '#2a3a4a', lineHeight: '1.6', margin: '0 0 16px' }
const highlight = {
  backgroundColor: '#fff7ed',
  border: '1px solid #fdba74',
  borderRadius: '8px',
  padding: '16px',
  margin: '16px 0',
  textAlign: 'center' as const,
}
const highlightText = { fontSize: '20px', fontWeight: 'bold' as const, color: '#ea580c', margin: 0 }
const hr = { borderColor: '#e5e7eb', margin: '24px 0' }
const footer = { fontSize: '13px', color: '#8899aa', margin: '0 0 8px' }
