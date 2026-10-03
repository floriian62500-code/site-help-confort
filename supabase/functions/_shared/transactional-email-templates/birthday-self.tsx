import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Text, Hr,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = 'Click & Clock'

interface BirthdaySelfProps {
  firstName?: string
}

const BirthdaySelfEmail = ({ firstName }: BirthdaySelfProps) => (
  <Html lang="fr" dir="ltr">
    <Head />
    <Preview>🎉 Joyeux anniversaire ! L'équipe Help Confort vous souhaite une excellente journée.</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>🎉 Joyeux anniversaire {firstName ? firstName : ''} !</Heading>
        <Text style={text}>
          Toute l'équipe Help Confort vous souhaite une merveilleuse journée 🎂
        </Text>
        <Text style={text}>
          Profitez bien de votre journée offerte par l'entreprise ! C'est notre façon de vous dire merci pour votre engagement.
        </Text>
        <Hr style={hr} />
        <Text style={footer}>— L'équipe Help Confort</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: BirthdaySelfEmail,
  subject: () => '🎉 Joyeux anniversaire !',
  displayName: 'Anniversaire — souhaits personnels',
  previewData: { firstName: 'Tony' },
} satisfies TemplateEntry

const main = { backgroundColor: '#fff7ed', fontFamily: "'Montserrat', Arial, sans-serif" }
const container = { padding: '30px 25px', maxWidth: '560px', margin: '0 auto' }
const h1 = { fontSize: '24px', fontWeight: 'bold' as const, color: '#ea580c', margin: '0 0 20px' }
const text = { fontSize: '15px', color: '#2a3a4a', lineHeight: '1.6', margin: '0 0 16px' }
const hr = { borderColor: '#fdba74', margin: '24px 0' }
const footer = { fontSize: '13px', color: '#8899aa', margin: '0 0 8px' }
