import { apiUpload, endpoints } from '@/lib/api';

export const uploadImage = async (file: File) => {
  const formData = new FormData();
  formData.append("image", file);

  const data: any = await apiUpload(endpoints.upload, formData);
  return data.imageUrl;
};
