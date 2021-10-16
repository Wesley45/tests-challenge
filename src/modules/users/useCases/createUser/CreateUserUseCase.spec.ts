import { User } from "../../entities/User";
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserError } from "./CreateUserError";
import { CreateUserUseCase } from "./CreateUserUseCase";

let createUserUseCase: CreateUserUseCase;
let inMemoryUsersRepository: InMemoryUsersRepository;

describe("Create User", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
  });

  it("should be able to create a new user", async () => {
    const user = await createUserUseCase.execute({
      name: "User Test",
      email: "user@test.com",
      password: "test",
    });

    expect(user).toHaveProperty("id");
    expect(user.name).toBe("User Test");
    expect(user.email).toBe("user@test.com");
    expect(user).toBeInstanceOf(User);
  });

  it("should not be able to create a new user with existing email", () => {
    expect(async () => {
      await createUserUseCase.execute({
        name: "User Test",
        email: "user@test.com",
        password: "test",
      });

      await createUserUseCase.execute({
        name: "User Test",
        email: "user@test.com",
        password: "test",
      });
    }).rejects.toBeInstanceOf(CreateUserError);
  });
});
