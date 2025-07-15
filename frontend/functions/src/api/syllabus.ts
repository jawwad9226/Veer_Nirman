import * as admin from "firebase-admin";
import {Request, Response} from "express";

const db = admin.firestore();

export const getSyllabus = async (req: Request, res: Response) => {
  try {
    // Get syllabus from Firestore
    const syllabusDoc = await db.collection("syllabus").doc("main").get();

    if (!syllabusDoc.exists) {
      // Return default syllabus structure if none exists
      return res.json({
        subjects: [
          {
            id: "1",
            name: "Military History",
            topics: [
              {
                id: "1.1",
                name: "Ancient Military Tactics",
                completed: false,
              },
              {
                id: "1.2",
                name: "Modern Warfare",
                completed: false,
              },
            ],
          },
          {
            id: "2",
            name: "Leadership",
            topics: [
              {
                id: "2.1",
                name: "Leadership Principles",
                completed: false,
              },
              {
                id: "2.2",
                name: "Team Management",
                completed: false,
              },
            ],
          },
        ],
      });
    }

    const syllabusData = syllabusDoc.data();
    return res.json(syllabusData);
  } catch (error) {
    console.error("Syllabus error:", error);
    return res.status(500).json({error: "Internal server error"});
  }
};

export const updateSyllabusProgress = async (req: Request, res: Response) => {
  try {
    const {topicId, completed} = req.body;

    // Get user from auth token
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({error: "No authorization header"});
    }

    const token = authHeader.split(" ")[1];
    const decodedToken = await admin.auth().verifyIdToken(token);

    // Update user's progress
    const progressRef = db
      .collection("user_progress")
      .doc(decodedToken.uid)
      .collection("syllabus")
      .doc(topicId);

    await progressRef.set({
      completed,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    }, {merge: true});

    return res.json({
      message: "Progress updated successfully",
      topicId,
      completed,
    });
  } catch (error) {
    console.error("Syllabus progress error:", error);
    return res.status(500).json({error: "Internal server error"});
  }
};

export const getUserSyllabusProgress = async (req: Request, res: Response) => {
  try {
    // Get user from auth token
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({error: "No authorization header"});
    }

    const token = authHeader.split(" ")[1];
    const decodedToken = await admin.auth().verifyIdToken(token);

    // Get user's progress
    const progressQuery = await db
      .collection("user_progress")
      .doc(decodedToken.uid)
      .collection("syllabus")
      .get();

    const progress: Record<string, admin.firestore.DocumentData> = {};
    progressQuery.docs.forEach((doc) => {
      progress[doc.id] = doc.data();
    });

    return res.json({progress});
  } catch (error) {
    console.error("User syllabus progress error:", error);
    return res.status(500).json({error: "Internal server error"});
  }
};
