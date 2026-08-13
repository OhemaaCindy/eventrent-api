export interface EmailSender {
  sendMagicLink(email: string, link: string): Promise<void>;
}

class ConsoleEmailSender implements EmailSender {
  async sendMagicLink(email: string, link: string): Promise<void> {
    console.log(`\n📧 Magic link for ${email}:\n${link}\n`);
  }
}

export const emailSender: EmailSender = new ConsoleEmailSender();