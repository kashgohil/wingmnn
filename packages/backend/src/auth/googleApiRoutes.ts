import { Hono } from "hono";
import { CalendarApi, DriveApi, GmailApi } from "./googleApi";
import { authenticate, AuthenticateEnv } from "./middleware";

// Google API routes for testing
const googleApiRoutes = new Hono<AuthenticateEnv>();

// Apply authentication to all routes
googleApiRoutes.use(authenticate);

// Gmail routes
googleApiRoutes.get("/gmail/messages", async (c) => {
  const user = c.get("user");

  try {
    console.log(`[API] Fetching Gmail messages for user: ${user.id}`);
    const messages = await GmailApi.listMessages(user.id);

    if (!messages) {
      return c.json(
        { success: false, message: "Failed to fetch Gmail messages" },
        500,
      );
    }

    return c.json({ success: true, data: messages });
  } catch (error) {
    console.error(`[API] Error fetching Gmail messages:`, error);
    return c.json(
      { success: false, message: "Error fetching Gmail messages" },
      500,
    );
  }
});

googleApiRoutes.get("/gmail/messages/:messageId", async (c) => {
  const user = c.get("user");
  const messageId = c.req.param("messageId");

  try {
    console.log(
      `[API] Fetching Gmail message ${messageId} for user: ${user.id}`,
    );
    const message = await GmailApi.getMessage(user.id, messageId);

    if (!message) {
      return c.json(
        { success: false, message: "Failed to fetch Gmail message" },
        500,
      );
    }

    return c.json({ success: true, data: message });
  } catch (error) {
    console.error(`[API] Error fetching Gmail message:`, error);
    return c.json(
      { success: false, message: "Error fetching Gmail message" },
      500,
    );
  }
});

// Calendar routes
googleApiRoutes.get("/calendar/events", async (c) => {
  const user = c.get("user");
  const { timeMin, timeMax, maxResults } = c.req.query();

  try {
    console.log(`[API] Fetching Calendar events for user: ${user.id}`);
    const events = await CalendarApi.listEvents(
      user.id,
      timeMin || undefined,
      timeMax || undefined,
      maxResults ? parseInt(maxResults) : undefined,
    );

    if (!events) {
      return c.json(
        { success: false, message: "Failed to fetch Calendar events" },
        500,
      );
    }

    return c.json({ success: true, data: events });
  } catch (error) {
    console.error(`[API] Error fetching Calendar events:`, error);
    return c.json(
      { success: false, message: "Error fetching Calendar events" },
      500,
    );
  }
});

// Drive routes
googleApiRoutes.get("/drive/files", async (c) => {
  const user = c.get("user");
  const { maxResults } = c.req.query();

  try {
    console.log(`[API] Fetching Drive files for user: ${user.id}`);
    const files = await DriveApi.listFiles(
      user.id,
      maxResults ? parseInt(maxResults) : undefined,
    );

    if (!files) {
      return c.json(
        { success: false, message: "Failed to fetch Drive files" },
        500,
      );
    }

    return c.json({ success: true, data: files });
  } catch (error) {
    console.error(`[API] Error fetching Drive files:`, error);
    return c.json(
      { success: false, message: "Error fetching Drive files" },
      500,
    );
  }
});

googleApiRoutes.get("/drive/files/:fileId", async (c) => {
  const user = c.get("user");
  const fileId = c.req.param("fileId");

  try {
    console.log(`[API] Fetching Drive file ${fileId} for user: ${user.id}`);
    const file = await DriveApi.getFile(user.id, fileId);

    if (!file) {
      return c.json(
        { success: false, message: "Failed to fetch Drive file" },
        500,
      );
    }

    return c.json({ success: true, data: file });
  } catch (error) {
    console.error(`[API] Error fetching Drive file:`, error);
    return c.json(
      { success: false, message: "Error fetching Drive file" },
      500,
    );
  }
});

// Status route to check if user has connected Google services
googleApiRoutes.get("/status", async (c) => {
  const user = c.get("user");

  try {
    // Test access to Gmail API as a way to check if tokens are valid
    const gmailTest = await GmailApi.listMessages(user.id, 1);
    const gmailConnected = !!gmailTest;

    return c.json({
      success: true,
      googleConnected: gmailConnected,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    console.error(`[API] Error checking Google connection status:`, error);
    return c.json({
      success: true,
      googleConnected: false,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });
  }
});

export { googleApiRoutes };
