"""
Unit Tests for DOPPEL Face Quality Engine
"""
import pytest
import numpy as np
import cv2
from services.face_engine.face_quality import FaceQualityEngine

@pytest.fixture
def quality_engine():
    return FaceQualityEngine(min_blur=40.0, min_brightness=30.0, max_brightness=235.0, min_face_pct=0.05)

def create_synthetic_face_image(width=400, height=400, blur=False, dark=False, bright=False):
    """Creates a controlled synthetic test image with a face-like pattern."""
    img = np.ones((height, width, 3), dtype=np.uint8) * 128
    
    # Draw face oval
    center = (width // 2, height // 2)
    axes = (width // 4, height // 3)
    cv2.ellipse(img, center, axes, 0, 0, 360, (200, 180, 160), -1)
    
    # Draw eyes
    eye_y = height // 2 - 30
    cv2.circle(img, (center[0] - 40, eye_y), 15, (50, 50, 50), -1)
    cv2.circle(img, (center[0] + 40, eye_y), 15, (50, 50, 50), -1)
    
    # Draw mouth
    cv2.rectangle(img, (center[0] - 30, height // 2 + 50), (center[0] + 30, height // 2 + 65), (80, 50, 50), -1)

    if blur:
        img = cv2.GaussianBlur(img, (35, 35), 0)
    if dark:
        img = (img * 0.15).astype(np.uint8)
    if bright:
        img = np.clip(img.astype(np.int32) + 120, 0, 255).astype(np.uint8)

    return img

def test_single_face_quality_pass(quality_engine):
    img = create_synthetic_face_image()
    faces = [[100, 70, 200, 260]] # [x, y, w, h]
    result = quality_engine.evaluate_quality(img, faces)
    
    assert result.face_count == 1
    assert result.blur_score > 30.0
    assert result.brightness_score > 50.0
    assert result.quality_score > 0.40

def test_no_face_rejected(quality_engine):
    img = create_synthetic_face_image()
    result = quality_engine.evaluate_quality(img, [])
    
    assert result.acceptable is False
    assert result.face_count == 0
    assert "No face detected" in result.warnings[0]

def test_multiple_faces_rejected(quality_engine):
    img = create_synthetic_face_image()
    faces = [[50, 50, 100, 100], [200, 200, 100, 100]]
    result = quality_engine.evaluate_quality(img, faces)
    
    assert result.acceptable is False
    assert result.face_count == 2
    assert "Multiple faces" in result.warnings[0]

def test_blurry_image_warning(quality_engine):
    img = create_synthetic_face_image(blur=True)
    faces = [[100, 70, 200, 260]]
    result = quality_engine.evaluate_quality(img, faces)
    
    assert result.acceptable is False
    assert any("blurry" in w.lower() for w in result.warnings)

def test_dark_image_warning(quality_engine):
    img = create_synthetic_face_image(dark=True)
    faces = [[100, 70, 200, 260]]
    result = quality_engine.evaluate_quality(img, faces)
    
    assert result.acceptable is False
    assert any("dark" in w.lower() for w in result.warnings)
