import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { signOut } from "next-auth/react";
import { describe, expect, it, vi } from "vitest";

import { LogoutButton } from "@/components/layout/LogoutButton";

vi.mock("next-auth/react", () => ({
  signOut: vi.fn(),
}));

describe("LogoutButton", () => {
  it("calls signOut on click", async () => {
    const user = userEvent.setup();
    render(<LogoutButton />);

    await user.click(screen.getByRole("button", { name: "Выйти" }));

    expect(signOut).toHaveBeenCalledWith({ callbackUrl: "/" });
  });
});
