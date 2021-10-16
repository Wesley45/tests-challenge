import request from "supertest";
import { Connection } from "typeorm";
import { sign } from "jsonwebtoken";

import { app } from "../../../../app";
import authConfig from "../../../../config/auth";
import createConnection from "../../../../database";

let connection: Connection;

describe("Create Statement Controller", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to create a new deposit", async () => {
    const user = {
      name: "Yago Rodrigo Arthur Ribeiro",
      email: "yyagorodrigoarthurribeiro@test.com",
      password: "123456",
    };

    await request(app).post("/api/v1/users").send({
      name: user.name,
      email: user.email,
      password: user.password,
    });

    const authenticatedUser = await request(app).post("/api/v1/sessions").send({
      email: user.email,
      password: user.password,
    });

    const { token } = authenticatedUser.body;

    const response = await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        amount: 100,
        description: "Test deposit",
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(201);

    expect(response.body.description).toBe("Test deposit");
    expect(response.body.amount).toBe(100);
    expect(response.body.type).toBe("deposit");
    expect(response.body).toHaveProperty("id");
    expect(response.body).toHaveProperty("user_id");
    expect(response.body).toHaveProperty("created_at");
    expect(response.body).toHaveProperty("updated_at");
  });

  it("should not be able to create a new deposit for the user that does not exist.", async () => {
    const { secret, expiresIn } = authConfig.jwt;

    const token = sign({}, secret, {
      subject: "de8ce662-e09b-4139-ab61-3b56dc825feb",
      expiresIn,
    });

    const response = await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        amount: 100,
        description: "Test deposit",
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(404);
    expect(response.body.message).toBe("User not found");
  });

  it("should be able to create a new withdraw", async () => {
    const user = {
      name: "Raul Isaac Julio Fogaça",
      email: "raulisaacjuliofogaca@test.com",
      password: "123456",
    };

    await request(app).post("/api/v1/users").send({
      name: user.name,
      email: user.email,
      password: user.password,
    });

    const authenticatedUser = await request(app).post("/api/v1/sessions").send({
      email: user.email,
      password: user.password,
    });

    const { token } = authenticatedUser.body;

    await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        amount: 200,
        description: "Test deposit",
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    const response = await request(app)
      .post("/api/v1/statements/withdraw")
      .send({
        amount: 100,
        description: "Test withdraw",
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(201);

    expect(response.body.description).toBe("Test withdraw");
    expect(response.body.amount).toBe(100);
    expect(response.body.type).toBe("withdraw");
    expect(response.body).toHaveProperty("id");
    expect(response.body).toHaveProperty("user_id");
    expect(response.body).toHaveProperty("created_at");
    expect(response.body).toHaveProperty("updated_at");
  });

  it("should not be able to create a new withdraw if the balance is invalid", async () => {
    const user = {
      name: "Larissa Giovana Brito",
      email: "larissagiovanabrito@test.com",
      password: "123456",
    };

    await request(app).post("/api/v1/users").send({
      name: user.name,
      email: user.email,
      password: user.password,
    });

    const authenticatedUser = await request(app).post("/api/v1/sessions").send({
      email: user.email,
      password: user.password,
    });

    const { token } = authenticatedUser.body;

    const response = await request(app)
      .post("/api/v1/statements/withdraw")
      .send({
        amount: 100,
        description: "Test withdraw",
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Insufficient funds");
  });
});
