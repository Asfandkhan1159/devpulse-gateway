// src/auth/jwt.strategy.ts
import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { Request } from "express";

@Injectable()
export class JwtStrategy  extends PassportStrategy(Strategy) {
    constructor(){
      
        super({
            jwtFromRequest:(req:Request) =>{
                return req?.cookies?.access_token || null;
            },
            secretOrKey:process.env.JWT_SECRET || 'devsecret',
             passReqToCallback: false,
        })
    }
    async validate(payload:any){

        return {userId:payload.sub, email:payload.email};
    }
}