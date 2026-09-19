# DOPPEL Troubleshooting Guide

## Common Issues & Solutions

### 1. "No face detected in the image"
- **Cause**: The subject is either too far from the camera, lighting is too dark, or face is heavily occluded.
- **Solution**: Move closer to the webcam, ensure frontal orientation, and turn on ambient lighting.

### 2. "Multiple faces detected"
- **Cause**: Another individual or background portrait was detected in frame.
- **Solution**: Capture a portrait containing strictly yourself.

### 3. "Image is too blurry"
- **Cause**: Laplacian sharpness score was below threshold ($<60.0$).
- **Solution**: Hold device steady, clean the camera lens, and tap to refocus.

### 4. "Permission denied / Webcam not loading"
- **Cause**: Browser blocked camera permissions.
- **Solution**: Allow camera access in browser address bar or switch to the "Upload Photo" tab.
