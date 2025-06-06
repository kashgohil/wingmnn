import { getValidGoogleAccessToken } from "@auth/googleApi";

export class GmailService {
  async fetchEmailsPaginated(
    userId: string,
    pageToken?: string,
    maxResults = 50,
  ) {
    const accessToken = await getValidGoogleAccessToken(userId);

    const params = new URLSearchParams({
      maxResults: maxResults.toString(),
      ...(pageToken && { pageToken }),
    });

    const listResponse = await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages?${params}`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    );

    const data = await listResponse.json();

    // Batch fetch full messages
    const emailPromises =
      data.messages?.map(async (msg: any) => {
        const msgResponse = await fetch(
          `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}`,
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          },
        );
        return msgResponse.json();
      }) || [];

    const messages = await Promise.all(emailPromises);

    return {
      messages,
      nextPageToken: data.nextPageToken,
      resultSizeEstimate: data.resultSizeEstimate,
    };
  }

  async deleteEmail(userId: string, mailId: string) {
    const accessToken = await getValidGoogleAccessToken(userId);

    const response = await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages/${mailId}`,
      {
        method: "DELETE",
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    );

    if (!response.ok) {
      throw new Error(`Failed to delete email: ${response.statusText}`);
    }

    return { success: true };
  }

  async getEmailById(userId: string, mailId: string) {
    const accessToken = await getValidGoogleAccessToken(userId);

    const response = await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages/${mailId}`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch email: ${response.statusText}`);
    }

    return response.json();
  }

  async sendEmail(
    userId: string,
    to: string,
    subject: string,
    body: string,
    options?: {
      cc?: string[];
      bcc?: string[];
      inReplyTo?: string;
    },
  ) {
    const accessToken = await getValidGoogleAccessToken(userId);

    // Compose the email in RFC 2822 format
    let email = [
      `To: ${to}`,
      ...(options?.cc && options.cc.length > 0
        ? [`Cc: ${options.cc.join(", ")}`]
        : []),
      ...(options?.bcc && options.bcc.length > 0
        ? [`Bcc: ${options.bcc.join(", ")}`]
        : []),
      `Subject: ${subject}`,
      ...(options?.inReplyTo ? [`In-Reply-To: ${options.inReplyTo}`] : []),
      "Content-Type: text/html; charset=utf-8",
      "",
      body,
    ].join("\n");

    // Base64 encode the email
    const encodedEmail = Buffer.from(email)
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

    const response = await fetch(
      "https://gmail.googleapis.com/gmail/v1/users/me/messages/send",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          raw: encodedEmail,
        }),
      },
    );

    if (!response.ok) {
      throw new Error(`Failed to send email: ${response.statusText}`);
    }

    return response.json();
  }

  async reply(userId: string, originalMessageId: string, body: string) {
    // First get the original message to extract reply details
    const originalMessage = await this.getEmailById(userId, originalMessageId);

    const headers = originalMessage.payload.headers;
    const fromHeader = headers.find((h: any) => h.name === "From")?.value || "";
    const subjectHeader =
      headers.find((h: any) => h.name === "Subject")?.value || "";
    const messageIdHeader =
      headers.find((h: any) => h.name === "Message-ID")?.value || "";

    const replySubject = subjectHeader.startsWith("Re: ")
      ? subjectHeader
      : `Re: ${subjectHeader}`;

    return this.sendEmail(userId, fromHeader, replySubject, body, {
      inReplyTo: messageIdHeader,
    });
  }

  async createDraft(
    userId: string,
    to: string,
    subject: string,
    body: string,
    options?: {
      cc?: string[];
      bcc?: string[];
    },
  ) {
    const accessToken = await getValidGoogleAccessToken(userId);

    // Compose the email in RFC 2822 format
    const email = [
      `To: ${to}`,
      ...(options?.cc && options.cc.length > 0
        ? [`Cc: ${options.cc.join(", ")}`]
        : []),
      ...(options?.bcc && options.bcc.length > 0
        ? [`Bcc: ${options.bcc.join(", ")}`]
        : []),
      `Subject: ${subject}`,
      "Content-Type: text/html; charset=utf-8",
      "",
      body,
    ].join("\n");

    // Base64 encode the email
    const encodedEmail = Buffer.from(email)
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

    const response = await fetch(
      "https://gmail.googleapis.com/gmail/v1/users/me/drafts",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: {
            raw: encodedEmail,
          },
        }),
      },
    );

    if (!response.ok) {
      throw new Error(`Failed to create draft: ${response.statusText}`);
    }

    return response.json();
  }

  async updateDraft(
    userId: string,
    draftId: string,
    to: string,
    subject: string,
    body: string,
    options?: {
      cc?: string[];
      bcc?: string[];
    },
  ) {
    const accessToken = await getValidGoogleAccessToken(userId);

    // Compose the email in RFC 2822 format
    const email = [
      `To: ${to}`,
      ...(options?.cc && options.cc.length > 0
        ? [`Cc: ${options.cc.join(", ")}`]
        : []),
      ...(options?.bcc && options.bcc.length > 0
        ? [`Bcc: ${options.bcc.join(", ")}`]
        : []),
      `Subject: ${subject}`,
      "Content-Type: text/html; charset=utf-8",
      "",
      body,
    ].join("\n");

    // Base64 encode the email
    const encodedEmail = Buffer.from(email)
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

    const response = await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/drafts/${draftId}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: {
            raw: encodedEmail,
          },
        }),
      },
    );

    if (!response.ok) {
      throw new Error(`Failed to update draft: ${response.statusText}`);
    }

    return response.json();
  }

  async deleteDraft(userId: string, draftId: string) {
    const accessToken = await getValidGoogleAccessToken(userId);

    const response = await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/drafts/${draftId}`,
      {
        method: "DELETE",
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    );

    if (!response.ok) {
      throw new Error(`Failed to delete draft: ${response.statusText}`);
    }

    return { success: true };
  }

  async sendDraft(userId: string, draftId: string) {
    const accessToken = await getValidGoogleAccessToken(userId);

    const response = await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/drafts/${draftId}/send`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      },
    );

    if (!response.ok) {
      throw new Error(`Failed to send draft: ${response.statusText}`);
    }

    return response.json();
  }

  async fetchDraftsPaginated(
    userId: string,
    pageToken?: string,
    maxResults = 50,
  ) {
    const accessToken = await getValidGoogleAccessToken(userId);

    const params = new URLSearchParams({
      maxResults: maxResults.toString(),
      ...(pageToken && { pageToken }),
    });

    const response = await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/drafts?${params}`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch drafts: ${response.statusText}`);
    }

    const data = await response.json();

    // Batch fetch full draft messages
    const draftPromises =
      data.drafts?.map(async (draft: any) => {
        const draftResponse = await fetch(
          `https://gmail.googleapis.com/gmail/v1/users/me/drafts/${draft.id}`,
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          },
        );
        return draftResponse.json();
      }) || [];

    const drafts = await Promise.all(draftPromises);

    return {
      drafts,
      nextPageToken: data.nextPageToken,
      resultSizeEstimate: data.resultSizeEstimate,
    };
  }

  async markAsRead(userId: string, mailId: string) {
    const accessToken = await getValidGoogleAccessToken(userId);

    const response = await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages/${mailId}/modify`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          removeLabelIds: ["UNREAD"],
        }),
      },
    );

    if (!response.ok) {
      throw new Error(`Failed to mark as read: ${response.statusText}`);
    }

    return response.json();
  }

  async markAsUnread(userId: string, mailId: string) {
    const accessToken = await getValidGoogleAccessToken(userId);

    const response = await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages/${mailId}/modify`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          addLabelIds: ["UNREAD"],
        }),
      },
    );

    if (!response.ok) {
      throw new Error(`Failed to mark as unread: ${response.statusText}`);
    }

    return response.json();
  }

  async starEmail(userId: string, mailId: string) {
    const accessToken = await getValidGoogleAccessToken(userId);

    const response = await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages/${mailId}/modify`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          addLabelIds: ["STARRED"],
        }),
      },
    );

    if (!response.ok) {
      throw new Error(`Failed to star email: ${response.statusText}`);
    }

    return response.json();
  }

  async unstarEmail(userId: string, mailId: string) {
    const accessToken = await getValidGoogleAccessToken(userId);

    const response = await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages/${mailId}/modify`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          removeLabelIds: ["STARRED"],
        }),
      },
    );

    if (!response.ok) {
      throw new Error(`Failed to unstar email: ${response.statusText}`);
    }

    return response.json();
  }

  async archiveEmail(userId: string, mailId: string) {
    const accessToken = await getValidGoogleAccessToken(userId);

    const response = await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages/${mailId}/modify`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          removeLabelIds: ["INBOX"],
        }),
      },
    );

    if (!response.ok) {
      throw new Error(`Failed to archive email: ${response.statusText}`);
    }

    return response.json();
  }

  async unarchiveEmail(userId: string, mailId: string) {
    const accessToken = await getValidGoogleAccessToken(userId);

    const response = await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages/${mailId}/modify`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          addLabelIds: ["INBOX"],
        }),
      },
    );

    if (!response.ok) {
      throw new Error(`Failed to unarchive email: ${response.statusText}`);
    }

    return response.json();
  }

  async moveToTrash(userId: string, mailId: string) {
    const accessToken = await getValidGoogleAccessToken(userId);

    const response = await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages/${mailId}/trash`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    );

    if (!response.ok) {
      throw new Error(`Failed to move to trash: ${response.statusText}`);
    }

    return response.json();
  }

  async restoreFromTrash(userId: string, mailId: string) {
    const accessToken = await getValidGoogleAccessToken(userId);

    const response = await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages/${mailId}/untrash`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    );

    if (!response.ok) {
      throw new Error(`Failed to restore from trash: ${response.statusText}`);
    }

    return response.json();
  }

  async searchEmails(
    userId: string,
    query: string,
    pageToken?: string,
    maxResults = 50,
  ) {
    const accessToken = await getValidGoogleAccessToken(userId);

    const params = new URLSearchParams({
      q: query,
      maxResults: maxResults.toString(),
      ...(pageToken && { pageToken }),
    });

    const listResponse = await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages?${params}`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    );

    if (!listResponse.ok) {
      throw new Error(`Failed to search emails: ${listResponse.statusText}`);
    }

    const data = await listResponse.json();

    // Batch fetch full messages
    const emailPromises =
      data.messages?.map(async (msg: any) => {
        const msgResponse = await fetch(
          `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}`,
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          },
        );
        return msgResponse.json();
      }) || [];

    const messages = await Promise.all(emailPromises);

    return {
      messages,
      nextPageToken: data.nextPageToken,
      resultSizeEstimate: data.resultSizeEstimate,
    };
  }

  async getThread(userId: string, threadId: string) {
    const accessToken = await getValidGoogleAccessToken(userId);

    const response = await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/threads/${threadId}`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch thread: ${response.statusText}`);
    }

    return response.json();
  }

  async fetchThreadsPaginated(
    userId: string,
    pageToken?: string,
    maxResults = 50,
  ) {
    const accessToken = await getValidGoogleAccessToken(userId);

    const params = new URLSearchParams({
      maxResults: maxResults.toString(),
      ...(pageToken && { pageToken }),
    });

    const response = await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/threads?${params}`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch threads: ${response.statusText}`);
    }

    const data = await response.json();

    return {
      threads: data.threads || [],
      nextPageToken: data.nextPageToken,
      resultSizeEstimate: data.resultSizeEstimate,
    };
  }

  /**
   * Reply to all recipients of an email (including CC recipients)
   */
  async replyAll(userId: string, originalMessageId: string, body: string) {
    // First get the original message to extract reply details
    const originalMessage = await this.getEmailById(userId, originalMessageId);

    const headers = originalMessage.payload.headers;
    const fromHeader = headers.find((h: any) => h.name === "From")?.value || "";
    const toHeader = headers.find((h: any) => h.name === "To")?.value || "";
    const ccHeader = headers.find((h: any) => h.name === "Cc")?.value || "";
    const subjectHeader =
      headers.find((h: any) => h.name === "Subject")?.value || "";
    const messageIdHeader =
      headers.find((h: any) => h.name === "Message-ID")?.value || "";

    // Parse recipients from To and CC headers
    const allRecipients = new Set<string>();

    // Add original sender
    if (fromHeader) {
      allRecipients.add(this.extractEmailFromHeader(fromHeader));
    }

    // Add original To recipients (excluding our own email)
    if (toHeader) {
      const toEmails = this.parseEmailHeader(toHeader);
      toEmails.forEach((email) => {
        if (!this.isOwnEmail(email)) {
          allRecipients.add(email);
        }
      });
    }

    // Add original CC recipients (excluding our own email)
    if (ccHeader) {
      const ccEmails = this.parseEmailHeader(ccHeader);
      ccEmails.forEach((email) => {
        if (!this.isOwnEmail(email)) {
          allRecipients.add(email);
        }
      });
    }

    const recipients = Array.from(allRecipients);
    const primaryRecipient = recipients[0] || fromHeader;
    const ccRecipients = recipients.slice(1);

    const replySubject = subjectHeader.startsWith("Re: ")
      ? subjectHeader
      : `Re: ${subjectHeader}`;

    return this.sendEmail(userId, primaryRecipient, replySubject, body, {
      cc: ccRecipients.length > 0 ? ccRecipients : undefined,
      inReplyTo: messageIdHeader,
    });
  }

  /**
   * Send email with CC only (no BCC)
   */
  async sendEmailWithCC(
    userId: string,
    to: string,
    cc: string[],
    subject: string,
    body: string,
  ) {
    return this.sendEmail(userId, to, subject, body, { cc });
  }

  /**
   * Send email with BCC only (no CC)
   */
  async sendEmailWithBCC(
    userId: string,
    to: string,
    bcc: string[],
    subject: string,
    body: string,
  ) {
    return this.sendEmail(userId, to, subject, body, { bcc });
  }

  /**
   * Send email with both CC and BCC
   */
  async sendEmailWithCCAndBCC(
    userId: string,
    to: string,
    cc: string[],
    bcc: string[],
    subject: string,
    body: string,
  ) {
    return this.sendEmail(userId, to, subject, body, { cc, bcc });
  }

  /**
   * Forward an email to recipients with optional CC/BCC
   */
  async forwardEmail(
    userId: string,
    originalMessageId: string,
    to: string,
    forwardMessage: string,
    options?: {
      cc?: string[];
      bcc?: string[];
    },
  ) {
    // Get the original message
    const originalMessage = await this.getEmailById(userId, originalMessageId);

    const headers = originalMessage.payload.headers;
    const originalSubject =
      headers.find((h: any) => h.name === "Subject")?.value || "";
    const originalFrom =
      headers.find((h: any) => h.name === "From")?.value || "";
    const originalDate =
      headers.find((h: any) => h.name === "Date")?.value || "";
    const originalTo = headers.find((h: any) => h.name === "To")?.value || "";

    // Extract original body (simplified - in real implementation you'd parse the full message structure)
    const originalBody = this.extractEmailBody(originalMessage);

    const forwardSubject = originalSubject.startsWith("Fwd: ")
      ? originalSubject
      : `Fwd: ${originalSubject}`;

    const fullForwardBody = `
