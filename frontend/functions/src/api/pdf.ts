import * as admin from "firebase-admin";
import {Request, Response} from "express";

const db = admin.firestore();

export const getPDFs = async (req: Request, res: Response) => {
  try {
    // Get PDFs from Firestore
    const pdfsQuery = await db.collection("pdfs").get();

    if (pdfsQuery.empty) {
      // Return default PDFs if none exist
      return res.json({
        pdfs: [
          {
            id: "1",
            title: "NCC Cadet Handbook",
            description: "Complete handbook for NCC cadets",
            filename: "Ncc-CadetHandbook.pdf",
            url: "/api/pdf/download/1",
            pages: 150,
            category: "Handbook",
          },
        ],
      });
    }

    const pdfs = pdfsQuery.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return res.json({pdfs});
  } catch (error) {
    console.error("PDFs error:", error);
    return res.status(500).json({error: "Internal server error"});
  }
};

export const getPDFById = async (req: Request, res: Response) => {
  try {
    const pdfId = req.params.pdfId;

    // Get PDF from Firestore
    const pdfDoc = await db.collection("pdfs").doc(pdfId).get();

    if (!pdfDoc.exists) {
      return res.status(404).json({error: "PDF not found"});
    }

    const pdfData = {
      id: pdfDoc.id,
      ...pdfDoc.data(),
    };

    return res.json(pdfData);
  } catch (error) {
    console.error("PDF by ID error:", error);
    return res.status(500).json({error: "Internal server error"});
  }
};

export const downloadPDF = async (req: Request, res: Response) => {
  try {
    const pdfId = req.params.pdfId;

    // Get PDF info from Firestore
    const pdfDoc = await db.collection("pdfs").doc(pdfId).get();

    if (!pdfDoc.exists) {
      return res.status(404).json({error: "PDF not found"});
    }

    const pdfData = pdfDoc.data();

    // For now, return the file info
    // In a real implementation, you would serve the actual file
    return res.json({
      id: pdfId,
      filename: pdfData?.filename,
      downloadUrl: `https://storage.googleapis.com/veer-nirman.appspot.com/pdfs/${pdfData?.filename}`,
    });
  } catch (error) {
    console.error("PDF download error:", error);
    return res.status(500).json({error: "Internal server error"});
  }
};

export const searchPDF = async (req: Request, res: Response) => {
  try {
    const {query} = req.query;

    if (!query) {
      return res.status(400).json({error: "Query parameter is required"});
    }

    // Simple search implementation
    // In a real implementation, you would use full-text search
    const pdfsQuery = await db.collection("pdfs").get();
    const allPdfs = pdfsQuery.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    const searchResults = allPdfs.filter((pdf: admin.firestore.DocumentData) =>
      pdf.title?.toLowerCase().includes(query.toString().toLowerCase()) ||
      pdf.description?.toLowerCase().includes(query.toString().toLowerCase())
    );

    return res.json({
      query,
      results: searchResults,
      count: searchResults.length,
    });
  } catch (error) {
    console.error("PDF search error:", error);
    return res.status(500).json({error: "Internal server error"});
  }
};
