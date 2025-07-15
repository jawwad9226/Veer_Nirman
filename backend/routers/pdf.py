"""
PDF Router for NCC ABYAS
Provides endpoints for PDF viewing, metadata, and content search.
"""
from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import FileResponse
from typing import Optional, List
import logging
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from models.pdf_models import PDFMetadata, PDFPageRequest, PDFPageResponse, PDFSearchRequest, PDFSearchResponse
from services.pdf_service import pdf_service

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/pdf", tags=["PDF"])

@router.get("/health")
async def pdf_health_check():
    """Health check for PDF service."""
    try:
        metadata = pdf_service.get_pdf_metadata()
        return {
            "status": "healthy",
            "pdf_available": True,
            "total_pages": metadata.total_pages,
            "file_size": metadata.file_size
        }
    except Exception as e:
        logger.error(f"PDF health check failed: {e}")
        return {
            "status": "error",
            "pdf_available": False,
            "error": str(e)
        }

@router.get("/metadata", response_model=PDFMetadata)
async def get_pdf_metadata():
    """Get PDF metadata including total pages, file size, etc."""
    try:
        return pdf_service.get_pdf_metadata()
    except Exception as e:
        logger.error(f"Error getting PDF metadata: {e}")
        raise HTTPException(status_code=500, detail="Failed to get PDF metadata")

@router.get("/download")
async def download_pdf():
    """Download the complete PDF file."""
    try:
        pdf_path = pdf_service.get_pdf_file_path()
        return FileResponse(
            path=pdf_path,
            filename="NCC-Cadet-Handbook.pdf",
            media_type="application/pdf"
        )
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="PDF file not found")
    except Exception as e:
        logger.error(f"Error serving PDF download: {e}")
        raise HTTPException(status_code=500, detail="Failed to serve PDF file")

@router.get("/view")
@router.head("/view") 
async def view_pdf():
    """View the PDF file in browser."""
    try:
        pdf_path = pdf_service.get_pdf_file_path()
        return FileResponse(
            path=pdf_path,
            media_type="application/pdf",
            headers={"Content-Disposition": "inline; filename=NCC-Cadet-Handbook.pdf"}
        )
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="PDF file not found")
    except Exception as e:
        logger.error(f"Error serving PDF view: {e}")
        raise HTTPException(status_code=500, detail="Failed to serve PDF file")

@router.get("/page/{page_number}", response_model=PDFPageResponse)
async def get_page_info(page_number: int):
    """Get information about a specific page."""
    try:
        if page_number < 1:
            raise HTTPException(status_code=400, detail="Page number must be positive")
        
        return pdf_service.get_page_content_url(page_number)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error getting page info: {e}")
        raise HTTPException(status_code=500, detail="Failed to get page information")

@router.post("/search", response_model=PDFSearchResponse)
async def search_pdf(request: PDFSearchRequest):
    """Search for content within the PDF."""
    try:
        return pdf_service.search_pdf_content(
            query=request.query,
            page_range=request.page_range
        )
    except Exception as e:
        logger.error(f"Error searching PDF: {e}")
        raise HTTPException(status_code=500, detail="Failed to search PDF content")

@router.get("/search", response_model=PDFSearchResponse)
async def search_pdf_get(
    q: str = Query(..., description="Search query"),
    page_start: Optional[int] = Query(None, description="Start page for search range"),
    page_end: Optional[int] = Query(None, description="End page for search range")
):
    """Search for content within the PDF (GET method for convenience)."""
    try:
        page_range = None
        if page_start is not None and page_end is not None:
            page_range = list(range(page_start, page_end + 1))
        elif page_start is not None:
            page_range = [page_start]
        
        return pdf_service.search_pdf_content(
            query=q,
            page_range=page_range
        )
    except Exception as e:
        logger.error(f"Error searching PDF: {e}")
        raise HTTPException(status_code=500, detail="Failed to search PDF content")

@router.get("/chapter-mapping")
async def get_chapter_page_mapping():
    """Get the mapping of syllabus chapters to PDF page ranges."""
    try:
        return {
            "chapter_pages": pdf_service.get_chapter_page_mapping(),
            "total_chapters": len(pdf_service.get_chapter_page_mapping())
        }
    except Exception as e:
        logger.error(f"Error getting chapter mapping: {e}")
        raise HTTPException(status_code=500, detail="Failed to get chapter page mapping")

@router.get("/chapter/{chapter_title}/pages")
async def get_chapter_pages(chapter_title: str):
    """Get the page range for a specific chapter."""
    try:
        page_info = pdf_service.get_page_for_chapter(chapter_title)
        if page_info is None:
            raise HTTPException(status_code=404, detail=f"Chapter '{chapter_title}' not found")
        
        return {
            "chapter_title": chapter_title,
            "page_start": page_info["start"],
            "page_end": page_info["end"],
            "total_pages": page_info["end"] - page_info["start"] + 1
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting chapter pages: {e}")
        raise HTTPException(status_code=500, detail="Failed to get chapter page information")
