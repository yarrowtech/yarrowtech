import api from "./api";

export const getAllProjects = async () => {
  try {
    const res = await api.get("/projects/all");
    return res.data;
  } catch (err) {
    console.error("Error fetching projects:", err);
    throw err;
  }
};
