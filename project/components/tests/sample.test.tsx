import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";

function Hello({ name }: { name: string }) {
    return <div>Hello, {name}!</div>;
}

describe("Hello component", () => {
    it("renders the name passed in", () => {
        render(<Hello name="Elly" />);
        expect(screen.getByText("Hello, Elly!")).toBeInTheDocument();
    });
});