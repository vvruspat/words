import { Brevo, BrevoClient } from "@getbrevo/brevo";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

export enum MailTemplate {
	WELCOME = 1,
	RESET_PASSWORD = 2,
	CONFIRM_EMAIL = 3,
	TEMPORARY_PASSWORD = 5,
}

type MailOptions = {
	to: Brevo.SendTransacEmailRequest.To.Item[];
	sender?: Brevo.SendTransacEmailRequest.Sender;
	subject?: string;
	attachment?: Brevo.SendTransacEmailRequest.Attachment.Item[];
} & (
	| {
			templateId: MailTemplate.CONFIRM_EMAIL;
			params: {
				name: string;
				code: string;
			};
	  }
	| {
			templateId: MailTemplate.RESET_PASSWORD;
			params: {
				name?: string;
				link: string;
			};
	  }
	| {
			templateId: MailTemplate.WELCOME;
			params: {
				name: string;
			};
	  }
	| {
			templateId: MailTemplate.TEMPORARY_PASSWORD;
			params: {
				name: string;
				tmpPassword: string;
			};
	  }
);

@Injectable()
export class MailerService {
	constructor(private config: ConfigService) {}

	async sendMail({
		to,
		subject,
		params,
		sender,
		templateId,
		attachment,
	}: MailOptions): Promise<void> {
		const apiKey = this.config.get<string>("BREVO_API_KEY");
		if (!apiKey) {
			throw new Error("BREVO_API_KEY is not configured");
		}

		const client = new BrevoClient({ apiKey });

		await client.transactionalEmails.sendTransacEmail({
			sender,
			to,
			subject: subject,
			templateId,
			params: {
				...params,
			},
			attachment,
		});
	}
}
