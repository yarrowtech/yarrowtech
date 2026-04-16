import Blog from "../models/Blog.js";
import slugify from "slugify";

/* ======================================================
   CREATE BLOG (ADMIN)
====================================================== */
export const createBlog = async (req, res) => {
  try {
    const { title, content, excerpt, coverImage, status } = req.body;

    if (!title || !content) {
      return res.status(400).json({ message: "Title and content are required" });
    }

    const blog = await Blog.create({
      title,
      slug: slugify(title, { lower: true, strict: true }),
      content,
      excerpt,
      coverImage,
      status: status || "draft",
      author: req.user.id,
    });

    res.status(201).json({
      message: "Blog created successfully",
      blog,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ======================================================
   GET ALL BLOGS (PUBLIC – PUBLISHED ONLY)
====================================================== */
export const getBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find({ status: "published" })
      .sort({ createdAt: -1 })
      .select("-content");

    res.json(blogs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ======================================================
   GET ALL BLOGS (ADMIN – ALL STATUSES)
====================================================== */
export const getAllBlogsAdmin = async (req, res) => {
  try {
    const blogs = await Blog.find()
      .sort({ createdAt: -1 });

    res.json(blogs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ======================================================
   GET LATEST BLOG (PUBLIC)
====================================================== */
export const getLatestBlog = async (req, res) => {
  try {
    const blog = await Blog.findOne({ status: "published" })
      .sort({ createdAt: -1 })
      .select("title slug createdAt");

    res.json(blog);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ======================================================
   GET BLOG BY SLUG (PUBLIC)
====================================================== */
export const getBlogBySlug = async (req, res) => {
  try {
    const blog = await Blog.findOne({
      slug: req.params.slug,
      status: "published",
    });

    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    res.json(blog);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ======================================================
   UPDATE BLOG (ADMIN)
====================================================== */
export const updateBlog = async (req, res) => {
  try {
    const updates = { ...req.body };

    if (updates.title) {
      updates.slug = slugify(updates.title, {
        lower: true,
        strict: true,
      });
    }

    const blog = await Blog.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true }
    );

    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    res.json({
      message: "Blog updated successfully",
      blog,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ======================================================
   DELETE BLOG (ADMIN)
====================================================== */
export const deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findByIdAndDelete(req.params.id);

    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    res.json({ message: "Blog deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
