// src/auth/jwt.strategy.ts
import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { Request } from "express";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(){
        if(!process.env.JWT_SECRET) throw new Error('JWT_SECRET not defined')
        
        super({
            jwtFromRequest: (req: Request) => {
                return req?.cookies?.access_token || null;
            },
            secretOrKey: process.env.JWT_SECRET,
            passReqToCallback: false,
        });
    }

    async validate(payload: any){
        return { userId: payload.sub, email: payload.email, provider: payload.provider };
    }
}