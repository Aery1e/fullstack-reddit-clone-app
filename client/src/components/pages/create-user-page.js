import React, { useState } from "react";
import modelService from "./model-service";
const bcrypt = require("bcrypt");
export default function CreateUserPage({ onPageChange }) {
  // State to track form data
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setconfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // For debugging - log on initial render
  console.log("CreateUserPage render - users:", modelService.data.users);

  // Add method to create a community to the model if it doesn't exist
  if (!modelService.createUser) {
    modelService.createUser = function (
      email,
      displayName,
      firstName,
      lastName,
      password
    ) {
      // Generate a new community ID
      const newUserId = `user${this.data.users.length + 1}`;

      // Create the new user object
      const newUser = {
        email: email,
        displayName: displayName,
        firstName: firstName,
        lastName: lastName,
        passwordHash: bcrypt.hashSync(password, 10),
        reputation: 100,
        joinDate: new Date(),
      };

      // Add the user to the users array
      this.data.users.push(newUser);

      return newUserId;
    };
  }

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate required fields
    if (
      !email ||
      !displayName ||
      !firstName ||
      !lastName ||
      !password ||
      !confirmPassword
    ) {
      alert("Please fill out all required fields.");
      return;
    }

    // Check if display name is taken

    // Check if email has already been used

    // Check if email is right format
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      alert("Email is not valid");
      return;
    }
    // Check if password doesn't contain first,last or email id in name
    let match = email.substring(0, email.indexOf("@"));
    if (
      match == null ||
      password.indexOf(match[0]) !== -1 ||
      password.indexOf(firstName) !== -1 ||
      password.indexOf(lastName) !== -1
    ) {
      alert(
        "First name, Last name and/or email id is not allowed to be apart of password"
      );
      return;
    }
    // Checks if passwords match
    if (password != confirmPassword) {
      alert("Password and confirm Password do not match");
      return;
    }

    try {
      console.log(
        "Before creating user - users:",
        modelService.data.users.length
      );

      // Create the new community
      const newUserId = modelService.createUser(
        email,
        displayName,
        firstName,
        lastName,
        password
      );

      console.log("Created new user:", newUserId);
      console.log(
        "After creating user - users:",
        modelService.data.users.length
      );

      // Show all communities for debugging
      console.log("All users after creation:");
      modelService.data.users.forEach((user) => {
        console.log(`- User ${user.userID}: ${user.email}`);
      });

      // Show success message
      alert("User created successfully!");

      // Navigate back to home page
      onPageChange("home");
    } catch (error) {
      console.error("Error creating user:", error);
      alert("An error occurred while creating the user. Please try again.");
    }
  };

  return (
    <div id="create-user-page" className="create-user-page">
      <h2>Register as New User</h2>
      <div>
        <label htmlFor="email">Email: (Required)</label>
        <br />
        <input
          id="Email"
          type="text"
          size="50"
          placeholder="Enter your Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <br />

        <label htmlFor="firstName">First Name: (Required)</label>
        <br />
        <textarea
          id="firstName"
          className="firstName"
          size="50"
          placeholder="First Name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
        ></textarea>
        <br />

        <label htmlFor="lastName">Last Name: (Required)</label>
        <br />
        <input
          id="lastName"
          type="text"
          size="50"
          placeholder="Last Name"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
        />
        <br />

        <label htmlFor="displayName">Display Name: (Required)</label>
        <br />
        <input
          id="displayName"
          type="text"
          size="50"
          placeholder="Display Name"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
        />
        <br />

        <label htmlFor="password">password: (Required)</label>
        <br />
        <input
          id="password"
          type="text"
          size="50"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <br />

        <label htmlFor="confirmPassword">Confirm Password: (Required)</label>
        <br />
        <input
          id="confirmPassword"
          type="text"
          size="50"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setconfirmPassword(e.target.value)}
        />
        <br />

        <button
          id="create-user-submit"
          className="button"
          type="button"
          onClick={handleSubmit}
        >
          Register
        </button>
      </div>
    </div>
  );
}
