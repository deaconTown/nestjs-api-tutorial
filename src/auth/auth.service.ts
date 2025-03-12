import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthDto } from './dto';
import * as argon2 from 'argon2';
import { User } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(private prismaService: PrismaService) {}
  async signup(dto: AuthDto) {
    //generate password hash
    const passwordHash: string = await argon2.hash(dto.password);

    //save new user to the db
    const user: User = await this.prismaService.user.create({
      data: { email: dto.email, hash: passwordHash },
    });

    //remove hash from user being returned
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { hash, ...savedUser } = user;

    //return saved user
    return savedUser;
  }

  signin() {
    return { msg: 'I am signed in' };
  }
}
