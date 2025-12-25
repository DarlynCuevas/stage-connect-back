import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from './dto/register.dto';
import { UnauthorizedException, BadRequestException } from '@nestjs/common';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const mockUsersService = {
      findOneByEmail: jest.fn(),
      create: jest.fn(),
    };
    const mockJwtService = {
      sign: jest.fn().mockReturnValue('mocked-jwt-token'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should register a user successfully', async () => {
      usersService.findOneByEmail = jest.fn().mockResolvedValue(null);
      usersService.create = jest.fn().mockResolvedValue({
        user_id: 1,
        email: 'test@example.com',
        role: 'Artista',
        name: 'Test User',
        passwordHash: 'hashed',
      });
      const dto: RegisterDto = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        role: 'Artista',
      } as any;
      const result = await service.register(dto);
      expect(result).toMatchObject({
        user_id: 1,
        email: 'test@example.com',
        role: 'Artista',
        name: 'Test User',
      });
      expect(result.passwordHash).toBeUndefined();
    });

    it('should throw BadRequest if email exists', async () => {
      usersService.findOneByEmail = jest.fn().mockResolvedValue({ email: 'test@example.com' });
      const dto: RegisterDto = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        role: 'Artista',
      } as any;
      await expect(service.register(dto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('validateUser', () => {
    it('should validate user and return user data', async () => {
      usersService.findOneByEmail = jest.fn().mockResolvedValue({
        user_id: 1,
        email: 'test@example.com',
        role: 'Artista',
        name: 'Test User',
        passwordHash: await require('bcrypt').hash('password123', 10),
      });
      const result = await service.validateUser('test@example.com', 'password123');
      expect(result).toMatchObject({
        user_id: 1,
        email: 'test@example.com',
        role: 'Artista',
        name: 'Test User',
      });
      expect(result.passwordHash).toBeUndefined();
    });

    it('should throw Unauthorized if user not found', async () => {
      usersService.findOneByEmail = jest.fn().mockResolvedValue(null);
      await expect(service.validateUser('notfound@example.com', 'password123')).rejects.toThrow(UnauthorizedException);
    });

    it('should return null if password is incorrect', async () => {
      usersService.findOneByEmail = jest.fn().mockResolvedValue({
        user_id: 1,
        email: 'test@example.com',
        role: 'Artista',
        name: 'Test User',
        passwordHash: await require('bcrypt').hash('password123', 10),
      });
      const result = await service.validateUser('test@example.com', 'wrongpassword');
      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    it('should return access_token and role', async () => {
      const user = {
        user_id: 1,
        email: 'test@example.com',
        role: 'Artista',
      };
      const result = await service.login(user);
      expect(result).toEqual({ access_token: 'mocked-jwt-token', role: 'Artista' });
      expect(jwtService.sign).toHaveBeenCalledWith({
        user_id: 1,
        email: 'test@example.com',
        role: 'Artista',
      });
    });
  });
}  )
