import { FastifyRequest, FastifyReply } from 'fastify';
import bcrypt from 'bcryptjs';
import prisma from '../config/database';
import { z } from 'zod';

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
