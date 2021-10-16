import request from "supertest";
import { Connection } from "typeorm";
import { sign } from "jsonwebtoken";

import { app } from "../../../../app";
import authConfig from "../../../../config/auth";
import createConnection from "../../../../database";

let connection: Connection;

describe("Get Balance Controller", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to return a list of all deposit, withdraw and total balance transactions of the authenticated user.", async () => {
    const user = {
      name: "Eduardo Edson Novaes",
      email: "eduardoedsonnovaes@test.com",
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
      .get("/api/v1/statements/balance")
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("statement");
    expect(response.body).toHaveProperty("balance");
    expect(response.body.statement.length).toBe(0);
    expect(response.body.balance).toBe(0);
  });

  it("should not be able to return a list of all deposit, withdraw and total balance transactions that user does not exist.", async () => {
    const { secret, expiresIn } = authConfig.jwt;

    const token = sign({}, secret, {
      subject: "de8ce662-e09b-4139-ab61-3b56dc825feb",
      expiresIn,
    });

    const response = await request(app)
      .get("/api/v1/statements/balance")
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(404);
    expect(response.body.message).toBe("User not found");
  });
});
