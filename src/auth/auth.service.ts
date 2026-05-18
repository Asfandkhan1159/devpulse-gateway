// src/auth/auth.service.ts
import {  Injectable,UnauthorizedException } from '@nestjs/common';
import { User } from './user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { LoginDto } from './dto/login.dto';
import  * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import type { Response } from 'express';
@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
        private jwtService: JwtService
        ) {}
    async login (LoginDto:LoginDto){
        const {email,password}= LoginDto;
        const user = await this.userRepository.findOne({where:{email}});
        const isPasswordValid = user ? await bcrypt.compare(password, user.password) :false;
        if(!user || !isPasswordValid){
         
           throw new UnauthorizedException('Invalid email or password');
        }
     
        const token = this.jwtService.sign({sub:user.id,email:user.email});
        return {access_token:token,message:'Login successful'};
       
    }
    async validateOAuthUser(profile:{
        email:string;
        name:string;
        provider:string;
        providerId:string;
    }){
        let user = await this.userRepository.findOne({
            where:{email:profile.email},
        });
        if(!user){
            user= this.userRepository.create({
                email:profile.email,
                name:profile.name,
                provider:profile.provider,
                providerId:profile.providerId,
                password:'',
            })
            await this.userRepository.save(user);
        }
        return user;
    }
    async issueJwtCookie(user: User, response: Response) {
  const token = this.jwtService.sign({ sub: user.id, email: user.email });
  response.cookie('access_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 24 * 60 * 60 * 1000,
  });
  return token;
}
}
