import { FastifyRequest, FastifyReply } from 'fastify';
import bcrypt from 'bcryptjs';
import axios from 'axios';
import { OAuth2Client } from 'google-auth-library';
import prisma from '../config/database';
import { z } from 'zod';
import { config } from '../config';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2),
  mobile: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

const googleLoginSchema = z.object({
  code: z.string().min(1),
  codeVerifier: z.string().min(10).optional(),
  redirectUri: z.string().url().optional(),
});

const googleClient = new OAuth2Client(config.google.clientId);

async function exchangeGoogleCodeForTokens(input: {
  code: string;
  codeVerifier?: string;
  redirectUri: string;
}) {
  const params = new URLSearchParams({
    code: input.code,
    client_id: config.google.clientId,
    client_secret: config.google.clientSecret,
    redirect_uri: input.redirectUri,
    grant_type: 'authorization_code',
  });

  if (input.codeVerifier) {
    params.set('code_verifier', input.codeVerifier);
  }

  const response = await axios.post('https://oauth2.googleapis.com/token', params.toString(), {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });

  return response.data as {
    id_token: string;
    access_token: string;
    refresh_token?: string;
    expires_in: number;
    token_type: string;
  };
}

export async function register(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { email, password, name, mobile } = registerSchema.parse(request.body);
    
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });
    
    if (existingUser) {
      return reply.code(400).send({ error: 'User already exists' });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        mobile,
      },
      select: {
        id: true,
        email: true,
        name: true,
        mobile: true,
        createdAt: true,
      },
    });
    
    // Generate JWT token
    const token = request.server.jwt.sign({
      userId: user.id,
      email: user.email,
    });
    
    return reply.send({
      user,
      token,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return reply.code(400).send({ error: error.errors });
    }
    console.error('Register error:', error);
    return reply.code(500).send({ error: 'Internal server error' });
  }
}

export async function login(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { email, password } = loginSchema.parse(request.body);
    
    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });
    
    if (!user) {
      return reply.code(401).send({ error: 'Invalid credentials' });
    }

    if (!user.password) {
      return reply.code(401).send({ error: 'Invalid credentials' });
    }
    
    // Verify password
    const validPassword = await bcrypt.compare(password, user.password);
    
    if (!validPassword) {
      return reply.code(401).send({ error: 'Invalid credentials' });
    }
    
    // Generate JWT token
    const token = request.server.jwt.sign({
      userId: user.id,
      email: user.email,
    });
    
    return reply.send({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        mobile: user.mobile,
        createdAt: user.createdAt,
      },
      token,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return reply.code(400).send({ error: error.errors });
    }
    console.error('Login error:', error);
    return reply.code(500).send({ error: 'Internal server error' });
  }
}

export async function googleLogin(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { code, codeVerifier, redirectUri } = googleLoginSchema.parse(request.body);

    if (!config.google.clientId || !config.google.clientSecret || !config.google.redirectUri) {
      return reply.code(500).send({ error: 'Google OAuth is not configured' });
    }

    const tokens = await exchangeGoogleCodeForTokens({
      code,
      codeVerifier,
      redirectUri: redirectUri || config.google.redirectUri,
    });

    if (!tokens.id_token) {
      return reply.code(401).send({ error: 'Invalid Google token' });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: tokens.id_token,
      audience: config.google.clientId,
    });

    const payload = ticket.getPayload();
    const googleId = payload?.sub;
    const email = payload?.email;
    const emailVerified = payload?.email_verified;
    const name = payload?.name;

    if (!googleId || !email || !emailVerified) {
      return reply.code(401).send({ error: 'Google account not verified' });
    }

    let user = await prisma.user.findUnique({
      where: { email },
    });

    if (user) {
      if (user.googleId && user.googleId !== googleId) {
        return reply.code(409).send({ error: 'Google account mismatch' });
      }

      if (!user.googleId) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: {
            googleId,
            authProvider: 'google',
          },
        });
      }
    } else {
      user = await prisma.user.create({
        data: {
          email,
          name: name || email.split('@')[0],
          googleId,
          authProvider: 'google',
        },
      });
    }

    const token = request.server.jwt.sign({
      userId: user.id,
      email: user.email,
    });

    return reply.send({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        mobile: user.mobile || undefined,
        createdAt: user.createdAt,
      },
      token,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return reply.code(400).send({ error: error.errors });
    }
    console.error('Google login error:', error);
    return reply.code(500).send({ error: 'Internal server error' });
  }
}

export async function getProfile(request: FastifyRequest, reply: FastifyReply) {
  try {
    const userId = (request.user as any).userId;
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        mobile: true,
        createdAt: true,
      },
    });
    
    if (!user) {
      return reply.code(404).send({ error: 'User not found' });
    }
    
    return reply.send({ user });
  } catch (error) {
    console.error('Get profile error:', error);
    return reply.code(500).send({ error: 'Internal server error' });
  }
}
