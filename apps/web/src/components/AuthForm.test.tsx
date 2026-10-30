import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
const { api, push } = vi.hoisted(() => ({ api: vi.fn(), push: vi.fn() }));
vi.mock("@/lib/api", () => ({ api }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));
import AuthForm from "./AuthForm";
describe("authentication form", () => {
  beforeEach(() => {
    api.mockReset();
    push.mockReset();
  });
  it("submits credentials and opens the authorized workspace", async () => {
    api
      .mockResolvedValueOnce({})
      .mockResolvedValueOnce({ workspaces: [{ id: "workspace-a" }] });
    render(<AuthForm />);
    fireEvent.change(screen.getByLabelText("Email address"), {
      target: { value: "owner@example.test" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "SecurePassword123" },
    });
    fireEvent.submit(
      screen.getByRole("button", { name: "Log in →" }).closest("form")!,
    );
    await waitFor(() =>
      expect(push).toHaveBeenCalledWith("/app/workspace-a/overview"),
    );
    expect(api).toHaveBeenCalledWith("/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email: "owner@example.test",
        password: "SecurePassword123",
      }),
    });
  });
  it("displays server rejection without navigating", async () => {
    api.mockRejectedValue(new Error("The email or password is incorrect."));
    render(<AuthForm />);
    fireEvent.submit(
      screen.getByRole("button", { name: "Log in →" }).closest("form")!,
    );
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "The email or password is incorrect.",
    );
    expect(push).not.toHaveBeenCalled();
  });
  it("provides registration confirmation and sends new accounts to onboarding", async () => {
    api.mockResolvedValueOnce({}).mockResolvedValueOnce({ workspaces: [] });
    render(<AuthForm register />);
    expect(screen.getByLabelText("Confirm password")).toBeRequired();
    fireEvent.submit(
      screen.getByRole("button", { name: "Create account ↗" }).closest("form")!,
    );
    await waitFor(() => expect(push).toHaveBeenCalledWith("/onboarding"));
  });
});
