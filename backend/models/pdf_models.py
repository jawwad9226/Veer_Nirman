from pydantic import BaseModel, Field
from typing import List, Optional

class PDFMetadata(BaseModel):
    title: str
    total_pages: int
    version: str
    file_size: int
    last_modified: str

class PDFPageRequest(BaseModel):
    page_number: int = Field(..., ge=1, description="Page number to retrieve (1-indexed)")

class PDFPageResponse(BaseModel):
    page_number: int
    total_pages: int
    content_url: str  # URL to the PDF content for that page

class PDFSearchRequest(BaseModel):
    query: str = Field(..., min_length=1, description="Search query for PDF content")
    page_range: Optional[List[int]] = Field(None, description="Search within specific page range")

class PDFSearchResult(BaseModel):
    page_number: int
    match_text: str
    context: str
    relevance_score: Optional[float] = None

class PDFSearchResponse(BaseModel):
    results: List[PDFSearchResult]
    total_results: int
    query: str
    search_time_ms: Optional[float] = None
