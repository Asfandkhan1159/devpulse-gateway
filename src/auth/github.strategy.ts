import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-github2";
import { AuthService } from "./auth.service";

@Injectable()
export class GitHubStrategy extends PassportStrategy(Strategy, 'github') {
    constructor(
        private configService: ConfigService,
        private authService: AuthService,
    ) {
        super({
    clientID: configService.get('GITHUB_CLIENT_ID')!,
    clientSecret: configService.get('GITHUB_CLIENT_SECRET')!,
    callbackURL: configService.get('GITHUB_CALLBACK_URL')!,
    scope: ['user:email'],
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
            provider: 'github',
            providerId: profile.id,
        });
        return user;
    }
}