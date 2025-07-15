import * as admin from "firebase-admin";
import {Request, Response} from "express";

// Initialize Firestore
const db = admin.firestore();

export const login = async (req: Request, res: Response) => {
  try {
    const {email, password} = req.body;

    // Mock authentication - replace with your logic
    if (email === "admin@veer-nirman.com" && password === "admin123") {
      const token = await admin.auth().createCustomToken("admin");
      res.json({
        access_token: token,
        token_type: "bearer",
        user: {
          id: "admin",
          email: "admin@veer-nirman.com",
          name: "Admin User",
        },
      });
    } else {
      res.status(401).json({error: "Invalid credentials"});
    }
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({error: "Internal server error"});
  }
};

export const register = async (req: Request, res: Response) => {
  try {
    const {email, password, name} = req.body;

    // Create user in Firebase Auth
    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName: name,
    });

    // Store additional user data in Firestore
    await db.collection("users").doc(userRecord.uid).set({
      email,
      name,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.status(201).json({
      message: "User created successfully",
      user: {
        id: userRecord.uid,
        email,
        name,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({error: "Internal server error"});
  }
};

export const getProfile = async (req: Request, res: Response) => {
  try {
    // Get user from Firebase Auth token
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({error: "No authorization header"});
    }

    const token = authHeader.split(" ")[1];
    const decodedToken = await admin.auth().verifyIdToken(token);

    // Get user profile from Firestore
    const userDoc = await db.collection("users").doc(decodedToken.uid).get();

    if (!userDoc.exists) {
      return res.status(404).json({error: "User not found"});
    }

    const userData = userDoc.data();
    return res.json({
      id: decodedToken.uid,
      email: decodedToken.email,
      name: userData?.name || decodedToken.name,
      ...userData,
    });
  } catch (error) {
    console.error("Profile error:", error);
    return res.status(500).json({error: "Internal server error"});
  }
};
