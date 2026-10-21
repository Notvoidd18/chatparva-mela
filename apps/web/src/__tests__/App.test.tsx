import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import App from "../App.js";

// Polyfill ResizeObserver for jsdom
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock fetch so tests don't require a real server
const fetchMock = vi.fn();
vi.stubGlobal("fetch", fetchMock);

afterEach(() => {
  vi.clearAllMocks();
});

describe("App component", () => {
  it("renders without crashing", () => {
    // Return a pending promise so we stay in loading state
    fetchMock.mockReturnValue(new Promise(() => {}));
    const { container } = render(<App />);
    expect(container).toBeTruthy();
  });

  it("shows the Chatparva Mela title", () => {
    fetchMock.mockReturnValue(new Promise(() => {}));
    render(<App />);
    expect(screen.getByText(/(?:Chatparva Mela|MelaVerse Nepal)/i)).toBeInTheDocument();
  });

  it("shows loading spinner while fetching", () => {
    fetchMock.mockReturnValue(new Promise(() => {}));
    render(<App />);
    expect(screen.getByLabelText("Checking server...")).toBeInTheDocument();
  });

  it("shows subtitle text", () => {
    fetchMock.mockReturnValue(new Promise(() => {}));
    render(<App />);
    expect(
      screen.getByText(/Dashain.*Tihar.*Multiplayer/i)
    ).toBeInTheDocument();
  });

  it("shows Server Status card heading", () => {
    fetchMock.mockReturnValue(new Promise(() => {}));
    render(<App />);
    expect(screen.getByText("Server Status")).toBeInTheDocument();
  });
});
