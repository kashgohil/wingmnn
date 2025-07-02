export interface Header {
  name: string;
  value: string;
}

export interface MessagePartBody {
  attachmentId?: string;
  size: number;
  /**
   * base64 encoded data
   */
  data: string;
}

export interface MessagePart {
  partId: string;
  mimeType: string;
  filename?: string;
  headers?: Array<Header>;
  body?: MessagePartBody;
  parts?: Array<MessagePart>;
}

export interface Message {
  id: string;
  threadId?: string;
  labelIds?: string;
  snippet?: string;
  historyId?: string;
  internalDate?: string;
  payload?: MessagePart;
}

export interface MinifiedMessage {
  id: string;
  threadId?: string;
}

export interface EmailList {
  messages: Array<MinifiedMessage>;
  nextPageToken: string;
}
