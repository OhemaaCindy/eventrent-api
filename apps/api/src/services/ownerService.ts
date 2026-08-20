import { ownerRepository } from "../repositories/ownerRepository";
import { uploadImageBuffer } from "../lib/cloudinary";
import { AppError } from "../middleware/errorHandler";
import { OwnerType, VerificationStatus } from "../generated/prisma/client";
import type { CreateOwnerProfileInput } from "../types/owner";

export const ownerService = {
  async createOwnerProfile(userId: string, input: CreateOwnerProfileInput) {
    const existing = await ownerRepository.findByUserId(userId);
    if (existing) {
      throw new AppError(409, "OWNER_PROFILE_EXISTS", "You already have an owner profile");
    }

    const type = input.type === "BUSINESS" ? OwnerType.BUSINESS : OwnerType.INDIVIDUAL;

    // This is the actual ADR-0004 rule: businesses start pending, individuals go live immediately
    const verificationStatus =
      type === OwnerType.BUSINESS ? VerificationStatus.PENDING : VerificationStatus.APPROVED;

    return ownerRepository.create(userId, type, input.businessName, verificationStatus);
  },

  async addVerificationDocuments(userId: string, files: Express.Multer.File[]) {
    if (files.length === 0) {
      throw new AppError(400, "DOCUMENTS_REQUIRED", "At least one document is required");
    }

    const owner = await ownerRepository.findByUserId(userId);
    if (!owner) {
      throw new AppError(403, "NOT_AN_OWNER", "You need an owner profile first");
    }
    if (owner.type !== OwnerType.BUSINESS) {
      throw new AppError(
        400,
        "NOT_A_BUSINESS",
        "Only business owners need to submit verification documents"
      );
    }

    let urls: string[];
    try {
      urls = await Promise.all(
        files.map((file) => uploadImageBuffer(file.buffer, "eventrent/verification"))
      );
    } catch (err) {
      console.error("Cloudinary upload failed:", err);
      throw new AppError(502, "DOCUMENT_UPLOAD_FAILED", "Failed to upload verification documents");
    }

    return ownerRepository.addVerificationDocuments(owner.id, urls);
  },
};