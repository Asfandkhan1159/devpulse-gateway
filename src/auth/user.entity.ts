import { Entity,Column, PrimaryGeneratedColumn,CreateDateColumn } from "typeorm";

@Entity()
export class User{
    @PrimaryGeneratedColumn('uuid')
    id!:string;

    @Column({unique:true})
    email!:string;
    @Column({nullable:true})
    password!:string;
    @Column({nullable:true})
    name!:string;
    @Column({nullable:true})
    provider!:string
    @Column({nullable:true})
    providerId!:string;
    @CreateDateColumn()
    createdAt!:Date;
    @Column({ nullable: true, type: 'varchar' })
    githubAccessToken!: string | null;
    
}