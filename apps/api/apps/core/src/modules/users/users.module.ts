import { Module } from "@nestjs/common"
import { PrismaModule } from "../prisma/prisma.module"
import { UserEventsPublisher } from "./events/user-events.publisher"
import { UsersController } from "./users.controller"
import { UsersService } from "./users.service"

@Module({
  imports: [PrismaModule],
  controllers: [UsersController],
  providers: [UsersService, UserEventsPublisher],
})
export class UsersModule {}
