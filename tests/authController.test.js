const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { loginUser } = require("../controllers/usersController");
const User = require("../models/user");

jest.mock("../models/user"); // Mockowanie modelu użytkownika
jest.mock("bcrypt");
jest.mock("jsonwebtoken");

describe("loginUser Controller", () => {
  it("should return 200, a token, and user details on successful login", async () => {
    // Mock danych wejściowych
    const req = {
      body: {
        email: "test@example.com",
        password: "password123",
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const next = jest.fn();

    // Mock użytkownika w bazie danych
    const mockUser = {
      _id: "12345",
      email: "test@example.com",
      password: "hashedpassword123",
      subscription: "starter",
      save: jest.fn(),
    };

    // Mock funkcji modelu użytkownika
    User.findOne.mockResolvedValue(mockUser);

    // Mock funkcji bcrypt
    bcrypt.compare.mockResolvedValue(true);

    // Mock generowania tokenu
    const mockToken = "mock-jwt-token";
    jwt.sign.mockReturnValue(mockToken);

    // Wywołanie kontrolera
    await loginUser(req, res, next);

    // Sprawdź, czy odpowiedź ma status 200
    expect(res.status).toHaveBeenCalledWith(200);

    // Sprawdź, czy odpowiedź zawiera token i dane użytkownika
    expect(res.json).toHaveBeenCalledWith({
      token: mockToken,
      user: {
        email: mockUser.email,
        subscription: mockUser.subscription,
      },
    });

    // Sprawdź, czy token został zapisany
    expect(mockUser.save).toHaveBeenCalled();
  });

  it("should return 401 if email or password is incorrect", async () => {
    const req = {
      body: {
        email: "wrong@example.com",
        password: "wrongpassword",
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const next = jest.fn();

    // Mock braku użytkownika
    User.findOne.mockResolvedValue(null);

    await loginUser(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: "Email or password is wrong",
    });
  });
});
