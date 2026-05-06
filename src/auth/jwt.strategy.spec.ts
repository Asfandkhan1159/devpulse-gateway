
import { JwtStrategy } from "./jwt.strategy";

describe('JwtStrategy',()=>{
    let strategy: JwtStrategy;
    beforeEach(()=>{
        strategy= new JwtStrategy();
    });
 
    it('should validate and return user object from payload',async()=>{
        const payload = {sub:1, email:"test@test.com"};
        const result = await strategy.validate(payload);
        expect(result).toEqual({userId:1, email:'test@test.com'})
    })

});