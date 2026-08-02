import { Global, Module } from "@nestjs/common"
import { EventPublisherService } from "./event-publisher.service"
import { OutboxPublisherService } from "./outbox-publisher.service"

@Global()
@Module({
  providers: [EventPublisherService, OutboxPublisherService],
  exports: [EventPublisherService, OutboxPublisherService],
})
export class EventsModule {}
