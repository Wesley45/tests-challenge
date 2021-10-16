import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase";
import { IncorrectEmailOrPasswordError } from "./IncorrectEmailOrPasswordError";

let authenticateUserUseCase: AuthenticateUserUseCase;
let createUserUseCase: CreateUserUseCase;
let usersRepository: InMemoryUsersRepository;

describe("Authenticate User", () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository();
    authenticateUserUseCase = new AuthenticateUserUseCase(usersRepository);
    createUserUseCase = new CreateUserUseCase(usersRepository);
  });

  it("should be able to authenticate a user", async () => {
    const user = {
      name: "User Test",
      email: "user@test.com",
      password: "123456",
    };

    await createUserUseCase.execute({ ...user });

    const userAuthenticated = await authenticateUserUseCase.execute({
      email: user.email,
      password: user.password,
    });

    expect(userAuthenticated).toHaveProperty("token");
    expect(userAuthenticated).toHaveProperty("user");
    expect(userAuthenticated.user).toHaveProperty("id");
    expect(userAuthenticated.user.name).toBe(user.name);
    expect(userAuthenticated.user.email).toBe(user.email);
  });

  it("should not be able to authenticate a non-existent user", () => {
    expect(async () => {
      await authenticateUserUseCase.execute({
        email: "notexistentuser@test.com",
        password: "123456",
      });
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
  });

  it("should not be able to authenticate a user with an incorrect password.", () => {
    expect(async () => {
      const user = {
        name: "User Test Example",
        email: "user-example@test.com",
        password: "123456",
      };

      await createUserUseCase.execute({ ...user });

      await authenticateUserUseCase.execute({
        email: user.email,
        password: "1234567",
      });
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
  });
});
