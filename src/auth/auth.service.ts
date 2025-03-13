import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthDto } from './dto';
import * as argon2 from 'argon2';
import { User } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Injectable()
export class AuthService {
  constructor(private prismaService: PrismaService) {}
  async signup(dto: AuthDto) {
    try {
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
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ForbiddenException('Credentials taken');
        }
      } else {
        throw error;
      }
    }
  }

  async signin(dto: AuthDto) {
    try {
      // find the user by email
      // //if user does not exist, throw exception
      const user = await this.prismaService.user.findUniqueOrThrow({
        where: {
          email: dto.email,
        },
      });

      //compare password
      const pwMatches = await argon2.verify(user.hash, dto.password);
      //if password does not match, throw exception
      if (!pwMatches) {
        console.log(pwMatches, 'pwMathes');
        throw new ForbiddenException('Credentials invalid');
      }

      //return user
      //remove hash from user being returned
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { hash, ...signedInUser } = user;

      //return saved user
      return signedInUser;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new ForbiddenException('No user with this email');
        }
      } else {
        throw error;
      }
    }
  }
}