${forwardMessage}

---------- Forwarded message ---------
From: ${originalFrom}
Date: ${originalDate}
Subject: ${originalSubject}
To: ${originalTo}

${originalBody}
    `.trim();

    return this.sendEmail(userId, to, forwardSubject, fullForwardBody, options);
  }

  /**
   * Utility method to extract email address from a header value
   * Handles formats like "Name <email@domain.com>" or just "email@domain.com"
   */
  private extractEmailFromHeader(headerValue: string): string {
    const emailMatch = headerValue.match(/<([^>]+)>/);
    return emailMatch ? emailMatch[1] : headerValue.trim();
  }

  /**
   * Parse email header that may contain multiple email addresses
   */
  private parseEmailHeader(headerValue: string): string[] {
    return headerValue
      .split(",")
      .map((email) => this.extractEmailFromHeader(email.trim()))
      .filter((email) => email.length > 0);
  }

  /**
   * Check if an email address belongs to the current user
   * This is a simplified implementation - in practice you'd want to
   * fetch the user's email address from their profile
   */
  private isOwnEmail(email: string): boolean {
    // This should be implemented to check against the current user's email
    // For now, returning false to include all recipients
    return false;
  }

  /**
   * Extract email body from Gmail message structure
   * This is a simplified implementation
   */
  private extractEmailBody(message: any): string {
    // Simplified body extraction - in practice you'd need to handle
    // multipart messages, HTML vs text, etc.
    const payload = message.payload;

    if (payload.parts) {
      // Multipart message
      const textPart = payload.parts.find(
        (part: any) =>
          part.mimeType === "text/plain" || part.mimeType === "text/html",
      );
      if (textPart && textPart.body.data) {
        return Buffer.from(textPart.body.data, "base64").toString();
      }
    } else if (payload.body && payload.body.data) {
      // Simple message
      return Buffer.from(payload.body.data, "base64").toString();
    }

    return "[Original message body]";
  }
}
