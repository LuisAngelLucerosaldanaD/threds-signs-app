export interface IWorkflow {
  id: string;
  name: string;
  sender_name: string;
  sender_email: string;
  sender_zip_code: number;
  sender_cellphone: string;
  document_expiration: number;
  expiration_frequency: number;
  url_page_redirect: string;
  url_api_post: string;
  logo: string;
  user_id: string;
  attachments: IAttachment[];
  configuration: ISignatureConfig;
  notifications: ITemplateNotification[];
  reminders: ITemplateReminder[];
  created_at: string;
}


export interface IAttachment {
  id: string;
  workflow_id: string;
  name: string;
  required: boolean;
  format: number;
  type: number;
}

export interface ISignatureConfig {
  id: string;
  workflow_id: string;
  only_main_certificate: boolean;
  only_signers_certificate: boolean;
  without_signers: boolean;
}

export interface ITemplateNotification {
  id: string;
  workflow_id: string;
  subject: string;
  body: string;
  bcc: string;
  cc: string;
  channel: number;
  type: number;
}

export interface ITemplateReminder {
  id: string;
  workflow_id: string;
  subject: string;
  body: string;
  bcc: string;
  cc: string;
  type: number;
  frequency_reminder: number;
  frequency_id: number;
}
