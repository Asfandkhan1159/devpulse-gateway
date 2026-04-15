import {  Injectable,UnauthorizedException } from '@nestjs/common';
import { User } from './user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { LoginDto } from './dto/login.dto';
import  * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

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
}
