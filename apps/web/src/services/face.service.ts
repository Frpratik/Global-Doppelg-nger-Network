import { ApiClient } from "@/lib/api";
import { QualityAssessment, FaceProfile } from "@/types/domain";

export interface EnrollmentResult {
  status: string;
  quality_score: number;
  model_name: string;
  model_version: string;
  message: string;
  face_box?: [number, number, number, number];
}

export const FaceService = {
  async evaluateQuality(imageFileOrBase64: File | string): Promise<QualityAssessment> {
    const formData = new FormData();
    if (typeof imageFileOrBase64 === "string") {
      formData.append("image_base64", imageFileOrBase64);
    } else {
      formData.append("file", imageFileOrBase64);
    }
    return ApiClient.request<QualityAssessment>("/face/check-quality", {
      method: "POST",
      body: formData
    });
  },

  async enroll(imageFileOrBase64: File | string): Promise<EnrollmentResult> {
    const formData = new FormData();
    if (typeof imageFileOrBase64 === "string") {
      formData.append("image_base64", imageFileOrBase64);
    } else {
      formData.append("file", imageFileOrBase64);
    }
    return ApiClient.request<EnrollmentResult>("/face/enroll", {
      method: "POST",
      body: formData
    });
  },

  async getProfile(): Promise<FaceProfile | null> {
    return ApiClient.request<FaceProfile | null>("/face/profile", {
      method: "GET"
    });
  }
};
