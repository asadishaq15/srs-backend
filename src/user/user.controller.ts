import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Post,
  Res,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UserRole } from 'utils/enum';
import { Response } from 'express';

@Controller('user')
export class UserController {
  constructor(private authService: UserService) {}

  @Post('login')
  async login(@Body() body, @Res({ passthrough: true }) res: Response) {
    const { email, password, role } = body;
    console.log(email, password);
    const user = await this.authService.validateUser(
      email,
      password,
      role,
    );
    if (!user) {
      throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
    }

    const token = this.authService.generateJwt(user);

    const now = new Date();
    const expireAtMidnight = new Date();
    expireAtMidnight.setHours(23, 59, 59, 999);

    const maxAge = expireAtMidnight.getTime() - now.getTime();

    res.cookie('token', token, {
      httpOnly: false,
      sameSite: 'lax',
      secure: false, // true for HTTPS
      maxAge: maxAge, // 7 days
    });
    let id;
    if ('_id' in user) {
      id = user._id;
    } else if ('id' in user) {
      id = user.id;
    } else {
      id = null;
    }
    return { success: true, message: 'Login successful', id };

  }
}
