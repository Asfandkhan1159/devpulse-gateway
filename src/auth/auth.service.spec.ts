import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './user.entity';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt', () => ({
  compare: jest.fn()
}));
const mockUserRepository = {
  findOne:jest.fn()
}
const mockJwtService = {
  sign:jest.fn()
}


describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthService,
        {provide: getRepositoryToken(User), useValue:mockUserRepository},
        {provide: JwtService, useValue:mockJwtService}
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });
  it('should return a token when the credentials are valid', async () => {
    mockUserRepository.findOne.mockResolvedValue({
      id:1,
      email:'test@test.com',
       password:'$2b$10$hashedPasswordFromDB'});
      (bcrypt.compare as jest.Mock).mockResolvedValue(true as never)

    mockJwtService.sign.mockReturnValue('token_secret');
    const result = await service.login({email:'test@test.com',password:'$2b$10$hashedPasswordFromDB'})
    expect(result.access_token).toBe('token_secret');
    
    expect(mockJwtService.sign).toHaveBeenCalledWith(
     { sub:1,
      email:'test@test.com'}
    )

    
  })
  it('should thrown an error when the user is not found',async()=>{
    mockUserRepository.findOne.mockResolvedValue(null);

    await expect( service.login({
      email:'fake@fake.com',
      password:'invalidPassword'}))
      .rejects.toThrow('Invalid email or password')
    

  })
  it('should throw an error when the password is invalid',async()=>{
    mockUserRepository.findOne.mockResolvedValue({email:'test@test.com',password:'23434$wronGPassword###'});
    (bcrypt.compare as jest.Mock).mockResolvedValue(false as never)
     await expect(service.login({email:"test@test.com",
       password:'@#!#@#passWORDINvalID@#!#'}))
       .rejects.toThrow('Invalid email or password')

     
  })
  });
