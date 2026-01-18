"""
Helper utilities for InspireFace face authentication service.

Provides image processing, validation, and embedding operations.
"""

import base64
import io
import logging
import html
import numpy as np
from PIL import Image
from typing import Tuple, Optional, List

# Configure logger
logger = logging.getLogger(__name__)

# Image validation constants
MAX_IMAGE_SIZE = 10 * 1024 * 1024  # 10MB
ALLOWED_FORMATS = {'JPEG', 'PNG', 'JPG'}
MIN_IMAGE_DIMENSION = 100
MAX_IMAGE_DIMENSION = 4096



def decode_base64_image(base64_string: str) -> Optional[np.ndarray]:
    """
    Decode a base64 encoded image string to numpy array (BGR format for OpenCV).
    """
    try:
        # Debug: Log start of decoding (use debug level if possible, but info to ensure visibility)
        # logger.info(f"Decoding image of length {len(base64_string)}")
        
        # Remove data URI prefix if present
        if ',' in base64_string:
            base64_string = base64_string.split(',')[1]
            
        # Unescape HTML entities (fixes &#x2F; -> /)
        base64_string = html.unescape(base64_string)
        
        # Sanitize: remove whitespace and newlines
        base64_string = base64_string.strip().replace('\n', '').replace('\r', '').replace(' ', '')
        
        # Fix Padding
        missing_padding = len(base64_string) % 4
        if missing_padding:
            base64_string += '=' * (4 - missing_padding)
        
        # Decode base64
        try:
            image_bytes = base64.b64decode(base64_string)
        except Exception as e:
            logger.error(f"Base64 decode failed: {str(e)}")
            logger.error(f"String length: {len(base64_string)}")
            logger.error(f"String tail: ...{base64_string[-50:] if len(base64_string) > 50 else base64_string}")
            return None
        
        # Check size
        if len(image_bytes) > MAX_IMAGE_SIZE:
            logger.error(f"Image size too large: {len(image_bytes)} > {MAX_IMAGE_SIZE}")
            return None
        
        # Open with PIL
        try:
            image = Image.open(io.BytesIO(image_bytes))
        except Exception as e:
            logger.error(f"PIL open failed: {str(e)}")
            return None
        
        # Validate format
        if image.format not in ALLOWED_FORMATS:
            logger.error(f"Invalid format: {image.format}. Allowed: {ALLOWED_FORMATS}")
            return None
        
        # Validate dimensions
        width, height = image.size
        # logger.info(f"Image dimensions: {width}x{height}")
        if (width < MIN_IMAGE_DIMENSION or height < MIN_IMAGE_DIMENSION or
            width > MAX_IMAGE_DIMENSION or height > MAX_IMAGE_DIMENSION):
            logger.error(f"Invalid dimensions: {width}x{height}")
            return None
        
        # Convert to RGB then to BGR (OpenCV format)
        if image.mode != 'RGB':
            image = image.convert('RGB')
        
        rgb_array = np.array(image)
        bgr_array = rgb_array[:, :, ::-1].copy()  # RGB to BGR
        
        return bgr_array
        
    except Exception as e:
        logger.error(f"Unexpected error in decode_base64_image: {str(e)}")
        return None


def validate_image_quality(quality_score: float, min_quality: float = 0.6) -> Tuple[bool, str]:
    """
    Validate face image quality score.
    
    Args:
        quality_score: Quality score from InspireFace (0-1)
        min_quality: Minimum acceptable quality threshold
        
    Returns:
        Tuple of (is_valid, message)
    """
    if quality_score < min_quality:
        return False, f"Face quality too low ({quality_score:.2f}). Ensure good lighting and face is clearly visible."
    return True, "Quality check passed"


def validate_liveness(liveness_score: float, min_liveness: float = 0.5) -> Tuple[bool, str]:
    """
    Validate liveness detection score.
    
    Args:
        liveness_score: Liveness score from InspireFace (0-1)
        min_liveness: Minimum acceptable liveness threshold
        
    Returns:
        Tuple of (is_valid, message)
    """
    if liveness_score < min_liveness:
        return False, "Liveness check failed. Please ensure you are a real person looking at the camera."
    return True, "Liveness check passed"


def validate_mask_detection(mask_score: float, max_mask: float = 0.5) -> Tuple[bool, str]:
    """
    Validate that face is not wearing a mask.
    
    Args:
        mask_score: Mask detection score from InspireFace (0-1, higher = more likely mask)
        max_mask: Maximum acceptable mask score
        
    Returns:
        Tuple of (is_valid, message)
    """
    if mask_score > max_mask:
        return False, "Face mask detected. Please remove any face coverings for registration."
    return True, "No mask detected"


def average_embeddings(embeddings: List[np.ndarray]) -> np.ndarray:
    """
    Calculate the average of multiple face embeddings for robust face signature.
    
    Args:
        embeddings: List of face embedding arrays
        
    Returns:
        Averaged and normalized embedding
    """
    if not embeddings:
        raise ValueError("No embeddings provided")
    
    # Stack and average
    stacked = np.stack(embeddings)
    averaged = np.mean(stacked, axis=0)
    
    # L2 normalize
    norm = np.linalg.norm(averaged)
    if norm > 0:
        averaged = averaged / norm
    
    return averaged


def calculate_cosine_similarity(embedding1: np.ndarray, embedding2: np.ndarray) -> float:
    """
    Calculate cosine similarity between two face embeddings.
    
    Args:
        embedding1: First face embedding
        embedding2: Second face embedding
        
    Returns:
        Cosine similarity score (0-1, higher = more similar)
    """
    # Normalize embeddings
    norm1 = np.linalg.norm(embedding1)
    norm2 = np.linalg.norm(embedding2)
    
    if norm1 == 0 or norm2 == 0:
        return 0.0
    
    embedding1_normalized = embedding1 / norm1
    embedding2_normalized = embedding2 / norm2
    
    # Calculate cosine similarity
    similarity = np.dot(embedding1_normalized, embedding2_normalized)
    
    # Clamp to [0, 1] range
    return float(max(0.0, min(1.0, similarity)))


def embedding_to_list(embedding: np.ndarray) -> List[float]:
    """Convert numpy embedding to Python list for JSON serialization."""
    return embedding.tolist()


def list_to_embedding(embedding_list: List[float]) -> np.ndarray:
    """Convert Python list back to numpy embedding."""
    return np.array(embedding_list, dtype=np.float32)
