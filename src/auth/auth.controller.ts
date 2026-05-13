import { Controller, Post, Body, UseGuards, Request, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Body() registerDto: any) {
    return this.authService.register(registerDto);
  }

  @Get('seed')
  async seed() {
    return this.authService.forceSeed();
  }

  @Get('migrate-contacts')
  async migrateContacts() {
    return this.authService.migrateContacts();
  }

  @Get('clear-chats')
  async clearChats() {
    return this.authService.clearChats();
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: any) {
    const user = await this.authService.validateUser(loginDto.email, loginDto.password);
    if (!user) {
      return { status: 'error', message: 'Credenciales inválidas' };
    }
    return this.authService.login(user);
  }

  @UseGuards(JwtAuthGuard)
  @Post('switch-organization')
  @HttpCode(HttpStatus.OK)
  async switchOrganization(@Request() req: any, @Body('organizationId') organizationId: string) {
    return this.authService.switchOrganization(req.user.userId, organizationId);
  }
}

