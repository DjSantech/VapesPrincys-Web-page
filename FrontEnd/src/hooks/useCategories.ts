import { useEffect, useState } from "react";
import {
  getCategories,
  createCategory,
  deleteCategoryById,
  patchCategory,
  patchCategoryImage,
    type AdminCategory,
} from "../services/admin";

export function useCategories() {
  const [cats, setCats] = useState<AdminCategory[]>([]);
  const [catsLoading, setCatsLoading] = useState<boolean>(true);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setCatsLoading(true);
    const data = await getCategories();
    setCats(data);
    setCatsLoading(false);
  };

  return {
    cats,
    setCats,
    catsLoading,
    loadCategories,
    createCategory,
    deleteCategoryById,
    patchCategory,
    patchCategoryImage,
  };
}
