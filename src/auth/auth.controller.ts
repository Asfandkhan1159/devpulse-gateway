//auth.controller.ts
import { Body,Controller, HttpCode,HttpStatus, Post, Res,Get,Req, UseGuards, Redirect } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import type {  Response } from 'express';
import { AuthGuard } from '@nestjs/passport';



@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() loginDto: LoginDto,
    @Res({passthrough:true}) response:Response
  ) {
    const {access_token,message}= await this.authService.login(loginDto);
    response.cookie('access_token', access_token,{
      httpOnly:true,
      secure:process.env.NODE_ENV === 'production',
      sameSite:'strict',
      maxAge:24 * 60 * 60 * 1000, 

    })
    return {message};
  }
  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  getMe(@Req() req){
    return req.user
  }
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logout(@Res({passthrough:true})response:Response){
    response.clearCookie('access_token')
    return {message :'Logged out succesfully'}
  }
  @Get('gitlab')
  @UseGuards(AuthGuard('gitlab'))

  gitlabLogin(){
    return {url:'https://gitlab.com'};
  }
  @Get('gitlab/callback')
  @UseGuards(AuthGuard('gitlab'))
  async gitlabCallbacl(@Req() req,@Res({passthrough:true}) res:Response){
    const token = await this.authService.issueJwtCookie(req.user,res);
    res.redirect('http://localhost:5173/projects')
  }
  @Get('github')
  @UseGuards(AuthGuard('github'))

  githubLogin(){
    return {url:'https://github.com'}

  }
  @Get('github/callback')
  @UseGuards(AuthGuard('github'))
  async githubCallback(@Req() req, @Res({passthrough:true}) res:Response){
    const token = await this.authService.issueJwtCookie(req.user, res);
    res.redirect('http://localhost:5173/projects')
  }

  
}
