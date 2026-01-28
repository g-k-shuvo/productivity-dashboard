import jwt, { SignOptions } from 'jsonwebtoken';
import { config } from '../config/env';
import { AppDataSource } from '../config/database';
import { User } from '../models/User';
import { RefreshToken } from '../models/RefreshToken';

export interface TokenPayload {
  userId: string;
  email: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export class AuthService {
  private userRepository = AppDataSource.getRepository(User);
  private refreshTokenRepository = AppDataSource.getRepository(RefreshToken);

  async generateTokenPair(user: User): Promise<TokenPair> {
    const payload: TokenPayload = {
      userId: user.id,
      email: user.email,
    };

    const accessToken = jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn,
    } as SignOptions);

    const refreshToken = jwt.sign(payload, config.jwt.refreshSecret, {
      expiresIn: config.jwt.refreshExpiresIn,
    } as SignOptions);

    // Save refresh token to database
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    const refreshTokenEntity = this.refreshTokenRepository.create({
      userId: user.id,
      token: refreshToken,
      expiresAt,
    });

    await this.refreshTokenRepository.save(refreshTokenEntity);

    return { accessToken, refreshToken };
  }

  async verifyAccessToken(token: string): Promise<TokenPayload | null> {
    try {
      const decoded = jwt.verify(token, config.jwt.secret) as TokenPayload;
      return decoded;
    } catch (error) {
      return null;
    }
  }

  async verifyRefreshToken(token: string): Promise<TokenPayload | null> {
    try {
      const decoded = jwt.verify(token, config.jwt.refreshSecret) as TokenPayload;
      
      // Check if token exists in database
      const refreshTokenEntity = await this.refreshTokenRepository.findOne({
        where: { token, userId: decoded.userId },
      });

      if (!refreshTokenEntity || refreshTokenEntity.expiresAt < new Date()) {
        return null;
      }

      return decoded;
    } catch (error) {
      return null;
    }
  }

  async revokeRefreshToken(token: string): Promise<void> {
    await this.refreshTokenRepository.delete({ token });
  }

  async findOrCreateUser(
    email: string,
    name: string,
    provider: string,
    providerId?: string,
    avatarUrl?: string
  ): Promise<User> {
    let user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      user = this.userRepository.create({
        email,
        name,
        provider,
        providerId,
        avatarUrl,
      });
      await this.userRepository.save(user);
    } else {
      // Update user info
      user.name = name;
      user.avatarUrl = avatarUrl;
      user.provider = provider;
      user.providerId = providerId;
      await this.userRepository.save(user);
    }

    return user;
  }
}

export const authService = new AuthService();

