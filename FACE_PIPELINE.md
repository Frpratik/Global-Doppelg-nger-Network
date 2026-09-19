# DOPPEL Face AI Processing Pipeline Specification

## Stage Breakdown

### 1. Ingestion & Security Filtering
- Inspects byte payload header and validates MIME format (`image/jpeg`, `image/png`, `image/webp`).
- Enforces strict size ceiling: $10\text{ MB}$.
- Decodes safely using Pillow and OpenCV into an in-memory BGR array.

### 2. Detection & Face Counting
- Utilizes frontal cascade classifiers with multiscale pyramid processing.
- Outputs list of bounding boxes $[[x, y, w, h], \dots]$.
- Strict rejection rule: `if len(faces) != 1: raise FaceQualityError(...)`.

### 3. Quality Analysis (`FaceQualityEngine`)
- **Sharpness Metric**: $\text{Var}(\nabla^2 I) = \frac{1}{N}\sum(L_{i,j} - \bar{L})^2$.
- **Illumination Range**: Mean gray value between 35 and 230.
- **Area Ratio**: Face bounding box must cover at least $8\%$ of total frame area.

### 4. Aligner (`FaceAligner`)
- Detects left and right eye landmark regions.
- Rotates cropped ROI to horizontal axis ($\pm 45^\circ$).
- Scales output to normalized $112 \times 112\text{ px}$.

### 5. Deep Embedding & Normalization
- Extracts 512 deep feature dimensions.
- Normalizes using Euclidean L2 norm: $\hat{v}_i = \frac{v_i}{\sqrt{\sum_{k=1}^{512} v_k^2}}$.
