import type { INestApplication } from "@nestjs/common"
import { Test, type TestingModule } from "@nestjs/testing"
import request from "supertest"
import type { App } from "supertest/types"
import { AppModule } from "../../src/app.module"

describe("AppController (e2e)", () => {
  let app: INestApplication<App>

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleFixture.createNestApplication()
    await app.init()
  })

  it("/ (GET)", async () => {
    const response = await request(app.getHttpServer()).get("/")

    expect(response.status).toBe(200)
    expect(response.text).toBe("Hello World!")
  })
})
