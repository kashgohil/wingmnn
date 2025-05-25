import { CONSTANTS, ROUTES } from '@auth/constants';
import { generateTokens } from '@auth/jwt';
import { verifyPassword } from '@auth/password';
import { auth } from '@auth/router';
import { db } from '@db';
import { zValidator } from '@hono/zod-validator';
import { usersTable } from '@schema/users';
import { eq } from 'drizzle-orm';
import { setCookie } from 'hono/cookie';
import { z } from 'zod';

// Email/Password Login
const loginSchema = z.object({
	email: z.string().email(),
	password: z.string().min(6),
});

auth.post('/login', zValidator('form', loginSchema), async (c) => {
	const { email, password } = c.req.valid('form');

	console.log(`[AUTH] Login attempt for email: ${email}`);

	// Find user by email
	const user = await db.query.usersTable.findFirst({
		where: eq(usersTable.email, email),
	});

	if (!user) {
		console.log(`[AUTH] User not found for email: ${email}`);
		return c.json(
			{
				success: false,
				message: 'Email not found. Redirecting to signup page',
				redirectUrl: ROUTES.SIGNUP_PAGE,
			},
			404
		);
	}

	// Check if user has a password (might be Google account)
	if (!user.password) {
		console.log(`[AUTH] User has no password, might be a social login account`);
		return c.json({ success: false, message: 'Please use Google SSO for this account' }, 400);
	}

	// Verify password
	const isPasswordValid = await verifyPassword(password, user.password);
	if (!isPasswordValid) {
		console.log(`[AUTH] Invalid password for user: ${user.id}`);
		return c.json({ success: false, message: 'Invalid credentials' }, 401);
	}

	// Generate tokens
	const { accessToken, refreshToken } = await generateTokens(user);

	// Set cookies
	setCookie(c, CONSTANTS.ACCESS_TOKEN_COOKIE, accessToken, {
		httpOnly: true,
		secure: process.env.NODE_ENV === 'production',
		maxAge: CONSTANTS.ACCESS_TOKEN_EXPIRES_IN,
		path: '/',
	});

	setCookie(c, CONSTANTS.REFRESH_TOKEN_COOKIE, refreshToken, {
		httpOnly: true,
		secure: process.env.NODE_ENV === 'production',
		maxAge: CONSTANTS.REFRESH_TOKEN_EXPIRES_IN,
		path: '/',
	});

	setCookie(c, CONSTANTS.AUTHENTICATED, 'true', {
		httpOnly: false,
		secure: process.env.NODE_ENV === 'production',
		maxAge: CONSTANTS.ACCESS_TOKEN_EXPIRES_IN,
		path: '/',
	});

	// Check if user has completed onboarding
	if (!user.isOnboarded) {
		console.log(`[AUTH] User needs to complete onboarding: ${user.id}`);

		return c.json({
			success: true,
			message: 'Login successful, please complete onboarding',
			redirectUrl: ROUTES.ONBOARDING_ROUTE,
			user: {
				id: user.id,
				name: user.name,
				email: user.email,
			},
		});
	} else {
		console.log(`[AUTH] Login successful for user: ${user.id}`);

		return c.json({
			success: true,
			message: 'Login successful',
			redirectUrl: ROUTES.HOME_ROUTE,
			user: {
				id: user.id,
				name: user.name,
				email: user.email,
			},
		});
	}
});
