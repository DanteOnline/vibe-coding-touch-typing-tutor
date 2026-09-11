import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

describe("ui components", () => {
  it("renders button variants and asChild", () => {
    render(
      <>
        <Button>Default</Button>
        <Button variant="outline">Outline</Button>
        <Button asChild>
          <a href="/test">Link button</a>
        </Button>
      </>,
    );

    expect(screen.getByRole("button", { name: "Default" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Outline" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Link button" })).toBeInTheDocument();
  });

  it("renders input and label", () => {
    render(
      <>
        <Label htmlFor="name">Name</Label>
        <Input id="name" defaultValue="John" />
      </>,
    );

    expect(screen.getByLabelText("Name")).toHaveValue("John");
  });

  it("renders card sections", () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Title</CardTitle>
          <CardDescription>Description</CardDescription>
        </CardHeader>
        <CardContent>Content</CardContent>
      </Card>,
    );

    expect(screen.getByText("Title")).toBeInTheDocument();
    expect(screen.getByText("Description")).toBeInTheDocument();
    expect(screen.getByText("Content")).toBeInTheDocument();
  });
});
