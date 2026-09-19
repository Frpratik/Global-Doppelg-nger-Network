# DOPPEL AI & Computer Vision Architecture

## 1. Pipeline Overview

$$\text{Raw Image} \xrightarrow{\text{Decode}} \text{Haar/RetinaFace Cascade} \xrightarrow{\text{Quality Engine}} \text{Affine Landmark Aligner} \xrightarrow{\text{ArcFace ONNX (512-D)}} \text{L2 Normalization} \xrightarrow{\text{Vector Store Index}}$$

## 2. Face Quality Engine (`face_quality.py`)
- **Blur Assessment**: Evaluates the variance of the 2D Laplacian operator ($\sigma^2(\nabla^2 I)$). Sharp images produce $\sigma^2 \ge 60.0$.
- **Illumination & Contrast**: Checks pixel histogram distribution ($35 \le \mu \le 230$, $\sigma \ge 20$).
- **Single-Face Constraint**: Rejects inputs with 0 or $>1$ face boxes.

## 3. Facial Landmark Alignment (`face_detector.py`)
- Detects eye centers $(x_L, y_L)$ and $(x_R, y_R)$.
- Calculates tilt angle $\theta = \arctan2(y_R - y_L, x_R - x_L)$.
- Applies affine transformation matrix $M$ to align the face horizontally to $112 \times 112\text{ px}$.

## 4. Embedding Generation (`embedding_engine.py`)
- 512-dimensional output vector capturing cranial proportions, inter-ocular spacing, and jawline contour.
- L2-normalized vector: $\hat{v} = \frac{v}{\|v\|_2}$ such that $\hat{v} \cdot \hat{v} = 1.0$.

## 5. Similarity Calculation (`matcher.py`)
Cosine similarity metric:
$$S = \max(0, \hat{u} \cdot \hat{v}) \times 100$$
Where $S \in [0.0, 100.0]\%$.
