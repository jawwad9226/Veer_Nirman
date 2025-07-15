import * as admin from "firebase-admin";
import {Request, Response} from "express";

const db = admin.firestore();

export const getQuiz = async (req: Request, res: Response) => {
  try {
    const quizId = req.params.quizId || "default";

    // Get quiz from Firestore
    const quizDoc = await db.collection("quizzes").doc(quizId).get();

    if (!quizDoc.exists) {
      return res.status(404).json({error: "Quiz not found"});
    }

    const quizData = quizDoc.data();
    return res.json(quizData);
  } catch (error) {
    console.error("Quiz error:", error);
    return res.status(500).json({error: "Internal server error"});
  }
};

export const submitQuiz = async (req: Request, res: Response) => {
  try {
    const {answers, quizId} = req.body;

    // Get user from auth token
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({error: "No authorization header"});
    }

    const token = authHeader.split(" ")[1];
    const decodedToken = await admin.auth().verifyIdToken(token);

    // Save quiz submission
    const submissionRef = db.collection("quiz_submissions").doc();
    await submissionRef.set({
      userId: decodedToken.uid,
      quizId,
      answers,
      submittedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Calculate score (simplified)
    const score = Object.keys(answers).length * 10; // Mock scoring

    return res.json({
      score,
      submissionId: submissionRef.id,
      message: "Quiz submitted successfully",
    });
  } catch (error) {
    console.error("Quiz submission error:", error);
    return res.status(500).json({error: "Internal server error"});
  }
};

export const getQuizHistory = async (req: Request, res: Response) => {
  try {
    // Get user from auth token
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({error: "No authorization header"});
    }

    const token = authHeader.split(" ")[1];
    const decodedToken = await admin.auth().verifyIdToken(token);

    // Get user's quiz history
    const historyQuery = await db
      .collection("quiz_submissions")
      .where("userId", "==", decodedToken.uid)
      .orderBy("submittedAt", "desc")
      .limit(50)
      .get();

    const history = historyQuery.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return res.json({history});
  } catch (error) {
    console.error("Quiz history error:", error);
    return res.status(500).json({error: "Internal server error"});
  }
};
