import { describe, expect, it } from "vitest";
import { catchError, catchErrorSync, isError, isSuccess } from "./catch-error";

describe("catchError", () => {
  it("should return [result, null] for successful promises", async () => {
    const promise = Promise.resolve("success");
    const [result, error] = await catchError(promise);

    expect(result).toBe("success");
    expect(error).toBeNull();
  });

  it("should return [null, error] for rejected promises", async () => {
    const promise = Promise.reject(new Error("failed"));
    const [result, error] = await catchError(promise);

    expect(result).toBeNull();
    expect(error).toBeInstanceOf(Error);
    expect(error?.message).toBe("failed");
  });

  it("should convert non-Error rejections to Error", async () => {
    const promise = Promise.reject("string error");
    const [result, error] = await catchError(promise);

    expect(result).toBeNull();
    expect(error).toBeInstanceOf(Error);
    expect(error?.message).toBe("string error");
  });

  it("should handle complex data types", async () => {
    const data = { id: 1, name: "test", nested: { value: true } };
    const promise = Promise.resolve(data);
    const [result, error] = await catchError(promise);

    expect(result).toEqual(data);
    expect(error).toBeNull();
  });
});

describe("catchErrorSync", () => {
  it("should return [result, null] for successful functions", () => {
    const fn = () => "success";
    const [result, error] = catchErrorSync(fn);

    expect(result).toBe("success");
    expect(error).toBeNull();
  });

  it("should return [null, error] for throwing functions", () => {
    const fn = () => {
      throw new Error("failed");
    };
    const [result, error] = catchErrorSync(fn);

    expect(result).toBeNull();
    expect(error).toBeInstanceOf(Error);
    expect(error?.message).toBe("failed");
  });

  it("should convert non-Error throws to Error", () => {
    const fn = () => {
      throw "string error";
    };
    const [result, error] = catchErrorSync(fn);

    expect(result).toBeNull();
    expect(error).toBeInstanceOf(Error);
    expect(error?.message).toBe("string error");
  });
});

describe("isError", () => {
  it("should return true for error results", async () => {
    const promise = Promise.reject(new Error("failed"));
    const result = await catchError(promise);

    expect(isError(result)).toBe(true);
    if (isError(result)) {
      // Type narrowing test
      expect(result[1]).toBeInstanceOf(Error);
    }
  });

  it("should return false for success results", async () => {
    const promise = Promise.resolve("success");
    const result = await catchError(promise);

    expect(isError(result)).toBe(false);
  });
});

describe("isSuccess", () => {
  it("should return true for success results", async () => {
    const promise = Promise.resolve("success");
    const result = await catchError(promise);

    expect(isSuccess(result)).toBe(true);
    if (isSuccess(result)) {
      // Type narrowing test
      expect(result[0]).toBe("success");
    }
  });

  it("should return false for error results", async () => {
    const promise = Promise.reject(new Error("failed"));
    const result = await catchError(promise);

    expect(isSuccess(result)).toBe(false);
  });
});

describe("real-world usage examples", () => {
  it("should handle API calls gracefully", async () => {
    // Simulate API call
    const fetchUser = async (id: number) => {
      if (id === 0) throw new Error("Invalid ID");
      return { id, name: "John Doe" };
    };

    // Success case
    const [user, userError] = await catchError(fetchUser(1));
    if (userError) {
      throw new Error("Should not error");
    }
    expect(user.name).toBe("John Doe");

    // Error case
    const [invalidUser, invalidError] = await catchError(fetchUser(0));
    expect(invalidUser).toBeNull();
    expect(invalidError?.message).toBe("Invalid ID");
  });

  it("should work with async/await chains", async () => {
    const step1 = async () => "step1";
    const step2 = async (input: string) => `${input}-step2`;
    const step3 = async (input: string) => `${input}-step3`;

    const [result1, error1] = await catchError(step1());
    if (error1) return;

    const [result2, error2] = await catchError(step2(result1));
    if (error2) return;

    const [result3, error3] = await catchError(step3(result2));
    if (error3) return;

    expect(result3).toBe("step1-step2-step3");
  });
});
