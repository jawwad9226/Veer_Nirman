import * as admin from "firebase-admin";
import {Request, Response} from "express";

const db = admin.firestore();

export const getUserProgress = async (req: Request, res: Response) => {
  try {
    // Get user from auth token
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({error: "No authorization header"});
    }

    const token = authHeader.split(" ")[1];
    const decodedToken = await admin.auth().verifyIdToken(token);

    // Get user's overall progress
    const progressRef = db.collection("user_progress").doc(decodedToken.uid);
    const progressDoc = await progressRef.get();

    // Get syllabus progress
    const syllabusProgress = await progressRef.collection("syllabus").get();
    const syllabusData: Record<string, admin.firestore.DocumentData> = {};
    syllabusProgress.docs.forEach((doc) => {
      syllabusData[doc.id] = doc.data();
    });

    // Get video progress
    const videoProgress = await progressRef.collection("videos").get();
    const videoData: Record<string, admin.firestore.DocumentData> = {};
    videoProgress.docs.forEach((doc) => {
      videoData[doc.id] = doc.data();
    });

    // Get quiz progress
    const quizProgress = await db
      .collection("quiz_submissions")
      .where("userId", "==", decodedToken.uid)
      .get();

    const quizData = quizProgress.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    const overallProgress = progressDoc.exists ? progressDoc.data() : {};

    return res.json({
      userId: decodedToken.uid,
      overall: overallProgress,
      syllabus: syllabusData,
      videos: videoData,
      quizzes: quizData,
    });
  } catch (error) {
    console.error("User progress error:", error);
    return res.status(500).json({error: "Internal server error"});
  }
};

export const updateUserProgress = async (req: Request, res: Response) => {
  try {
    const {type, itemId, progress, completed} = req.body;

    // Get user from auth token
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({error: "No authorization header"});
    }

    const token = authHeader.split(" ")[1];
    const decodedToken = await admin.auth().verifyIdToken(token);

    // Update progress based on type
    let progressRef;

    if (type === "syllabus") {
      progressRef = db
        .collection("user_progress")
        .doc(decodedToken.uid)
        .collection("syllabus")
        .doc(itemId);
    } else if (type === "video") {
      progressRef = db
        .collection("user_progress")
        .doc(decodedToken.uid)
        .collection("videos")
        .doc(itemId);
    } else {
      return res.status(400).json({error: "Invalid progress type"});
    }

    await progressRef.set({
      progress,
      completed,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    }, {merge: true});

    return res.json({
      message: "Progress updated successfully",
      type,
      itemId,
      progress,
      completed,
    });
  } catch (error) {
    console.error("Update progress error:", error);
    return res.status(500).json({error: "Internal server error"});
  }
};

export const getProgressStats = async (req: Request, res: Response) => {
  try {
    // Get user from auth token
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({error: "No authorization header"});
    }

    const token = authHeader.split(" ")[1];
    const decodedToken = await admin.auth().verifyIdToken(token);

    // Get progress statistics
    const progressRef = db.collection("user_progress").doc(decodedToken.uid);

    // Count completed items
    const syllabusProgress = await progressRef.collection("syllabus").get();
    const completedSyllabus = syllabusProgress.docs.filter(
      (doc) => doc.data().completed
    ).length;

    const videoProgress = await progressRef.collection("videos").get();
    const completedVideos = videoProgress.docs.filter(
      (doc) => doc.data().completed
    ).length;

    const quizProgress = await db
      .collection("quiz_submissions")
      .where("userId", "==", decodedToken.uid)
      .get();

    const totalQuizzes = quizProgress.docs.length;

    return res.json({
      stats: {
        syllabusCompleted: completedSyllabus,
        syllabusTotal: syllabusProgress.docs.length,
        videosCompleted: completedVideos,
        videosTotal: videoProgress.docs.length,
        quizzesTaken: totalQuizzes,
        overallProgress: Math.round(
          ((completedSyllabus + completedVideos + totalQuizzes) /
            (syllabusProgress.docs.length + videoProgress.docs.length + 10)) *
            100
        ),
      },
    });
  } catch (error) {
    console.error("Progress stats error:", error);
    return res.status(500).json({error: "Internal server error"});
  }
};
