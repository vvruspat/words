import {
	SendSmtpEmailAttachmentInner,
	SendSmtpEmailSender,
	SendSmtpEmailToInner,
	TransactionalEmailsApi,
} from "@getbrevo/brevo";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

export enum MailTemplate {
	WELCOME = 1,
	RESET_PASSWORD = 2,
	CONFIRM_EMAIL = 3,
}

type MailOptions = {
	to: SendSmtpEmailToInner[];
	sender?: SendSmtpEmailSender;
	subject?: string;
	attachment?: SendSmtpEmailAttachmentInner[];
} & (
	| {
			templateId: MailTemplate.CONFIRM_EMAIL;
			params: {
				name: string;
				link: string;
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
		const apiKey = this.config.get("BREVO_API_KEY");

		const apiInstance = new TransactionalEmailsApi();
		apiInstance.setApiKey(0, apiKey);

		await apiInstance.sendTransacEmail({
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
