import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";


@Injectable()
export class JwtStrategy  extends PassportStrategy(Strategy) {
    constructor(){
        console.log('Strategy secret:', process.env.JWT_SECRET || 'devsecret');
        super({
            jwtFromRequest:ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey:process.env.JWT_SECRET || 'devsecret',
        })
    }
    async validate(payload:any){
        console.log('JWT Strategy initialized with secret:', process.env.JWT_SECRET || 'devsecret');
        return {userId:payload.sub, email:payload.email};
    }
}