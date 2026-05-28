// src/auth/auth.service.ts
import {  Injectable,InternalServerErrorException,UnauthorizedException } from '@nestjs/common';
import { User } from './user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { LoginDto } from './dto/login.dto';
import  * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { application, type Response } from 'express';
import { json } from 'stream/consumers';
import { ConnectedRepository } from './connected-repository.entity';
@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
        @InjectRepository(ConnectedRepository)
        private connectedRepoRepo:Repository<ConnectedRepository>,
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
        accessToken?:string;
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
                githubAccessToken:profile.accessToken || null
            })
            
        }else{
            user.githubAccessToken = profile.accessToken || null
        }
        await this.userRepository.save(user);
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
async getGithubRepos(userId: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user?.githubAccessToken) {
        throw new UnauthorizedException('No GitHub token found');
    }
    const response = await fetch('https://api.github.com/user/repos?per_page=100&sort=updated', {
        headers: {
            Authorization: `Bearer ${user.githubAccessToken}`,
            Accept: 'application/vnd.github.v3+json',
        },
    });
    const repos = await response.json();
    return repos.map((r: any) => ({
        id: r.id,
        name: r.name,
        full_name: r.full_name,
        html_url: r.html_url,
        private: r.private,
    }));
}
async connectedGithubRepo(userId:string, repoFullName:string, webhookUrl:string, repoId:number){
    const user = await this.userRepository.findOne({where:{id:userId}})
    if(!user?.githubAccessToken){
        throw new UnauthorizedException('No Github Token found')
    }
    const response = await fetch(`https://api.github.com/repos/${repoFullName}/hooks`,{
        method:'POST',
        headers:{
            Authorization:`Bearer ${user.githubAccessToken}`,
            Accept:'application/vnd.github.v3+json',
            'Content-Type':'application/json'
        },
        body:JSON.stringify({
            name:'web',
            active:true,
            events:['push', 'pull_request','workflow_run'],
            config:{
                url:webhookUrl,
                content_type:'json',
            },
        }),
    }); 
    if(!response.ok){
        const error = await response.json();
        console.log('GitHub API error:', JSON.stringify(error));
        throw new InternalServerErrorException(error.message || 'Failed to register webhook');

    }
    const webhookData = await response.json();
    const [,repoName]= repoFullName.split('/');

    const connectedRepo = this.connectedRepoRepo.create({
        userId,
        provider:'github',
        externalRepoId:String(repoId),
        repoName,
        webhookId:String(webhookData.id),
        webUrl:`https://github.com/${repoFullName}`,


    });
    await this.connectedRepoRepo.save(connectedRepo);

    return {message:`Webhook registered for ${repoFullName}`}
}
async getConnectedRepos(userId:string){
    return this.connectedRepoRepo.find({where:{userId}});
}
}
