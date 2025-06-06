import { test, expect, describe, beforeEach, afterEach, mock } from 'bun:test';
import { GmailService } from './gmailService';

// Mock the auth module
const mockGetValidGoogleAccessToken = mock(() => Promise.resolve('mock-access-token'));

// Mock the auth module import
mock.module('@auth/googleApi', () => ({
  getValidGoogleAccessToken: mockGetValidGoogleAccessToken,
}));

// Mock global fetch
const mockFetch = mock();
(global as any).fetch = mockFetch;

describe('GmailService', () => {
  let gmailService: GmailService;
  const mockUserId = 'test-user-id';
  const mockAccessToken = 'mock-access-token';
  const mockEmailId = 'test-email-id';
  const mockDraftId = 'test-draft-id';
  const mockThreadId = 'test-thread-id';

  beforeEach(() => {
    gmailService = new GmailService();
    mockGetValidGoogleAccessToken.mockResolvedValue(mockAccessToken);
    mockFetch.mockClear();
  });

  afterEach(() => {
    mockGetValidGoogleAccessToken.mockClear();
    mockFetch.mockClear();
  });

  describe('fetchEmailsPaginated', () => {
    test('should fetch emails successfully with default parameters', async () => {
      const mockListResponse = {
        messages: [{ id: 'msg1' }, { id: 'msg2' }],
        nextPageToken: 'next-token',
        resultSizeEstimate: 2,
      };
      const mockEmailResponse = {
        id: 'msg1',
        payload: { headers: [] },
        snippet: 'Test email',
      };

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockListResponse),
        })
        .mockResolvedValue({
          ok: true,
          json: () => Promise.resolve(mockEmailResponse),
        });

      const result = await gmailService.fetchEmailsPaginated(mockUserId);

      expect(mockGetValidGoogleAccessToken).toHaveBeenCalledWith(mockUserId);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=50',
        {
          headers: { Authorization: `Bearer ${mockAccessToken}` },
        }
      );
      expect(result.messages).toHaveLength(2);
      expect(result.nextPageToken).toBe('next-token');
    });

    test('should handle pagination with pageToken', async () => {
      const pageToken = 'test-page-token';
      const mockResponse = {
        messages: [{ id: 'msg1' }],
        nextPageToken: null,
        resultSizeEstimate: 1,
      };

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockResponse),
        })
        .mockResolvedValue({
          ok: true,
          json: () => Promise.resolve({ id: 'msg1' }),
        });

      await gmailService.fetchEmailsPaginated(mockUserId, pageToken, 25);

      expect(mockFetch).toHaveBeenCalledWith(
        'https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=25&pageToken=test-page-token',
        {
          headers: { Authorization: `Bearer ${mockAccessToken}` },
        }
      );
    });
  });

  describe('deleteEmail', () => {
    test('should delete email successfully', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
      });

      const result = await gmailService.deleteEmail(mockUserId, mockEmailId);

      expect(mockFetch).toHaveBeenCalledWith(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages/${mockEmailId}`,
        {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${mockAccessToken}` },
        }
      );
      expect(result.success).toBe(true);
    });

    test('should throw error when delete fails', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        statusText: 'Not Found',
      });

      await expect(
        gmailService.deleteEmail(mockUserId, mockEmailId)
      ).rejects.toThrow('Failed to delete email: Not Found');
    });
  });

  describe('getEmailById', () => {
    test('should get email by id successfully', async () => {
      const mockEmail = { id: mockEmailId, payload: { headers: [] } };
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockEmail),
      });

      const result = await gmailService.getEmailById(mockUserId, mockEmailId);

      expect(mockFetch).toHaveBeenCalledWith(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages/${mockEmailId}`,
        {
          headers: { Authorization: `Bearer ${mockAccessToken}` },
        }
      );
      expect(result).toEqual(mockEmail);
    });

    test('should throw error when email not found', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        statusText: 'Not Found',
      });

      await expect(
        gmailService.getEmailById(mockUserId, mockEmailId)
      ).rejects.toThrow('Failed to fetch email: Not Found');
    });
  });

  describe('sendEmail', () => {
    test('should send email successfully', async () => {
      const mockResponse = { id: 'sent-email-id' };
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await gmailService.sendEmail(
        mockUserId,
        'recipient@example.com',
        'Test Subject',
        'Test Body'
      );

      expect(mockFetch).toHaveBeenCalledWith(
        'https://gmail.googleapis.com/gmail/v1/users/me/messages/send',
        expect.objectContaining({
          method: 'POST',
          headers: {
            Authorization: `Bearer ${mockAccessToken}`,
            'Content-Type': 'application/json',
          },
        })
      );
      expect(result).toEqual(mockResponse);
    });

    test('should send email with CC and BCC', async () => {
      const mockResponse = { id: 'sent-email-id' };
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      await gmailService.sendEmail(
        mockUserId,
        'recipient@example.com',
        'Test Subject',
        'Test Body',
        {
          cc: ['cc1@example.com', 'cc2@example.com'],
          bcc: ['bcc@example.com'],
          inReplyTo: 'original-message-id',
        }
      );

      expect(mockFetch).toHaveBeenCalled();
      const fetchCall = mockFetch.mock.calls[0];
      const requestBody = JSON.parse(fetchCall[1]?.body || '{}');
      const decodedEmail = Buffer.from(
        requestBody.raw.replace(/-/g, '+').replace(/_/g, '/'),
        'base64'
      ).toString();

      expect(decodedEmail).toContain('Cc: cc1@example.com, cc2@example.com');
      expect(decodedEmail).toContain('Bcc: bcc@example.com');
      expect(decodedEmail).toContain('In-Reply-To: original-message-id');
    });

    test('should throw error when send fails', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        statusText: 'Bad Request',
      });

      await expect(
        gmailService.sendEmail(mockUserId, 'recipient@example.com', 'Subject', 'Body')
      ).rejects.toThrow('Failed to send email: Bad Request');
    });
  });

  describe('reply', () => {
    test('should reply to email successfully', async () => {
      const mockOriginalEmail = {
        payload: {
          headers: [
            { name: 'From', value: 'sender@example.com' },
            { name: 'Subject', value: 'Original Subject' },
            { name: 'Message-ID', value: 'original-message-id' },
          ],
        },
      };
      const mockSentEmail = { id: 'reply-email-id' };

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockOriginalEmail),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockSentEmail),
        });

      const result = await gmailService.reply(mockUserId, mockEmailId, 'Reply body');

      expect(mockFetch).toHaveBeenCalledTimes(2);
      expect(result).toEqual(mockSentEmail);
    });
  });

  describe('createDraft', () => {
    test('should create draft successfully', async () => {
      const mockDraft = { id: 'draft-id' };
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockDraft),
      });

      const result = await gmailService.createDraft(
        mockUserId,
        'recipient@example.com',
        'Draft Subject',
        'Draft Body'
      );

      expect(mockFetch).toHaveBeenCalledWith(
        'https://gmail.googleapis.com/gmail/v1/users/me/drafts',
        expect.objectContaining({
          method: 'POST',
          headers: {
            Authorization: `Bearer ${mockAccessToken}`,
            'Content-Type': 'application/json',
          },
        })
      );
      expect(result).toEqual(mockDraft);
    });

    test('should create draft with CC and BCC', async () => {
      const mockDraft = { id: 'draft-id' };
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockDraft),
      });

      await gmailService.createDraft(
        mockUserId,
        'recipient@example.com',
        'Draft Subject',
        'Draft Body',
        {
          cc: ['cc@example.com'],
          bcc: ['bcc@example.com'],
        }
      );

      expect(mockFetch).toHaveBeenCalled();
      const fetchCall = mockFetch.mock.calls[0];
      const requestBody = JSON.parse(fetchCall[1]?.body || '{}');
      const decodedEmail = Buffer.from(
        requestBody.message.raw.replace(/-/g, '+').replace(/_/g, '/'),
        'base64'
      ).toString();

      expect(decodedEmail).toContain('Cc: cc@example.com');
      expect(decodedEmail).toContain('Bcc: bcc@example.com');
    });
  });

  describe('updateDraft', () => {
    test('should update draft successfully', async () => {
      const mockUpdatedDraft = { id: mockDraftId };
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockUpdatedDraft),
      });

      const result = await gmailService.updateDraft(
        mockUserId,
        mockDraftId,
        'recipient@example.com',
        'Updated Subject',
        'Updated Body'
      );

      expect(mockFetch).toHaveBeenCalledWith(
        `https://gmail.googleapis.com/gmail/v1/users/me/drafts/${mockDraftId}`,
        expect.objectContaining({
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${mockAccessToken}`,
            'Content-Type': 'application/json',
          },
        })
      );
      expect(result).toEqual(mockUpdatedDraft);
    });
  });

  describe('deleteDraft', () => {
    test('should delete draft successfully', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
      });

      const result = await gmailService.deleteDraft(mockUserId, mockDraftId);

      expect(mockFetch).toHaveBeenCalledWith(
        `https://gmail.googleapis.com/gmail/v1/users/me/drafts/${mockDraftId}`,
        {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${mockAccessToken}` },
        }
      );
      expect(result.success).toBe(true);
    });

    test('should throw error when delete draft fails', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        statusText: 'Not Found',
      });

      await expect(
        gmailService.deleteDraft(mockUserId, mockDraftId)
      ).rejects.toThrow('Failed to delete draft: Not Found');
    });
  });

  describe('sendDraft', () => {
    test('should send draft successfully', async () => {
      const mockSentEmail = { id: 'sent-email-id' };
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockSentEmail),
      });

      const result = await gmailService.sendDraft(mockUserId, mockDraftId);

      expect(mockFetch).toHaveBeenCalledWith(
        `https://gmail.googleapis.com/gmail/v1/users/me/drafts/${mockDraftId}/send`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${mockAccessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({}),
        }
      );
      expect(result).toEqual(mockSentEmail);
    });
  });

  describe('fetchDraftsPaginated', () => {
    test('should fetch drafts successfully', async () => {
      const mockDraftsResponse = {
        drafts: [{ id: 'draft1' }, { id: 'draft2' }],
        nextPageToken: 'next-token',
        resultSizeEstimate: 2,
      };
      const mockDraftResponse = {
        id: 'draft1',
        message: { id: 'msg1' },
      };

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockDraftsResponse),
        })
        .mockResolvedValue({
          ok: true,
          json: () => Promise.resolve(mockDraftResponse),
        });

      const result = await gmailService.fetchDraftsPaginated(mockUserId);

      expect(mockFetch).toHaveBeenCalledWith(
        'https://gmail.googleapis.com/gmail/v1/users/me/drafts?maxResults=50',
        {
          headers: { Authorization: `Bearer ${mockAccessToken}` },
        }
      );
      expect(result.drafts).toHaveLength(2);
      expect(result.nextPageToken).toBe('next-token');
    });
  });

  describe('markAsRead', () => {
    test('should mark email as read successfully', async () => {
      const mockResponse = { id: mockEmailId };
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await gmailService.markAsRead(mockUserId, mockEmailId);

      expect(mockFetch).toHaveBeenCalledWith(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages/${mockEmailId}/modify`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${mockAccessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            removeLabelIds: ['UNREAD'],
          }),
        }
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('markAsUnread', () => {
    test('should mark email as unread successfully', async () => {
      const mockResponse = { id: mockEmailId };
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await gmailService.markAsUnread(mockUserId, mockEmailId);

      expect(mockFetch).toHaveBeenCalledWith(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages/${mockEmailId}/modify`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${mockAccessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            addLabelIds: ['UNREAD'],
          }),
        }
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('starEmail', () => {
    test('should star email successfully', async () => {
      const mockResponse = { id: mockEmailId };
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await gmailService.starEmail(mockUserId, mockEmailId);

      expect(mockFetch).toHaveBeenCalledWith(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages/${mockEmailId}/modify`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${mockAccessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            addLabelIds: ['STARRED'],
          }),
        }
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('unstarEmail', () => {
    test('should unstar email successfully', async () => {
      const mockResponse = { id: mockEmailId };
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await gmailService.unstarEmail(mockUserId, mockEmailId);

      expect(mockFetch).toHaveBeenCalledWith(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages/${mockEmailId}/modify`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${mockAccessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            removeLabelIds: ['STARRED'],
          }),
        }
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('archiveEmail', () => {
    test('should archive email successfully', async () => {
      const mockResponse = { id: mockEmailId };
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await gmailService.archiveEmail(mockUserId, mockEmailId);

      expect(mockFetch).toHaveBeenCalledWith(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages/${mockEmailId}/modify`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${mockAccessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            removeLabelIds: ['INBOX'],
          }),
        }
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('unarchiveEmail', () => {
    test('should unarchive email successfully', async () => {
      const mockResponse = { id: mockEmailId };
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await gmailService.unarchiveEmail(mockUserId, mockEmailId);

      expect(mockFetch).toHaveBeenCalledWith(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages/${mockEmailId}/modify`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${mockAccessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            addLabelIds: ['INBOX'],
          }),
        }
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('moveToTrash', () => {
    test('should move email to trash successfully', async () => {
      const mockResponse = { id: mockEmailId };
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await gmailService.moveToTrash(mockUserId, mockEmailId);

      expect(mockFetch).toHaveBeenCalledWith(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages/${mockEmailId}/trash`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${mockAccessToken}` },
        }
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('restoreFromTrash', () => {
    test('should restore email from trash successfully', async () => {
      const mockResponse = { id: mockEmailId };
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await gmailService.restoreFromTrash(mockUserId, mockEmailId);

      expect(mockFetch).toHaveBeenCalledWith(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages/${mockEmailId}/untrash`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${mockAccessToken}` },
        }
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('searchEmails', () => {
    test('should search emails successfully', async () => {
      const mockSearchResponse = {
        messages: [{ id: 'msg1' }, { id: 'msg2' }],
        nextPageToken: 'next-token',
        resultSizeEstimate: 2,
      };
      const mockEmailResponse = {
        id: 'msg1',
        payload: { headers: [] },
        snippet: 'Search result',
      };

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockSearchResponse),
        })
        .mockResolvedValue({
          ok: true,
          json: () => Promise.resolve(mockEmailResponse),
        });

      const result = await gmailService.searchEmails(mockUserId, 'test query');

      expect(mockFetch).toHaveBeenCalledTimes(3); // 1 search + 2 individual emails
      expect(mockFetch).toHaveBeenNthCalledWith(1,
        'https://gmail.googleapis.com/gmail/v1/users/me/messages?q=test+query&maxResults=50',
        {
          headers: { Authorization: `Bearer ${mockAccessToken}` },
        }
      );
      expect(result.messages).toHaveLength(2);
    });
  });

  describe('getThread', () => {
    test('should get thread successfully', async () => {
      const mockThread = {
        id: mockThreadId,
        messages: [{ id: 'msg1' }, { id: 'msg2' }],
      };
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockThread),
      });

      const result = await gmailService.getThread(mockUserId, mockThreadId);

      expect(mockFetch).toHaveBeenCalledWith(
        `https://gmail.googleapis.com/gmail/v1/users/me/threads/${mockThreadId}`,
        {
          headers: { Authorization: `Bearer ${mockAccessToken}` },
        }
      );
      expect(result).toEqual(mockThread);
    });
  });

  describe('fetchThreadsPaginated', () => {
    test('should fetch threads successfully', async () => {
      const mockThreadsResponse = {
        threads: [{ id: 'thread1' }, { id: 'thread2' }],
        nextPageToken: 'next-token',
        resultSizeEstimate: 2,
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockThreadsResponse),
      });

      const result = await gmailService.fetchThreadsPaginated(mockUserId);

      expect(mockFetch).toHaveBeenCalledWith(
        'https://gmail.googleapis.com/gmail/v1/users/me/threads?maxResults=50',
        {
          headers: { Authorization: `Bearer ${mockAccessToken}` },
        }
      );
      expect(result).toEqual(mockThreadsResponse);
    });
  });

  describe('replyAll', () => {
    test('should reply to all recipients successfully', async () => {
      const mockOriginalEmail = {
        payload: {
          headers: [
            { name: 'From', value: 'sender@example.com' },
            { name: 'To', value: 'recipient1@example.com, recipient2@example.com' },
            { name: 'Cc', value: 'cc1@example.com, cc2@example.com' },
            { name: 'Subject', value: 'Original Subject' },
            { name: 'Message-ID', value: 'original-message-id' },
          ],
        },
      };
      const mockSentEmail = { id: 'reply-all-email-id' };

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockOriginalEmail),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockSentEmail),
        });

      const result = await gmailService.replyAll(mockUserId, mockEmailId, 'Reply all body');

      expect(mockFetch).toHaveBeenCalledTimes(2);
      expect(result).toEqual(mockSentEmail);
    });
  });

  describe('forwardEmail', () => {
    test('should forward email successfully', async () => {
      const mockOriginalEmail = {
        payload: {
          headers: [
            { name: 'From', value: 'sender@example.com' },
            { name: 'Subject', value: 'Original Subject' },
            { name: 'Date', value: 'Mon, 01 Jan 2024 12:00:00 GMT' },
          ],
        },
        snippet: 'Original email content',
      };
      const mockForwardedEmail = { id: 'forwarded-email-id' };

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockOriginalEmail),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockForwardedEmail),
        });

      const result = await gmailService.forwardEmail(
        mockUserId,
        mockEmailId,
        'forward@example.com',
        'Additional message'
      );

      expect(mockFetch).toHaveBeenCalledTimes(2);
      expect(result).toEqual(mockForwardedEmail);
    });
  });

  describe('Error handling', () => {
    test('should handle network errors', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));

      await expect(
        gmailService.getEmailById(mockUserId, mockEmailId)
      ).rejects.toThrow('Network error');
    });

    test('should handle invalid access token', async () => {
      mockGetValidGoogleAccessToken.mockRejectedValue(new Error('Invalid access token'));

      await expect(
        gmailService.getEmailById(mockUserId, mockEmailId)
      ).rejects.toThrow('Invalid access token');
    });
  });
});