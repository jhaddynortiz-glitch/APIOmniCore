import { Controller, Post, Body, Get, Query, UseGuards, Request, HttpCode, HttpStatus, Put, Param, Delete } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get('check')
  async checkUser(@Query('email') email: string) {
    return this.usersService.checkUserExists(email);
  }

  @UseGuards(JwtAuthGuard)
  @Post('add-to-org')
  @HttpCode(HttpStatus.OK)
  async addUserToOrg(@Request() req: any, @Body() data: { email: string, role: string }) {
    const orgId = req.user.orgId;
    return this.usersService.addUserToOrganization(data.email, data.role, orgId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('org-members')
  async getOrgMembers(@Request() req: any) {
    return this.usersService.getOrgMembers(req.user.orgId);
  }

  @UseGuards(JwtAuthGuard)
  @Put('org-members/:userId')
  async updateOrgMember(@Request() req: any, @Param('userId') userId: string, @Body() data: { role?: string, status?: string }) {
    const orgId = req.user.orgId;
    return this.usersService.updateOrgMember(userId, orgId, data);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('org-members/:userId')
  async removeOrgMember(@Request() req: any, @Param('userId') userId: string) {
    const orgId = req.user.orgId;
    return this.usersService.removeOrgMember(userId, orgId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('my-invitations')
  async getMyInvitations(@Request() req: any) {
    return this.usersService.getMyInvitations(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('accept-invitation')
  @HttpCode(HttpStatus.OK)
  async acceptInvitation(@Request() req: any, @Body('organizationId') organizationId: string) {
    return this.usersService.acceptInvitation(req.user.userId, organizationId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('my-memberships')
  async getMyMemberships(@Request() req: any) {
    return this.usersService.getMyMemberships(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('all-orgs')
  async getAllOrgs(@Request() req: any) {
    // Solo Super Admin puede ver todo
    if (req.user.globalRole !== 'SUPER_ADMIN') {
      return { status: 'error', message: 'No tienes permisos para ver todas las organizaciones' };
    }
    return this.usersService.getAllPlatformOrganizations();
  }
}
