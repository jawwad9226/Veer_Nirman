import * as admin from "firebase-admin";
import {Request, Response} from "express";

const db = admin.firestore();

export const getVideos = async (req: Request, res: Response) => {
  try {
    // Get videos from Firestore
    const videosQuery = await db.collection("videos").get();

    if (videosQuery.empty) {
      // Return default videos if none exist
      return res.json({
        videos: [
          {
            id: "1",
            title: "Introduction to NCC",
            description: "Basic introduction to National Cadet Corps",
            url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
            thumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg",
            duration: "10:30",
            category: "Introduction",
          },
          {
            id: "2",
            title: "Leadership Training",
            description: "Leadership principles and training methods",
            url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
            thumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg",
            duration: "15:45",
            category: "Leadership",
          },
        ],
      });
    }

    const videos = videosQuery.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return res.json({videos});
  } catch (error) {
    console.error("Videos error:", error);
    return res.status(500).json({error: "Internal server error"});
  }
};

export const getVideoById = async (req: Request, res: Response) => {
  try {
    const videoId = req.params.videoId;

    // Get video from Firestore
    const videoDoc = await db.collection("videos").doc(videoId).get();

    if (!videoDoc.exists) {
      return res.status(404).json({error: "Video not found"});
    }

    const videoData = {
      id: videoDoc.id,
      ...videoDoc.data(),
    };

    return res.json(videoData);
  } catch (error) {
    console.error("Video by ID error:", error);
    return res.status(500).json({error: "Internal server error"});
  }
};

export const addVideo = async (req: Request, res: Response) => {
  try {
    const {title, description, url, thumbnail, duration, category} = req.body;

    // Get user from auth token
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({error: "No authorization header"});
    }

    const token = authHeader.split(" ")[1];
    const decodedToken = await admin.auth().verifyIdToken(token);

    // Add video to Firestore
    const videoRef = db.collection("videos").doc();
    await videoRef.set({
      title,
      description,
      url,
      thumbnail,
      duration,
      category,
      createdBy: decodedToken.uid,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return res.status(201).json({
      id: videoRef.id,
      message: "Video added successfully",
    });
  } catch (error) {
    console.error("Add video error:", error);
    return res.status(500).json({error: "Internal server error"});
  }
};

export const updateVideoProgress = async (req: Request, res: Response) => {
  try {
    const {videoId, progress, completed} = req.body;

    // Get user from auth token
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({error: "No authorization header"});
    }

    const token = authHeader.split(" ")[1];
    const decodedToken = await admin.auth().verifyIdToken(token);

    // Update user's video progress
    const progressRef = db
      .collection("user_progress")
      .doc(decodedToken.uid)
      .collection("videos")
      .doc(videoId);

    await progressRef.set({
      progress,
      completed,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    }, {merge: true});

    return res.json({
      message: "Video progress updated successfully",
      videoId,
      progress,
      completed,
    });
  } catch (error) {
    console.error("Video progress error:", error);
    return res.status(500).json({error: "Internal server error"});
  }
};
