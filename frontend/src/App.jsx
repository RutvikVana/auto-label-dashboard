import { useEffect, useState } from "react";
import {
  Table,
  Button,
  Input,
  Card,
  message,
  Modal,
  Tag,
  Upload
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import API from "./api";
import "./App.css";

function App() {
  const [data, setData] = useState([]);
  const [text, setText] = useState("");
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dark, setDark] = useState(false);

  const [editItem, setEditItem] = useState(null);
  const [newLabel, setNewLabel] = useState("");

  // Apply dark mode to document
  useEffect(() => {
    document.body.className = dark ? "dark" : "";
  }, [dark]);

  // Fetch all data + stats
  const fetchAll = async () => {
    try {
      const dataRes = await API.get("/data");
      const statsRes = await API.get("/stats");
      setData(dataRes.data);
      setStats(statsRes.data);
    } catch {
      message.error("Failed to load data");
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const handleLabel = async () => {
    if (!text) return message.warning("Please enter text");

    try {
      setLoading(true);
      await API.post("/label", { text });
      setText("");
      message.success("Text labeled successfully");
      fetchAll();
    } catch {
      message.error("Labeling failed");
    } finally {
      setLoading(false);
    }
  };

  // Upload CSV file
  const handleUpload = async (file) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      setUploading(true);
      await API.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      message.success("CSV uploaded and labeled successfully");
      fetchAll();
    } catch {
      message.error("CSV upload failed");
    } finally {
      setUploading(false);
    }

    return false;
  };

  // Approve label
  const approve = async (id) => {
    try {
      await API.put(`/data/${id}`, { status: "approved" });
      message.success("Approved");
      fetchAll();
    } catch {
      message.error("Update failed");
    }
  };

  // Open override modal
  const openEdit = (record) => {
    setEditItem(record);
    setNewLabel(record.label);
  };

  // Save override
  const saveEdit = async () => {
    try {
      await API.put(`/data/${editItem._id}`, {
        label: newLabel,
        status: "edited"
      });
      message.success("Label updated");
      setEditItem(null);
      fetchAll();
    } catch {
      message.error("Failed to update label");
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { color: "pending", label: "⏳ Pending" },
      approved: { color: "success", label: "✅ Approved" },
      edited: { color: "warning", label: "✏️ Edited" }
    };
    return badges[status] || badges.pending;
  };

  const columns = [
    {
      title: "Text",
      dataIndex: "text",
      render: (text) => <span>{text.substring(0, 50)}...</span>
    },
    {
      title: "Label",
      dataIndex: "label",
      render: (label) => <Tag color="blue">{label}</Tag>
    },
    {
      title: "Status",
      dataIndex: "status",
      render: (status) => {
        const badge = getStatusBadge(status);
        return <span className={`badge ${badge.color}`}>{badge.label}</span>;
      }
    },
    {
      title: "Actions",
      render: (_, record) => (
        <>
          <Button
            type="primary"
            size="small"
            onClick={() => approve(record._id)}
            style={{ marginRight: 6 }}
          >
            Approve
          </Button>
          <Button
            type="default"
            size="small"
            onClick={() => openEdit(record)}
          >
            Override
          </Button>
        </>
      )
    }
  ];

  return (
    <div className="app-container">
      {/* Top Bar with Title and Theme Toggle */}
      <div className="top-bar">
        <h2>📊 Auto Label Dashboard</h2>
        <button
          className="btn"
          onClick={() => setDark(!dark)}
          style={{ fontSize: "14px" }}
        >
          {dark ? "☀️ Light Mode" : "🌙 Dark Mode"}
        </button>
      </div>

      {/* Input Section */}
      <div className="card">
        <h3 style={{ marginBottom: "12px" }}>Label New Text</h3>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          <Input
            className="input"
            placeholder="Enter text to auto label..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleLabel()}
            style={{ flex: 1, minWidth: "200px" }}
          />
          <button
            className="btn"
            onClick={handleLabel}
            disabled={loading}
            style={{ minWidth: "120px" }}
          >
            {loading ? "Labeling..." : "Auto Label"}
          </button>
        </div>
      </div>

      {/* Upload Section */}
      <div className="card">
        <h3 style={{ marginBottom: "12px" }}>📁 Upload CSV Dataset</h3>
        <Upload beforeUpload={handleUpload} showUploadList={false}>
          <button
            className="btn"
            disabled={uploading}
            style={{ display: "flex", alignItems: "center", gap: "8px" }}
          >
            <UploadOutlined />
            {uploading ? "Uploading..." : "Upload CSV File"}
          </button>
        </Upload>
        <p style={{ fontSize: "12px", marginTop: "8px", opacity: 0.7 }}>
          CSV must contain a column named <b>text</b>
        </p>
      </div>

      {/* Data Table */}
      <div className="card">
        <h3 style={{ marginBottom: "16px" }}>Dataset</h3>
        {data.length === 0 ? (
          <div className="empty-state">
            No records found yet 🚀<br />
            <span style={{ fontSize: "12px" }}>
              Start by labeling some text or uploading a CSV file
            </span>
          </div>
        ) : (
          <Table
            rowKey="_id"
            columns={columns}
            dataSource={data}
            pagination={{ pageSize: 8 }}
            size="middle"
          />
        )}
      </div>

      {/* Statistics Grid Below Table */}
      <div className="stats-grid">
        <div className="stat-card">
          <h4>📌 Total Records</h4>
          <span className="stat-number">{stats.total || 0}</span>
        </div>

        <div className="stat-card warning">
          <h4>⏳ Pending</h4>
          <span className="stat-number">{stats.pending || 0}</span>
        </div>

        <div className="stat-card info">
          <h4>✏️ Edited</h4>
          <span className="stat-number">{stats.edited || 0}</span>
        </div>

        <div className="stat-card success">
          <h4>✅ Approved</h4>
          <span className="stat-number">{stats.approved || 0}</span>
        </div>
      </div>

      {/* Override Modal */}
      <Modal
        title="✏️ Override Label"
        open={!!editItem}
        onOk={saveEdit}
        onCancel={() => setEditItem(null)}
        okText="Save"
        cancelText="Cancel"
      >
        {editItem && (
          <div>
            <p style={{ marginBottom: "12px", opacity: 0.7 }}>
              <b>Current text:</b> {editItem.text}
            </p>
            <Input
              className="input"
              placeholder="Enter new label..."
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && saveEdit()}
            />
          </div>
        )}
      </Modal>
    </div>
  );
}

export default App;
