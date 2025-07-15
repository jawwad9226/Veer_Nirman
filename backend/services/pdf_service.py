"""
PDF Service for NCC ABYAS
Handles PDF file operations including metadata, page serving, and content search.
"""
import os
import logging
from typing import List, Optional, Dict, Any
from pathlib import Path
from datetime import datetime
from models.pdf_models import (
    PDFMetadata, 
    PDFPageRequest, 
    PDFPageResponse, 
    PDFSearchRequest, 
    PDFSearchResult, 
    PDFSearchResponse
)

logger = logging.getLogger(__name__)

class PDFService:
    def __init__(self, pdf_path: str = "data/Ncc-CadetHandbook.pdf"):
        self.pdf_path = Path(pdf_path)
        self.pdf_filename = "Ncc-CadetHandbook.pdf"
        
        if not self.pdf_path.exists():
            logger.error(f"PDF file not found at {self.pdf_path}")
            raise FileNotFoundError(f"PDF file not found at {self.pdf_path}")
    
    def get_pdf_metadata(self) -> PDFMetadata:
        """Get PDF metadata including file size, modification date, etc."""
        try:
            stat = self.pdf_path.stat()
            
            # For a real implementation, you'd use PyPDF2 or similar to get actual page count
            # For now, using a reasonable estimate for the NCC handbook
            estimated_pages = 300  # This should be determined from actual PDF
            
            return PDFMetadata(
                title="NCC Cadet Handbook",
                total_pages=estimated_pages,
                version="2024",
                file_size=stat.st_size,
                last_modified=datetime.fromtimestamp(stat.st_mtime).isoformat()
            )
        except Exception as e:
            logger.error(f"Error getting PDF metadata: {e}")
            raise
    
    def get_pdf_file_path(self) -> str:
        """Get the absolute path to the PDF file for serving."""
        return str(self.pdf_path.absolute())
    
    def get_page_content_url(self, page_number: int) -> PDFPageResponse:
        """Get URL for specific page content."""
        metadata = self.get_pdf_metadata()
        
        if page_number < 1 or page_number > metadata.total_pages:
            raise ValueError(f"Page number {page_number} is out of range (1-{metadata.total_pages})")
        
        # URL will be handled by FastAPI static file serving
        content_url = f"/api/pdf/page/{page_number}"
        
        return PDFPageResponse(
            page_number=page_number,
            total_pages=metadata.total_pages,
            content_url=content_url
        )
    
    def search_pdf_content(self, query: str, page_range: Optional[List[int]] = None) -> PDFSearchResponse:
        """
        Search for content within the PDF.
        For now, this is a placeholder that would integrate with PDF text extraction.
        In a full implementation, you'd use libraries like PyPDF2, pdfplumber, or Tesseract for OCR.
        """
        start_time = datetime.now()
        
        # Placeholder results - in real implementation, this would:
        # 1. Extract text from PDF pages
        # 2. Search for query terms
        # 3. Return matches with context and page numbers
        
        mock_results = []
        query_lower = query.lower()
        
        # Generate mock results based on common NCC topics
        if "ncc" in query_lower:
            mock_results = [
                PDFSearchResult(
                    page_number=1,
                    match_text="National Cadet Corps (NCC) is a premier organization...",
                    context="The NCC is the largest uniformed youth organization in the world, with a mission to develop character, leadership, and service orientation.",
                    relevance_score=0.98
                ),
                PDFSearchResult(
                    page_number=5,
                    match_text="...the NCC aims to develop qualities of character, discipline...",
                    context="NCC training programs focus on developing essential life skills through various activities and training modules.",
                    relevance_score=0.92
                ),
                PDFSearchResult(
                    page_number=25,
                    match_text="...NCC cadets participate in various camps and competitions...",
                    context="Regular participation in NCC activities helps cadets build confidence and leadership capabilities.",
                    relevance_score=0.85
                )
            ]
        elif query_lower in ["drill", "training", "discipline"]:
            mock_results = [
                PDFSearchResult(
                    page_number=45,
                    match_text=f"...{query} is an essential part of NCC training...",
                    context=f"This section covers the importance of {query} in cadet development and its role in building character.",
                    relevance_score=0.95
                ),
                PDFSearchResult(
                    page_number=78,
                    match_text=f"...advanced {query} techniques for senior cadets...",
                    context=f"Advanced concepts related to {query} are covered in this chapter for senior cadets.",
                    relevance_score=0.87
                )
            ]
        elif query_lower in ["leadership", "character", "service"]:
            mock_results = [
                PDFSearchResult(
                    page_number=191,
                    match_text=f"...{query} development through NCC activities...",
                    context=f"The {query} chapter outlines key principles and practical exercises for cadet development.",
                    relevance_score=0.93
                ),
                PDFSearchResult(
                    page_number=205,
                    match_text=f"...practical examples of {query} in action...",
                    context=f"Real-world scenarios demonstrating the application of {query} skills in various situations.",
                    relevance_score=0.88
                )
            ]
        
        # Filter by page range if specified
        if page_range:
            mock_results = [r for r in mock_results if r.page_number in page_range]
        
        search_time_ms = (datetime.now() - start_time).total_seconds() * 1000
        
        return PDFSearchResponse(
            results=mock_results,
            total_results=len(mock_results),
            query=query,
            search_time_ms=search_time_ms
        )
    
    def get_chapter_page_mapping(self) -> Dict[str, Dict[str, int]]:
        """
        Get mapping of syllabus chapters to PDF page ranges.
        This would typically be manually curated or extracted from PDF bookmarks/TOC.
        """
        # This is a sample mapping - in reality, this would be carefully mapped
        # to the actual PDF content
        return {
            "Introduction to NCC": {"start": 1, "end": 15},
            "Drill and Discipline": {"start": 16, "end": 45},
            "Physical Training": {"start": 46, "end": 75},
            "Map Reading": {"start": 76, "end": 95},
            "Field Craft": {"start": 96, "end": 120},
            "First Aid": {"start": 121, "end": 145},
            "Weapon Training": {"start": 146, "end": 170},
            "Communication": {"start": 171, "end": 190},
            "Leadership": {"start": 191, "end": 210},
            "Camp Training": {"start": 211, "end": 235},
            "Adventure Activities": {"start": 236, "end": 260},
            "Social Service": {"start": 261, "end": 280},
            "Career Guidance": {"start": 281, "end": 295},
            "Miscellaneous": {"start": 296, "end": 300}
        }
    
    def get_page_for_chapter(self, chapter_title: str) -> Optional[Dict[str, int]]:
        """Get the page range for a specific chapter."""
        mapping = self.get_chapter_page_mapping()
        return mapping.get(chapter_title)

# Global PDF service instance
pdf_service = PDFService()
