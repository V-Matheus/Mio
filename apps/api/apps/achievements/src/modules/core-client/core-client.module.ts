import { Module } from "@nestjs/common"
import { ClientsModule } from "@nestjs/microservices"
import { coreClientOptions } from "./core-client.registry"
import { CoreClientService } from "./core-client.service"

@Module({
  imports: [ClientsModule.register([coreClientOptions])],
  providers: [CoreClientService],
  exports: [CoreClientService],
})
export class CoreClientModule {}
