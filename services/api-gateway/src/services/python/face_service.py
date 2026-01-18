"""
InspireFace Face Authentication Service

FastAPI service that provides face registration and verification endpoints
using the InspireFace SDK for biometric authentication.

Features:
- Face detection and quality validation
- Liveness detection (anti-spoofing)
- Mask detection
- 512-dimensional embedding extraction
- Face comparison with cosine similarity
"""

import os
import logging
from typing import List, Optional
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import numpy as np

# Import InspireFace SDK
try:
    import inspireface as isf
    INSPIREFACE_AVAILABLE = True
except ImportError:
    INSPIREFACE_AVAILABLE = False
    logging.warning("InspireFace SDK not available. Running in mock mode.")

from utils import (
    decode_base64_image,
    validate_image_quality,
    validate_liveness,
    validate_mask_detection,
    average_embeddings,
    calculate_cosine_similarity,
    embedding_to_list,
    list_to_embedding
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Configuration from environment
MIN_QUALITY = float(os.getenv('FACE_MIN_QUALITY', '0.6'))
MIN_LIVENESS = float(os.getenv('FACE_MIN_LIVENESS', '0.5'))
SIMILARITY_THRESHOLD = float(os.getenv('FACE_AUTH_THRESHOLD', '0.50'))

# Global InspireFace session
face_session = None


def initialize_inspireface():
    """Initialize InspireFace SDK with required features."""
    global face_session
    
    if not INSPIREFACE_AVAILABLE:
        logger.warning("InspireFace not available - using mock mode")
        return False
    
    try:
        # Launch InspireFace globally
        isf.launch()
        
        # Create session with quality, liveness, and mask detection enabled
        options = (
            isf.HF_ENABLE_QUALITY |
            isf.HF_ENABLE_LIVENESS |
            isf.HF_ENABLE_MASK_DETECT
        )
        
        face_session = isf.InspireFaceSession(
            options,
            isf.HF_DETECT_MODE_ALWAYS_DETECT
        )
        
        logger.info("InspireFace SDK initialized successfully")
        return True
        
    except Exception as e:
        logger.error(f"Failed to initialize InspireFace: {e}")
        return False


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager."""
    # Startup
    success = initialize_inspireface()
    if success:
        logger.info("Face authentication service started with InspireFace")
    else:
        logger.warning("Face authentication service started in MOCK mode")
    
    yield
    
    # Shutdown
    logger.info("Face authentication service shutting down")


# Create FastAPI app
app = FastAPI(
    title="Face Authentication Service",
    description="InspireFace-powered face authentication for Government KYC Portal",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Pydantic models for request/response
class RegisterFaceRequest(BaseModel):
    """Request model for face registration."""
    images: List[str] = Field(
        ...,
        min_length=5,
        max_length=5,
        description="List of 5 base64 encoded face images"
    )


class RegisterFaceResponse(BaseModel):
    """Response model for face registration."""
    success: bool
    embedding: Optional[List[float]] = None
    dimension: Optional[int] = None
    average_quality: Optional[float] = None
    num_samples: Optional[int] = None
    message: str


class VerifyFaceRequest(BaseModel):
    """Request model for face verification."""
    image: str = Field(..., description="Base64 encoded face image")
    stored_embedding: List[float] = Field(..., description="Stored face embedding")


class VerifyFaceResponse(BaseModel):
    """Response model for face verification."""
    success: bool
    verified: bool = False
    similarity: Optional[float] = None
    liveness_score: Optional[float] = None
    threshold: float = SIMILARITY_THRESHOLD
    message: str


class HealthResponse(BaseModel):
    """Response model for health check."""
    status: str
    inspireface_available: bool
    version: str = "1.0.0"


# Mock functions for when InspireFace is not available
def mock_process_face(image: np.ndarray) -> dict:
    """Mock face processing for testing without InspireFace."""
    import random
    return {
        'detected': True,
        'quality': random.uniform(0.7, 0.95),
        'liveness': random.uniform(0.8, 0.99),
        'mask_score': random.uniform(0.0, 0.2),
        'embedding': np.random.randn(512).astype(np.float32)
    }


def process_face_image(image: np.ndarray) -> dict:
    """
    Process a face image and extract features.
    
    Returns dict with:
    - detected: bool
    - quality: float (0-1)
    - liveness: float (0-1)
    - mask_score: float (0-1)
    - embedding: np.ndarray (512-dim)
    - face_count: int
    - error: Optional[str]
    """
    global face_session
    
    if not INSPIREFACE_AVAILABLE or face_session is None:
        return mock_process_face(image)
    
    try:
        # Detect faces
        faces = face_session.face_detection(image)
        
        if len(faces) == 0:
            return {'detected': False, 'error': 'No face detected in image'}
        
        if len(faces) > 1:
            return {'detected': False, 'error': 'Multiple faces detected. Please ensure only one person is in frame.', 'face_count': len(faces)}
        
        face = faces[0]
        
        # Get quality score
        quality = face_session.face_quality(image, face)
        
        # Get liveness score
        liveness = face_session.face_liveness(image, face)
        
        # Get mask detection
        mask_score = face_session.mask_detection(image, face)
        
        # Extract embedding
        embedding = face_session.face_feature_extract(image, face)
        
        return {
            'detected': True,
            'quality': float(quality),
            'liveness': float(liveness),
            'mask_score': float(mask_score),
            'embedding': np.array(embedding, dtype=np.float32),
            'face_count': 1
        }
        
    except Exception as e:
        logger.error(f"Face processing error: {e}")
        return {'detected': False, 'error': str(e)}


@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint."""
    return HealthResponse(
        status="healthy",
        inspireface_available=INSPIREFACE_AVAILABLE and face_session is not None
    )


@app.post("/register-face", response_model=RegisterFaceResponse)
async def register_face(request: RegisterFaceRequest):
    """
    Register a face for authentication.
    
    Accepts 5 face images, validates quality and liveness for each,
    extracts embeddings, and returns an averaged embedding.
    """
    logger.info("Processing face registration request")
    
    embeddings = []
    quality_scores = []
    
    for i, image_b64 in enumerate(request.images):
        # Decode image
        image = decode_base64_image(image_b64)
        if image is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Image {i+1}: Invalid image format or size. Supported: JPEG, PNG (max 10MB)"
            )
        
        # Process face
        result = process_face_image(image)
        
        if not result.get('detected'):
            error = result.get('error', 'Face detection failed')
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Image {i+1}: {error}"
            )
        
        # Validate quality
        is_valid, msg = validate_image_quality(result['quality'], MIN_QUALITY)
        if not is_valid:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Image {i+1}: {msg}"
            )
        
        # Validate liveness
        is_valid, msg = validate_liveness(result['liveness'], MIN_LIVENESS)
        if not is_valid:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Image {i+1}: {msg}"
            )
        
        # Validate no mask (for registration)
        is_valid, msg = validate_mask_detection(result['mask_score'])
        if not is_valid:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Image {i+1}: {msg}"
            )
        
        embeddings.append(result['embedding'])
        quality_scores.append(result['quality'])
        logger.info(f"Image {i+1}/5: Quality={result['quality']:.2f}, Liveness={result['liveness']:.2f}")
    
    # Average all embeddings
    averaged_embedding = average_embeddings(embeddings)
    average_quality = sum(quality_scores) / len(quality_scores)
    
    logger.info(f"Face registration successful. Average quality: {average_quality:.2f}")
    
    return RegisterFaceResponse(
        success=True,
        embedding=embedding_to_list(averaged_embedding),
        dimension=len(averaged_embedding),
        average_quality=round(average_quality, 3),
        num_samples=len(embeddings),
        message="Face registration successful"
    )


