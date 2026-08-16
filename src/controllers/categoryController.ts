import { Request, Response, NextFunction } from "express";
import { categoryRepository } from "../repositories/categoryRepository";

export const categoryController = {
  async list(_req: Request, res: Response, next: NextFunction) {
    try {
      const categories = await categoryRepository.findAll();
      res.status(200).json(categories);
    } catch (err) {
      next(err);
    }
  },
};