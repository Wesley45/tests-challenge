import request from "supertest";
import { Connection } from "typeorm";
import { sign } from "jsonwebtoken";
import { v4 as uuid } from "uuid";

import { app } from "../../../../app";
import authConfig from "../../../../config/auth";
import createConnection from "../../../../database";

let connection: Connection;

describe("Get Statement Operation Controller", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to return information from the deposit transaction.", async () => {
    const user = {
      name: "Liz Bianca Cristiane Barros",
      email: "lizbiancacristianebarros-86@purkyt.com",
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

    const responseDeposit = await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        amount: 100,
        description: "Test deposit",
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    const { id } = responseDeposit.body;

    const response = await request(app)
      .get(`/api/v1/statements/${id}`)
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(200);

    expect(response.body.id).toBe(id);
    expect(response.body.user_id).toBe(authenticatedUser.body.user.id);
    expect(response.body.description).toBe("Test deposit");
    expect(response.body.amount).toBe("100.00");
    expect(response.body.type).toBe("deposit");

    expect(response.body).toHaveProperty("created_at");
    expect(response.body).toHaveProperty("updated_at");
  });

  it("should not be able to return deposit transaction information not found.", async () => {
    const user = {
      name: "Sophia Jaqueline Isabel Sales",
      email: "sophiajaquelineisabelsales@test.com",
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
      .get(`/api/v1/statements/${uuid()}`)
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(404);
    expect(response.body.message).toBe("Statement not found");
  });

  it("should not be able to return information from the deposit transaction for the user that does not exist.", async () => {
    const { secret, expiresIn } = authConfig.jwt;

    const token = sign({}, secret, {
      subject: "de8ce662-e09b-4139-ab61-3b56dc825feb",
      expiresIn,
    });

    const response = await request(app)
      .get(`/api/v1/statements/${uuid()}`)
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(404);
    expect(response.body.message).toBe("User not found");
  });
});
