import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { PrismaService } from '../src/prisma/prisma.service';
import * as pactum from 'pactum';
import { AuthDto } from '../src/auth/dto';

describe('App e2e', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();
    await app.listen(3333);
    prisma = app.get(PrismaService);
    await prisma.cleanDb();
    pactum.request.setBaseUrl('http://localhost:3333/');
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Auth', () => {
    const dto: AuthDto = {
      email: 'davia@email.com',
      password: 'testpassord',
    };
    describe('Signup', () => {
      it('should throw exception when no dto provided', () => {
        return pactum.spec().post('auth/signup').withBody({}).expectStatus(400);
      });
      it('should throw exception when email is empty', () => {
        return pactum
          .spec()
          .post('auth/signup')
          .withBody({
            password: dto.password,
          })
          .expectStatus(400);
      });

      it('should throw exception when password is empty', () => {
        return pactum
          .spec()
          .post('auth/signup')
          .withBody({
            email: dto.email,
          })
          .expectStatus(400);
      });

      it('should throw exception when email is invalid', () => {
        return pactum
          .spec()
          .post('auth/signup')
          .withBody({
            email: 'invalid email',
            passport: dto.password,
          })
          .expectStatus(400);
      });

      it('should sign up', () => {
        return pactum
          .spec()
          .post('auth/signup')
          .withBody(dto)
          .expectStatus(201);
      });
    });

    describe('Signin', () => {
      it('should throw exception when no dto provided', () => {
        return pactum.spec().post('auth/signup').withBody({}).expectStatus(400);
      });
      it('should throw exception when email is empty', () => {
        return pactum
          .spec()
          .post('auth/signin')
          .withBody({
            password: dto.password,
          })
          .expectStatus(400);
      });

      it('should throw exception when password is empty', () => {
        return pactum
          .spec()
          .post('auth/signin')
          .withBody({
            email: dto.email,
          })
          .expectStatus(400);
      });

      it('should throw exception when email is invalid', () => {
        return pactum
          .spec()
          .post('auth/signin')
          .withBody({
            email: 'invalid email',
            passport: dto.password,
          })
          .expectStatus(400);
      });
      it('should sign in', () => {
        return pactum
          .spec()
          .post('auth/signin')
          .withBody(dto)
          .expectStatus(200)
          .stores('userAt', 'access_token');
      });
    });
  });

  describe('User', () => {
    describe('Get me', () => {
      it('should return current user', () => {
        return pactum
          .spec()
          .withHeaders({ Authorization: 'bearer $S{userAt}' })
          .get('users/me')
          .expectStatus(200);
      });
    });

    describe('Edit user', () => {});
  });

  describe('Bookmark', () => {
    describe('Create bookmark', () => {});

    describe('Get bookmark', () => {});

    describe('Get bookmark by id', () => {});

    describe('Edit bookmark by id', () => {});

    describe('Delete bookmark by id', () => {});
  });
});
