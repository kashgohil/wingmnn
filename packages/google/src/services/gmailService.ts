import { db, eq, mailsTable, or, type NewMail } from "@wingmnn/db";
import { tryCatchAsync } from "@wingmnn/utils";
import type { EmailList, Message, MessagePart } from "../types";

const GMAIL_MESSAGE_URL = `https://www.googleapis.com/gmail/v1/users/me/messages`;

export class GmailService {
  async fetchEmailList(
    accessToken: string,
    pageToken?: string,
    maxResults: number = 100,
  ) {
    const urlParams = new URLSearchParams({
      maxResults: maxResults.toString(),
      ...(pageToken && { pageToken }),
    });

    const response = await fetch(`${GMAIL_MESSAGE_URL}?${urlParams}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to fetch email list: ${error}`);
    }

    return (await response.json()) as EmailList;
  }
  async fetchEmailContent(accessToken: string, messageId: string) {
    const response = await fetch(`${GMAIL_MESSAGE_URL}/${messageId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to fetch email content: ${error}`);
    }

    return (await response.json()) as Message;
  }

  adapt(mail: Message, userId: string) {
    const headers = mail.payload?.headers || [];

    function getHeader(name: string) {
      return (
        headers.find(
          (header) => header.name.toLowerCase() === name.toLowerCase(),
        )?.value || ""
      );
    }

    const body = this.extractBody(mail.payload);

    const cc = this.extractEmailAddresses(getHeader("cc"));
    const bcc = this.extractEmailAddresses(getHeader("bcc"));
    const to = this.extractEmailAddresses(getHeader("to"));
    const from = this.extractEmailAddresses(getHeader("from"));
    const subject = this.extractEmailAddresses(getHeader("subject"));

    const date = mail.internalDate
      ? new Date(parseInt(mail.internalDate))
      : new Date();

    return {
      createdBy: userId,
      updatedBy: userId,
      gmailId: mail.id,
      historyId: mail.historyId,
      date,
      body,
      cc,
      bcc,
      to: to[0],
      from: from[0],
      subject: subject[0],
      threadId: mail.threadId,
      snippet: mail.snippet,

      labelIds: mail.labelIds,
      attachments: [],
      userId,
    } as NewMail;
  }

  async persist(mails: NewMail[]) {
    const gmailIds = mails.map((mail) => mail.gmailId);

    const { result: existingEmails, error } = await tryCatchAsync(
      db
        .select({ gmailId: mailsTable.gmailId })
        .from(mailsTable)
        .where(or(...gmailIds.map((id) => eq(mailsTable.gmailId, id)))),
    );

    if (error) {
      throw new Error("Failed to fetch existing emails");
    }

    const existingMailIds = new Set(existingEmails.map((mail) => mail.gmailId));
    const newMails = mails.filter((mail) => !existingMailIds.has(mail.gmailId));

    const { result, error: insertError } = await tryCatchAsync(
      db.insert(mailsTable).values(newMails),
    );
    if (insertError) {
      throw new Error("Failed to insert new emails");
    }

    return result;
  }

  private extractBody(payload?: MessagePart): string {
    if (!payload) return "";

    if (payload.parts) {
      for (const part of payload.parts) {
        if (part.mimeType === "text/html" || part.mimeType === "text/plain") {
          if (part.body?.data) {
            return Buffer.from(part.body?.data, "base64").toString("utf-8");
          }
        }

        if (part.parts) {
          const nestedBody = this.extractBody(part);
          if (nestedBody) return nestedBody;
        }
      }
    }

    if (payload.body?.data) {
      return Buffer.from(payload.body?.data, "base64").toString("utf-8");
    } else {
      return "";
    }
  }

  private extractEmailAddresses(addressString: string): Array<string> {
    if (!addressString) return [];

    return addressString
      .split(",")
      .map((addr) => addr.trim())
      .filter(Boolean);
  }
}
