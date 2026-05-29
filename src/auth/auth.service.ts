// src/auth/auth.service.ts
import {  Injectable,InternalServerErrorException,UnauthorizedException, ConflictException } from '@nestjs/common';
import { User } from './user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { LoginDto } from './dto/login.dto';
import  * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { application, type Response } from 'express';
import { json } from 'stream/consumers';
import { ConnectedRepository } from './connected-repository.entity';
import { ConfigService } from '@nestjs/config';
@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
        @InjectRepository(ConnectedRepository)
        private connectedRepoRepo:Repository<ConnectedRepository>,
        private jwtService: JwtService,
        private configService : ConfigService
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
       if (!user) {
    user = this.userRepository.create({
        email: profile.email,
        name: profile.name,
        provider: profile.provider,
        providerId: profile.providerId,
        password: '',
        githubAccessToken: profile.provider === 'github' ? profile.accessToken || null : null,
        gitlabAccessToken: profile.provider === 'gitlab' ? profile.accessToken || null : null,
    })
} else {
    if (profile.provider === 'gitlab') {
        user.gitlabAccessToken = profile.accessToken || null;
    } else {
        user.githubAccessToken = profile.accessToken || null;
    }
}
        await this.userRepository.save(user);
        return user;
    }
    async issueJwtCookie(user: User, response: Response) {
  const token = this.jwtService.sign({ sub: user.id, email: user.email,provider: user.provider });
  response.cookie('access_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
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

async getGitlabRepos(userId:string){
    const user = await this.userRepository.findOne({where:{id:userId}})
    if(!user?.gitlabAccessToken){
    throw new UnauthorizedException('No Gitlab token found');
    }

    const response = await fetch('https://gitlab.com/api/v4/projects?membership=true&per_page=100',{
        headers:{
            Authorization:`Bearer ${user.gitlabAccessToken}`,
            Accept:'application/vnd/gitlab.v3+json'
        }
    })
    const repos =await response.json();

    return repos.map((r:any)=>({
        id:r.id,
        name:r.name,
        full_name:r.path_with_namespace,
        html_url:r.web_url,
        private:r.visibility === 'private'
    }))
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
        const isHookExists = error.errors?.[0].message === 'Hook already exists on this repository'

        if(isHookExists){
            throw new ConflictException('Repository already connected')
        }

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
    const fastApiUrl = this.configService.get('FASTAPI_URL');
console.log('fastApiUrl:', fastApiUrl);
const projectRes = await fetch(`${fastApiUrl}/metrics/projects`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        external_id: String(repoId),
        provider: 'github',
        name: repoName,
        web_url: `https://github.com/${repoFullName}`
    })
});
console.log('FastAPI project create status:', projectRes.status);
const projectResBody = await projectRes.json();
console.log('FastAPI project create response:', projectResBody);
    console.log('FastAPI project create status:', projectRes.status);


    return {message:`Webhook registered for ${repoFullName}`}
}
async connectedGitLabRepo(userId:string, repoFullname:string, webhookUrl:string, repoId:number){
    const user = await this.userRepository.findOne({where:{id:userId}})
    if(!user?.gitlabAccessToken){
        throw new UnauthorizedException('No Gitlab Token found')
    }
    const response = await fetch(`https://gitlab.com/api/v4/projects/${repoId}/hooks`,{
        method:'POST',
        headers:{
            Authorization:`Bearer ${user.gitlabAccessToken}`,
            Accept:'application/vnd.gitlab.v3+json',
            'Content-Type':'application/json'
        },
        body:JSON.stringify({
             url: webhookUrl,
    push_events: true,
    merge_requests_events: true,
    pipeline_events: true,
    token: this.configService.get('GITLAB_TOKEN'),

        })
    })
    if(!response.ok){
        const error = await response.json();
        console.log('GitLab API error:',JSON.stringify(error));
        if (response.status === 422) {
    throw new ConflictException('Repository already connected');
    }
        throw new InternalServerErrorException(error.message || "failed to register gitlab webhook")
    }
    const webhookData = await response.json();
    const [,repoName]= repoFullname.split('/');
    const ConnectedRepository = this.connectedRepoRepo.create({
        userId,
        provider:'gitlab',
        externalRepoId:String(repoId),
        repoName,
        webhookId:String(webhookData.id),
        webUrl:`https://gitlab.com/${repoFullname}`
    })
    await this.connectedRepoRepo.save(ConnectedRepository);

const fastApiUrl = this.configService.get('FASTAPI_URL');
await fetch(`${fastApiUrl}/metrics/projects`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        external_id: String(repoId),
        provider: 'gitlab',
        name: repoName,
        web_url: `https://gitlab.com/${repoFullname}`
    })
});

return { message: `Webhook registered for ${repoFullname}` };
}
async getConnectedRepos(userId:string){
    return this.connectedRepoRepo.find({where:{userId}});
}
}
