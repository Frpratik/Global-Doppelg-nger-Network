"""
DOPPEL Face Detector & Landmark Aligner
Detects frontal human faces and aligns facial landmarks for normalized embedding.
"""
from typing import List, Tuple, Optional
import numpy as np
import cv2

class FaceDetector:
    def __init__(self):
        # Load OpenCV default Haar cascade for frontal faces
        cascade_path = cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
        self.face_cascade = cv2.CascadeClassifier(cascade_path)
        
        # Load eye cascade for landmark orientation
        eye_path = cv2.data.haarcascades + "haarcascade_eye.xml"
        self.eye_cascade = cv2.CascadeClassifier(eye_path)

    def detect_faces(self, image_bgr: np.ndarray) -> List[List[int]]:
        """
        Detect faces in image.
        Returns list of [x, y, w, h] boxes.
        """
        if image_bgr is None or image_bgr.size == 0:
            return []
        
        gray = cv2.cvtColor(image_bgr, cv2.COLOR_BGR2GRAY)
        # Apply histogram equalization for lighting balance
        gray = cv2.equalizeHist(gray)
        
        faces = self.face_cascade.detectMultiScale(
            gray,
            scaleFactor=1.1,
            minNeighbors=5,
            minSize=(60, 60),
            flags=cv2.CASCADE_SCALE_IMAGE
        )
        
        return [[int(x), int(y), int(w), int(h)] for (x, y, w, h) in faces]

    def detect_eyes(self, face_bgr: np.ndarray) -> List[List[int]]:
        """Detect eyes within a cropped face box."""
        if face_bgr is None or face_bgr.size == 0:
            return []
        gray = cv2.cvtColor(face_bgr, cv2.COLOR_BGR2GRAY)
        eyes = self.eye_cascade.detectMultiScale(
            gray,
            scaleFactor=1.1,
            minNeighbors=4,
            minSize=(20, 20)
        )
        return [[int(x), int(y), int(w), int(h)] for (x, y, w, h) in eyes]


class FaceAligner:
    """Aligns faces to standard 112x112 frontal geometry based on eye centers."""
    def __init__(self, target_size: Tuple[int, int] = (112, 112)):
        self.target_size = target_size

    def align_face(self, image_bgr: np.ndarray, face_box: List[int], eyes: Optional[List[List[int]]] = None) -> np.ndarray:
        """
        Extract and align face to target dimensions.
        """
        x, y, w, h = face_box
        img_h, img_w = image_bgr.shape[:2]
        
        # Add a 15% margin around the face box
        margin_x = int(w * 0.15)
        margin_y = int(h * 0.15)
        
        x1 = max(0, x - margin_x)
        y1 = max(0, y - margin_y)
        x2 = min(img_w, x + w + margin_x)
        y2 = min(img_h, y + h + margin_y)
        
        face_roi = image_bgr[y1:y2, x1:x2]
        
        if eyes and len(eyes) >= 2:
            # Sort eyes left-to-right
            eyes_sorted = sorted(eyes, key=lambda e: e[0])
            left_eye = (eyes_sorted[0][0] + eyes_sorted[0][2] // 2, eyes_sorted[0][1] + eyes_sorted[0][3] // 2)
            right_eye = (eyes_sorted[1][0] + eyes_sorted[1][2] // 2, eyes_sorted[1][1] + eyes_sorted[1][3] // 2)
            
            d_y = right_eye[1] - left_eye[1]
            d_x = right_eye[0] - left_eye[0]
            angle = np.degrees(np.arctan2(d_y, d_x))
            
            # Rotate face if tilt is between -45 and 45 degrees
            if -45 < angle < 45:
                center = ((x2 - x1) // 2, (y2 - y1) // 2)
                M = cv2.getRotationMatrix2D(center, angle, 1.0)
                face_roi = cv2.warpAffine(face_roi, M, (face_roi.shape[1], face_roi.shape[0]))

        # Resize to standard model input size
        aligned = cv2.resize(face_roi, self.target_size, interpolation=cv2.INTER_AREA)
        return aligned
