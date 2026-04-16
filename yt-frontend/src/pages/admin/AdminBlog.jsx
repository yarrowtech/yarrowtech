import React, { useEffect, useState } from "react";
import API from "../../services/api";
import "../../styles/adminBlog.css";

export default function AdminBlog() {
  const [blogs, setBlogs] = useState([]);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({
    title: "",
    content: "",
    status: "draft",
  });

  // Load blogs
  const loadBlogs = async () => {
    try {
      const res = await API.get("/blogs");
      setBlogs(res.data);
    } catch (err) {
      console.error("Failed to load blogs", err);
    }
  };

  useEffect(() => {
    loadBlogs();
  }, []);

  // Create blog
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post("/blogs/create", form);
      setForm({ title: "", content: "", status: "draft" });
      loadBlogs();
    } catch (err) {
      alert("Failed to create blog");
    }
  };

  const filteredBlogs = blogs.filter((b) =>
    b.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="admin-blog-container">
      {/* Header */}
      <div className="admin-blog-header">
        <h2>Blog Management</h2>
        <p>Create, publish and manage blog posts</p>
      </div>

      {/* Search */}
      <div className="admin-blog-search">
        <input
          type="text"
          placeholder="Search blogs..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Blog List */}
      <div className="admin-blog-table">
        <table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Slug</th>
              <th>Status</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
            {filteredBlogs.length === 0 ? (
              <tr>
                <td colSpan="4" className="empty">
                  No blogs found
                </td>
              </tr>
            ) : (
              filteredBlogs.map((blog) => (
                <tr key={blog._id}>
                  <td>{blog.title}</td>
                  <td className="slug">/{blog.slug}</td>
                  <td>
                    <span className={`status ${blog.status}`}>
                      {blog.status}
                    </span>
                  </td>
                  <td>{new Date(blog.createdAt).toLocaleDateString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Create Blog */}
      <div className="admin-blog-form">
        <h3>Create New Blog</h3>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Blog title"
            required
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />

          <textarea
            placeholder="Blog content"
            rows="6"
            required
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
          />

          <select
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>

          <button type="submit">Publish Blog</button>
        </form>
      </div>
    </div>
  );
}
