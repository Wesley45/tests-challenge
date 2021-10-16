import request from "supertest";
import { Connection } from "typeorm";

import { app } from "../../../../app";
import createConnection from "../../../../database";

let connection: Connection;

describe("Authenticate User Controller", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to authenticate a user.", async () => {
    const user = {
      name: "Antônia Betina Almada",
      email: "aantoniabetinaalmada@email.tst",
      password: "123456",
    };

    await request(app).post("/api/v1/users").send({
      name: user.name,
      email: user.email,
      password: user.password,
    });

    const response = await request(app).post("/api/v1/sessions").send({
      email: user.email,
      password: user.password,
    });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("token");
    expect(response.body).toHaveProperty("user");
    expect(response.body.user).toHaveProperty("id");
    expect(response.body.user.name).toBe(user.name);
    expect(response.body.user.email).toBe(user.email);
  });

  it("should not be able to authenticate a non-existent user.", async () => {
    const response = await request(app).post("/api/v1/sessions").send({
      email: "taniaheloisagiovanasantos_@fk1.com.br",
      password: "123456",
    });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe("Incorrect email or password");
  });

  it("should not be able to authenticate a user with an incorrect password.", async () => {
    const user = {
      name: "João Isaac Baptista",
      email: "joaoisaacbaptista-92@pinheiromanaus.com",
      password: "123456",
    };

    await request(app).post("/api/v1/users").send({
      name: user.name,
      email: user.email,
      password: user.password,
    });

    const response = await request(app).post("/api/v1/sessions").send({
      email: user.email,
      password: "1234567",
    });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe("Incorrect email or password");
  });
});
