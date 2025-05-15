import React from "react";
import { render } from "@testing-library/react";
import Header from "./components/header";

describe("Create Post Button Testing", () => {
  // Setup mock localStorage before each test
  beforeEach(() => {
    // Set up a mock implementation of localStorage
    const localStorageMock = {
      getItem: jest.fn(),
      setItem: jest.fn(),
      clear: jest.fn(),
      removeItem: jest.fn(),
    };

    // Replace the global localStorage object with our mock
    Object.defineProperty(window, "localStorage", {
      value: localStorageMock,
      writable: true,
    });

    // Set the mock to return a valid userData string for getItem("userData")
    window.localStorage.getItem.mockImplementation((key) => {
      if (key === "userData") {
        return JSON.stringify({ displayName: "TestUser" });
      }
      return null;
    });
  });

  test("Create Post button should be disabled for guest users and enabled for registered users", () => {
    // Test for guest user
    const { container: guestContainer } = render(
      <Header
        onPageChange={() => {}}
        handlePageChange={() => {}}
        currentPage="home"
        setSearchResults={() => {}}
        isLoggedIn={false}
      />
    );

    // Find the Create Post button for guest by its ID
    const guestCreatePostButton = guestContainer.querySelector("#create-post");

    // Verify it has the guest class which makes it disabled
    expect(guestCreatePostButton.className).toContain("newpostGuest");

    // Test for registered user
    const { container: userContainer } = render(
      <Header
        onPageChange={() => {}}
        handlePageChange={() => {}}
        currentPage="home"
        setSearchResults={() => {}}
        isLoggedIn={true}
      />
    );

    // Find the Create Post button for registered user
    const userCreatePostButton = userContainer.querySelector("#create-post");

    // Verify it has the enabled class
    expect(userCreatePostButton.className).toContain("newpost");
    expect(userCreatePostButton.className).not.toContain("newpostGuest");
  });
});
