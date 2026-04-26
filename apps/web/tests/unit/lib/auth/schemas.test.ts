import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
} from "../../../../lib/auth/schemas"

describe("loginSchema", () => {
  it("should accept a valid email and password", () => {
    const result = loginSchema.safeParse({
      email: "user@example.com",
      password: "anything",
    })

    expect(result.success).toBe(true)
  })

  it("should reject an invalid email", () => {
    const result = loginSchema.safeParse({
      email: "not-an-email",
      password: "anything",
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0]?.path).toEqual(["email"])
    }
  })

  it("should reject an empty password", () => {
    const result = loginSchema.safeParse({
      email: "user@example.com",
      password: "",
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0]?.path).toEqual(["password"])
    }
  })

  it("should reject when fields are missing", () => {
    const result = loginSchema.safeParse({})

    expect(result.success).toBe(false)
  })
})

describe("registerSchema", () => {
  const validInput = {
    name: "Victor Sousa",
    email: "victor@example.com",
    password: "Strong1Pass",
    confirmPassword: "Strong1Pass",
    terms: "on",
  }

  it("should accept a fully valid input", () => {
    const result = registerSchema.safeParse(validInput)

    expect(result.success).toBe(true)
  })

  it("should reject a short name", () => {
    const result = registerSchema.safeParse({ ...validInput, name: "V" })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path[0] === "name")).toBe(true)
    }
  })

  it("should trim the name before validating length", () => {
    const result = registerSchema.safeParse({
      ...validInput,
      name: "  Vi  ",
    })

    expect(result.success).toBe(true)
  })

  it("should reject a password shorter than 8 characters", () => {
    const result = registerSchema.safeParse({
      ...validInput,
      password: "Aa1",
      confirmPassword: "Aa1",
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path[0] === "password")).toBe(
        true,
      )
    }
  })

  it("should reject a password without uppercase", () => {
    const result = registerSchema.safeParse({
      ...validInput,
      password: "weakpass1",
      confirmPassword: "weakpass1",
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path[0] === "password")).toBe(
        true,
      )
    }
  })

  it("should reject a password without numbers", () => {
    const result = registerSchema.safeParse({
      ...validInput,
      password: "WeakPassword",
      confirmPassword: "WeakPassword",
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path[0] === "password")).toBe(
        true,
      )
    }
  })

  it("should reject when confirmPassword does not match password", () => {
    const result = registerSchema.safeParse({
      ...validInput,
      confirmPassword: "Different1Pass",
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(
        result.error.issues.some((i) => i.path[0] === "confirmPassword"),
      ).toBe(true)
    }
  })

  it("should reject when terms is not 'on'", () => {
    const result = registerSchema.safeParse({ ...validInput, terms: undefined })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path[0] === "terms")).toBe(true)
    }
  })

  it("should reject an invalid email", () => {
    const result = registerSchema.safeParse({
      ...validInput,
      email: "invalid",
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path[0] === "email")).toBe(true)
    }
  })
})

describe("forgotPasswordSchema", () => {
  it("should accept a valid email", () => {
    const result = forgotPasswordSchema.safeParse({
      email: "user@example.com",
    })

    expect(result.success).toBe(true)
  })

  it("should reject an invalid email", () => {
    const result = forgotPasswordSchema.safeParse({ email: "nope" })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0]?.path).toEqual(["email"])
    }
  })

  it("should reject when email is missing", () => {
    const result = forgotPasswordSchema.safeParse({})

    expect(result.success).toBe(false)
  })
})
