import os
import tempfile
import logging
from typing import Optional, Any, Annotated

from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from .rag import (
    query_document,
    index_get_pdf,
    index_get_txt,
    index_get_plain_text,
)

app = FastAPI()
logger = logging.getLogger(__name__)

raw_origins = os.getenv("ALLOWED_ORIGINS", "*").strip()
##this is used to set up cors policy for the api matlab this is more like specifying who can access the api 
##aur add.middleware is used to add cors policy to the api definy and joined is sperate thing
if raw_origins == "*": 
    cors_origins = ["*"]
    cors_allow_credentials = False
else:
    cors_origins = [origin for origin in (item.strip() for item in raw_origins.split(",")) if origin]
    cors_allow_credentials = True
    if not cors_origins:
        raise RuntimeError("ALLOWED_ORIGINS must list at least one origin or be '*'")
    
app.add_middleware(     ##so this is real thing this decides who can access the api 
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=cors_allow_credentials,
    allow_methods=["*"],
    allow_headers=["*"],
)

class UploadResponse(BaseModel):
    document_id: str
    
    
class ChatRequest(BaseModel):
    question: str
    document_id: Optional[str] = None
    
class ChatResponse(BaseModel):
    answer:str
    sources :list[str]
    blocked: bool = False
    
# UploadField = Annotated[UploadFile | None, File(None)]
# PlainTextField = Annotated[str | None, Form()]

def _coerce_upload(value:Any)->UploadFile |None:
    if value is None:
        return None
    if isinstance(value,UploadFile):
        return value
    if hasattr(value,"filename") and hasattr(value,"file"):
        return value
    return None

@app.post("/upload", response_model=UploadResponse)
async def upload_document(
    pdf_file: UploadFile | None = File(default=None),
    txt_file: UploadFile | None = File(default=None),
    plain_text: str | None = Form(default=None),
) -> UploadResponse:
    try:
        pdf_upload = _coerce_upload(pdf_file)
        txt_upload = _coerce_upload(txt_file)

        if pdf_upload is not None:
            logger.info("Processing PDF upload: %s", pdf_upload.filename)
            contents = await pdf_upload.read()
            doc_id = index_get_pdf(contents, pdf_upload.filename or "document.pdf")
            return UploadResponse(document_id=doc_id)

        if txt_upload is not None:
            logger.info("Processing TXT upload: %s", txt_upload.filename)
            contents = await txt_upload.read()
            doc_id = index_get_txt(contents.decode("utf-8"), txt_upload.filename or "document.txt")
            return UploadResponse(document_id=doc_id)

        if plain_text is not None and plain_text.strip():
            logger.info("Processing plain text upload")
            doc_id = index_get_plain_text(plain_text)
            return UploadResponse(document_id=doc_id)

        raise HTTPException(status_code=400, detail="No file or text provided")
    
    except ValueError as exc:
        logger.exception("Upload validation error: %s", exc)
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:
        logger.exception("Upload error: %s", exc)
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(exc)}") from exc

@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest) -> ChatResponse:
    try:
        result = await query_document(
            document_id=request.document_id,
            question=request.question,
        )
        return ChatResponse(
            answer=result["answer"],
            sources=result.get("sources", []),
            blocked=result.get("blocked", False),
        )
    except ValueError as exc:
        raise HTTPException(
            status_code=400,
            detail=str(exc),
        ) from exc
    except Exception as exc:
        logger.exception("Chat error: %s", exc)  # <-- ADD THIS LINE
        raise HTTPException(
            status_code=500,
            detail="An unexpected error occurred during chat processing.",
        ) from exc# update 2024-08-05 8:51:13
# update 2024-08-16 11:15:36
# update 2024-08-17 16:5:45
# update 2024-08-26 14:57:5
# update 2024-08-29 10:38:28
# update 2024-08-29 10:38:28
# update 2024-08-29 15:2:50
# update 2024-09-06 14:3:47
# update 2024-09-16 8:44:52
# update 2024-09-17 10:6:9
# update 2024-09-19 8:25:28
# update 2024-10-07 10:57:40
# update 2024-10-08 14:18:8
# update 2024-10-09 12:57:28
// update 2024-08-15 9:51:13
// update 2024-08-21 16:17:14
// update 2024-09-04 15:36:37
// update 2024-09-13 9:1:29
// update 2024-09-16 15:59:3
// update 2024-09-20 16:32:21
// update 2024-10-15 15:38:18
// update 2024-09-04 13:32:29
// update 2024-09-05 13:50:51
// update 2024-11-20 16:5:8
// update 2024-12-05 8:9:43
// update 2025-02-11 9:30:25
// update 2024-09-04 9:2:14
// update 2024-09-17 10:37:19
// update 2024-10-15 11:30:45
// update 2024-12-03 10:11:14
// update 2024-12-31 9:56:24
// update 2025-01-01 15:36:41
// update 2025-01-17 17:2:55
