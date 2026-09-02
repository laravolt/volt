/**
 * Mailer abstraction. Console mailer by default; Resend when an API key is configured.
 */
export interface MailMessage {
  to: string
  subject: string
  text: string
}

export interface Mailer {
  send(message: MailMessage): Promise<void>
}

export class ConsoleMailer implements Mailer {
  async send(message: MailMessage) {
    console.log(`[mail] to=${message.to} subject="${message.subject}"\n${message.text}`)
  }
}

export class MemoryMailer implements Mailer {
  sent: MailMessage[] = []
  async send(message: MailMessage) {
    this.sent.push(message)
  }
}

export class ResendMailer implements Mailer {
  constructor(
    private apiKey: string,
    private from: string,
  ) {}
  async send(message: MailMessage) {
    let response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${this.apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: this.from, ...message }),
    })
    if (!response.ok) throw new Error(`Resend error ${response.status}: ${await response.text()}`)
  }
}