@app.post("/verify-face", response_model=VerifyFaceResponse)
async def verify_face(request: VerifyFaceRequest):
    """
    Verify a face against a stored embedding.
    
    Performs liveness detection and compares the captured face
    with the stored embedding using cosine similarity.
    """
    logger.info("Processing face verification request")
    
    # Decode image
    image = decode_base64_image(request.image)
    if image is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid image format or size. Supported: JPEG, PNG (max 10MB)"
        )
    
    # Process face
    result = process_face_image(image)
    
    if not result.get('detected'):
        error = result.get('error', 'Face detection failed')
        return VerifyFaceResponse(
            success=True,
            verified=False,
            message=error
        )
    
    # Validate liveness (critical for verification)
    is_valid, msg = validate_liveness(result['liveness'], MIN_LIVENESS)
    if not is_valid:
        logger.warning(f"Liveness check failed: {result['liveness']:.2f}")
        return VerifyFaceResponse(
            success=True,
            verified=False,
            liveness_score=result['liveness'],
            message="Liveness check failed. Please ensure you are a real person looking at the camera."
        )
    
    # Convert stored embedding
    stored_embedding = list_to_embedding(request.stored_embedding)
    current_embedding = result['embedding']
    
    # Calculate similarity
    similarity = calculate_cosine_similarity(current_embedding, stored_embedding)
    
    logger.info(f"Face verification: similarity={similarity:.3f}, threshold={SIMILARITY_THRESHOLD}")
    
    # Check threshold
    verified = similarity >= SIMILARITY_THRESHOLD
    
    return VerifyFaceResponse(
        success=True,
        verified=verified,
        similarity=round(similarity, 3),
        liveness_score=round(result['liveness'], 3),
        threshold=SIMILARITY_THRESHOLD,
        message="Face verified successfully" if verified else "Face verification failed. Face does not match."
    )


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv('FACE_SERVICE_PORT', '5001'))
    uvicorn.run(app, host="0.0.0.0", port=port)
