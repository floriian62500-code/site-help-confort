import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Text, Hr,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = "Click & Clock"

interface TestNotificationProps {
  message?: string
}

const TestNotificationEmail = ({ message }: TestNotificationProps) => (
  <Html lang="fr" dir="ltr">
    <Head />
    <Preview>Notification test - {SITE_NAME}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>🔔 Notification de test</Heading>
        <Text style={text}>
          Ceci est une notification de test envoyée depuis {SITE_NAME}.
        </Text>
        {message && <Text style={text}>{message}</Text>}
        <Hr style={hr} />
        <Text style={footer}>
          Si vous recevez cet email, votre système de notifications fonctionne correctement.
        </Text>
        <Text style={footer}>— L'équipe {SITE_NAME}</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: TestNotificationEmail,
  subject: '🔔 Notification de test - Click & Clock',
  displayName: 'Test notification',
  previewData: { message: 'Ceci est un message de test.' },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: "'Montserrat', Arial, sans-serif" }
const container = { padding: '30px 25px', maxWidth: '560px', margin: '0 auto' }
const h1 = { fontSize: '22px', fontWeight: 'bold' as const, color: '#0066B3', margin: '0 0 20px' }
const text = { fontSize: '15px', color: '#2a3a4a', lineHeight: '1.6', margin: '0 0 16px' }
const hr = { borderColor: '#e5e7eb', margin: '24px 0' }
const footer = { fontSize: '13px', color: '#8899aa', margin: '0 0 8px' }
