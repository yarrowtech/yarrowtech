import React, { useEffect, useState } from "react";
import axios from "axios";
import "./BlogPage.css";

export default function BlogPage() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBlogs();
  }, []);

  const loadBlogs = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/blogs");
      setBlogs(res.data);
    } catch (err) {
      console.error("Failed to load blogs");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="blog-page">
      <div className="blog-container">

        {/* PAGE HEADER */}
        <div className="blog-header">
          <h1>Our Blog</h1>
          <p>Insights, updates & technology stories from Yarrowtech</p>
        </div>

        {/* BLOG GRID */}
        {loading ? (
          <p className="loading-text">Loading blogs...</p>
        ) : blogs.length === 0 ? (
          <p className="empty-text">No blogs published yet.</p>
        ) : (
          <div className="blog-grid">
            {blogs.map((blog) => (
              <a
                href={`/blog/${blog.slug}`}
                key={blog._id}
                className="blog-card"
              >
                <div className="blog-image">
                  <img src={blog.coverImage} alt={blog.title} />
                </div>

                <div className="blog-content">
                  <span className="blog-category">{blog.category}</span>
                  <h3>{blog.title}</h3>
                  <p>{blog.excerpt}</p>

                  <div className="blog-meta">
                    <span>{blog.author}</span>
                    <span>•</span>
                    <span>
                      {new Date(blog.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}

      </div>
    </section>
  );
}
