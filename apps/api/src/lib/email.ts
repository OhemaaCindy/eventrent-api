export interface EmailSender {
  sendMagicLink(email: string, link: string): Promise<void>;
  sendVerificationEmail(email: string, link: string): Promise<void>;
}

class ConsoleEmailSender implements EmailSender {
  async sendMagicLink(email: string, link: string): Promise<void> {
    console.log(`\n📧 Magic link for ${email}:\n${link}\n`);
  }

  async sendVerificationEmail(email: string, link: string): Promise<void> {
    console.log(`\n📧 Verify your email (${email}):\n${link}\n`);
  }
}

export const emailSender: EmailSender = new ConsoleEmailSender();