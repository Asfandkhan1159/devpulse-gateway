import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

const mockAuthService ={
  login: jest.fn()
}

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {provide:AuthService, useValue:mockAuthService}
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should call auth service when the credentials are valid', async() => {
    //Arrange
    mockAuthService.login.mockResolvedValue({
      access_token:'valid_Token',
      message:'Login successful'
    })
    
    //Act
    const result = await controller.login({email:'test@test.com',password:'PASSWORD@PASSWORD'})

    //Assert
    expect(result).toEqual({
      access_token:'valid_Token',
      message:'Login successful'
    })
    expect(mockAuthService.login).toHaveBeenCalledWith(
      {
        email:'test@test.com',
        password:'PASSWORD@PASSWORD'
      }
    )
  });
  it('should throw the error if any of the credential is invalid',async()=>{
    //Arrange
   mockAuthService.login.mockRejectedValue(
    new Error ('Invalid email or password')
   )

   await expect(controller.login({
      email:'test@test.com',
      password:''
   })).rejects.toThrow('Invalid email or password')


  }

)
});
