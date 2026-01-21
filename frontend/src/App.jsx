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

function App() {
  const [data, setData] = useState([]);
  const [text, setText] = useState("");
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [editItem, setEditItem] = useState(null);
  const [newLabel, setNewLabel] = useState("");

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

    return false; // prevent auto upload by AntD
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

  const columns = [
    { title: "Text", dataIndex: "text" },
    {
      title: "Label",
      dataIndex: "label",
      render: (label) => <Tag color="blue">{label}</Tag>
    },
    {
      title: "Status",
      dataIndex: "status",
      render: (status) => (
        <Tag color={status === "approved" ? "green" : status === "edited" ? "orange" : "default"}>
          {status}
        </Tag>
      )
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
          <Button size="small" onClick={() => openEdit(record)}>
            Override
          </Button>
        </>
      )
    }
  ];

  return (
    <div style={{ padding: 30 }}>
      <h2>📊 Automated Data Labeling Dashboard</h2>

      <Card style={{ marginBottom: 20 }}>
        <Input
          placeholder="Enter text to auto label"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <Button
          type="primary"
          loading={loading}
          onClick={handleLabel}
          style={{ marginTop: 10 }}
        >
          Auto Label
        </Button>
      </Card>

      <Card style={{ marginBottom: 20 }}>
        <h3>📁 Upload CSV Dataset</h3>
        <Upload beforeUpload={handleUpload} showUploadList={false}>
          <Button icon={<UploadOutlined />} loading={uploading}>
            Upload CSV File
          </Button>
        </Upload>
        <p style={{ fontSize: 12, marginTop: 8 }}>
          CSV must contain a column named <b>text</b>
        </p>
      </Card>

      <Table
        rowKey="_id"
        columns={columns}
        dataSource={data}
        pagination={{ pageSize: 5 }}
      />

      {/* Stats */}
      <Card style={{ marginTop: 20 }}>
        <p>📌 Total: {stats.total || 0}</p>
        <p>⏳ Pending: {stats.pending || 0}</p>
        <p>✏️ Edited: {stats.edited || 0}</p>
        <p>✅ Approved: {stats.approved || 0}</p>
      </Card>

      {/* Override Modal */}
      <Modal
        title="Override Label"
        open={!!editItem}
        onOk={saveEdit}
        onCancel={() => setEditItem(null)}
      >
        <Input
          placeholder="Enter new label"
          value={newLabel}
          onChange={(e) => setNewLabel(e.target.value)}
        />
      </Modal>
    </div>
  );
}

export default App;
