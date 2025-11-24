import { Elysia } from "elysia";

/**
 * Tracing middleware
 * Tracks and logs the total time from request ingress to response egress
 *
 * Uses lifecycle hooks to measure total request duration
 * Stores timing in response headers to avoid using WeakMap
 */
export const tracing = () =>
	new Elysia({ name: "tracing" })
		.onRequest(({ set }) => {
			// Store start time in response header
			set.headers["X-Request-Start"] = performance.now().toString();
		})
		.onAfterResponse({ as: "global" }, ({ request, set }) => {
			// Get start time from header and calculate total duration
			const startTimeStr = String(set.headers["X-Request-Start"] || "");
			if (!startTimeStr) {
				return;
			}

			const startTime = Number.parseFloat(startTimeStr);
			const endTime = performance.now();
			const duration = endTime - startTime;
			const durationMs = Math.round(duration * 100) / 100;

			const method = request.method;
			const url = new URL(request.url);
			const pathname = url.pathname;
			const statusCode = set.status || 200;

			// Log the request trace with full details
			console.log(
				`[TRACE] ${method} ${pathname} - ${statusCode} - ${durationMs}ms`,
			);

			// Add response header with duration
			set.headers["X-Response-Time"] = `${durationMs}ms`;
		});
