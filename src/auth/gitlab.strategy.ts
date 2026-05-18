import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-gitlab2";
import { ConfigService } from "@nestjs/config";
import { AuthService } from "./auth.service";

@Injectable()
export class GitlabStrategy extends PassportStrategy(Strategy,'gitlab'){
    constructor(
        private configService: ConfigService,
        private authService:AuthService,
    ){
        super({
            clientID:configService.get('GITLAB_CLIENT_ID'),
            clientSecret:configService.get('GITLAB_CLIENT_SECRET'),
            callbackURL:configService.get('GITLAB_CALLBACK_URL'),
            scope:['read_user'],
        });
    }
  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
) {
    const user = await this.authService.validateOAuthUser({
        email: profile.emails[0].value,
        name: profile.displayName,
        provider: 'gitlab',
        providerId: String(profile.id),
    });
    return user;
}
}