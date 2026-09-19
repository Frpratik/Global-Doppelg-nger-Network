# DOPPEL Vector Search & ANN Indexing Specification

## 1. Vector Store Architecture
Doppel defines an abstract interface `VectorStore` in `apps/api/repositories/vector_store.py`:
- `upsert_embedding(user_id, embedding, metadata)`
- `delete_embedding(user_id)`
- `search_similar(query_embedding, top_k, threshold, exclude_user_ids)`
- `get_embedding(user_id)`
- `count()`
- `health_check()`

## 2. Mathematical Formulations

### Cosine Distance Metric
For two unit-normalized vectors $\hat{u}, \hat{v} \in \mathbb{R}^{512}$ where $\|\hat{u}\|_2 = \|\hat{v}\|_2 = 1$:

$$\text{Cosine Similarity} = \cos(\theta) = \hat{u} \cdot \hat{v} = \sum_{i=1}^{512} \hat{u}_i \hat{v}_i$$
$$\text{Cosine Distance} = d(\hat{u}, \hat{v}) = 1 - \cos(\theta)$$

### Scaled Percentage Score
$$\text{Similarity Score} (\%) = \text{round}\left(\max(0, \cos(\theta)) \times 100, 1\right)$$

## 3. Exclusion Filtering
Prior to vector dot product or candidate ranking, the following set $E$ is excluded:
$$E = \{\text{requester\_id}\} \cup \text{BlockedUsers} \cup \text{NonConsentingUsers} \cup \text{DiscoveryDisabledUsers}$$

## 4. Benchmark Performance
- **1,000 vectors**: p50 = 2.05 ms, QPS = 422.5
- **10,000 vectors**: p50 = 23.39 ms, QPS = 42.3
