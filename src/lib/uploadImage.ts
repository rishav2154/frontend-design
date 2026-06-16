export const uploadImage = async (file: File) => {
  const formData = new FormData();
  formData.append("image", file);

  const res = await fetch("https://api.thedesignhive.tech/api/upload", {
    method: "POST",
    body: formData,
  });

  const data = await res.json();
  return data.imageUrl;
};
