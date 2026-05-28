import { Entity,Column,PrimaryGeneratedColumn,CreateDateColumn,ManyToOne, JoinColumn } from "typeorm";
import { User } from "./user.entity";

@Entity()
export class ConnectedRepository{
    @PrimaryGeneratedColumn('uuid')
    id!: string

    @ManyToOne(() => User)
    @JoinColumn({name:'user_id'})
    user!:User;

    @Column({name:'user_id'})
    userId!:string

    @Column()
    provider!:string;
    @Column()
    externalRepoId!:string

    @Column()
    repoName!:string

    @Column({nullable:true, type:'varchar'})
    webhookId!:string | null;

    @Column()
    webUrl!:string;

    @CreateDateColumn()
    createdAt!:string
}