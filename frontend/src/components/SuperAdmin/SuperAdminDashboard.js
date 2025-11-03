import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./SuperAdminDashboard.css";

const SuperAdminDashboard = () => {
  const [requests, setRequests] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [adminForm, setAdminForm] = useState({
    name: "",
    email: "",
    restaurantName: "",
    phone: "",
    businessSlug: "",
    password: "",
  });
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("superAdminToken");
    if (!token) {
      navigate("/superlogin");
      return;
    }
    fetchData();
  }, [navigate]);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("superAdminToken");
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };

      const [requestsRes, statsRes] = await Promise.all([
        axios.get("/api/superadmin/registration-requests", config),
        axios.get("/api/superadmin/stats", config),
      ]);

      setRequests(requestsRes.data.requests);
      setStats(statsRes.data.stats);
    } catch (error) {
      console.error("Error fetching data:", error);
      if (error.response?.status === 401) {
        localStorage.removeItem("superAdminToken");
        navigate("/superlogin");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!selectedRequest) return;
    
    try {
      const token = localStorage.getItem("superAdminToken");
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };

      await axios.put(
        `/api/superadmin/registration-requests/${selectedRequest._id}/status`,
        { status: "approved", notes: "" },
        config
      );

      const adminData = {
        name: selectedRequest.name || "",
        email: selectedRequest.email || "",
        restaurantName: selectedRequest.restaurantName || "",
        phone: selectedRequest.phone || "",
        businessSlug: selectedRequest.businessSlug || "",
        password: "",
      };

      await axios.post("/api/superadmin/business-admin", adminData, config);

      alert(`Request approved! Credentials have been sent to ${selectedRequest.email}`);
      
      fetchData();
      setShowModal(false);
      setSelectedRequest(null);
    } catch (error) {
      console.error("Error approving request:", error);
      alert(error?.response?.data?.message || "Failed to approve request");
    }
  };

  const handleReject = async () => {
    if (!selectedRequest) return;
    
    try {
      const token = localStorage.getItem("superAdminToken");
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };

      await axios.put(
        `/api/superadmin/registration-requests/${selectedRequest._id}/status`,
        { status: "rejected", notes: "" },
        config
      );

      alert("Request rejected successfully");
      
      fetchData();
      setShowModal(false);
      setSelectedRequest(null);
    } catch (error) {
      console.error("Error rejecting request:", error);
      alert(error?.response?.data?.message || "Failed to reject request");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("superAdminToken");
    localStorage.removeItem("superAdminRole");
    navigate("/superlogin");
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "#f39c12";
      case "approved":
        return "#27ae60";
      case "rejected":
        return "#e74c3c";
      default:
        return "#95a5a6";
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="super-admin-dashboard">
      <header className="dashboard-header">
        <h1>Super Admin Dashboard</h1>
        <button onClick={handleLogout} className="logout-button">
          Logout
        </button>
      </header>

      <div className="stats-section">
        <div className="stat-card">
          <h3>Total Requests</h3>
          <p>{stats.total || 0}</p>
        </div>
        <div className="stat-card">
          <h3>Pending</h3>
          <p style={{ color: "#f39c12" }}>{stats.pending || 0}</p>
        </div>
        <div className="stat-card">
          <h3>Approved</h3>
          <p style={{ color: "#27ae60" }}>{stats.approved || 0}</p>
        </div>
        <div className="stat-card">
          <h3>Rejected</h3>
          <p style={{ color: "#e74c3c" }}>{stats.rejected || 0}</p>
        </div>
      </div>

      <div className="create-admin-section">
        <h2>Create Business Admin</h2>
        <div className="create-admin-form">
          <input
            placeholder="Restaurant Name"
            value={adminForm.restaurantName}
            onChange={(e) => setAdminForm({ ...adminForm, restaurantName: e.target.value })}
          />
          <input
            placeholder="Admin Name"
            value={adminForm.name}
            onChange={(e) => setAdminForm({ ...adminForm, name: e.target.value })}
          />
          <input
            placeholder="Email"
            value={adminForm.email}
            onChange={(e) => setAdminForm({ ...adminForm, email: e.target.value })}
          />
          <input
            placeholder="Phone"
            value={adminForm.phone}
            onChange={(e) => setAdminForm({ ...adminForm, phone: e.target.value })}
          />
          <input
            placeholder="Business Slug (optional)"
            value={adminForm.businessSlug}
            onChange={(e) => setAdminForm({ ...adminForm, businessSlug: e.target.value })}
          />
          <input
            placeholder="Password (optional)"
            value={adminForm.password}
            onChange={(e) => setAdminForm({ ...adminForm, password: e.target.value })}
          />
          <button
            onClick={async () => {
              try {
                const token = localStorage.getItem("superAdminToken");
                const config = { headers: { Authorization: `Bearer ${token}` } };
                await axios.post("/api/superadmin/business-admin", adminForm, config);
                alert("Business admin created");
                setAdminForm({ name: "", email: "", restaurantName: "", phone: "", businessSlug: "", password: "" });
              } catch (e) {
                alert(e?.response?.data?.message || "Failed to create admin");
              }
            }}
          >
            Create
          </button>
        </div>
      </div>

      <div className="requests-section">
        <h2>Registration Requests</h2>
        <div className="requests-table">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Restaurant</th>
                <th>Phone</th>
                <th>Business type</th>
                <th>Website</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((request) => (
                <tr key={request._id}>
                  <td>{request.name || "N/A"}</td>
                  <td>{request.email}</td>
                  <td>{request.restaurantName || "N/A"}</td>
                  <td>{request.phone || "N/A"}</td>
                  <td>{request.businessType || "N/A"}</td>
                  <td>{request.website || "N/A"}</td>
                  <td>
                    <span className="status-badge" style={{ backgroundColor: getStatusColor(request.status) }}>
                      {request.status}
                    </span>
                  </td>
                  <td>{new Date(request.createdAt).toLocaleDateString()}</td>
                  <td>
                    <button
                      onClick={() => {
                        setSelectedRequest(request);
                        setShowModal(true);
                      }}
                      className="view-button"
                    >
                      View/Update
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && selectedRequest && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Update Request Status</h3>
            <div className="request-details">
              <p>
                <strong>Name:</strong> {selectedRequest.name || "N/A"}
              </p>
              <p>
                <strong>Email:</strong> {selectedRequest.email}
              </p>
              <p>
                <strong>Restaurant:</strong> {selectedRequest.restaurantName || "N/A"}
              </p>
              <p>
                <strong>Phone:</strong> {selectedRequest.phone || "N/A"}
              </p>
              <p>
                <strong>Address:</strong> {selectedRequest.restaurantAddress?.street},{" "}
                {selectedRequest.restaurantAddress?.city}, {selectedRequest.restaurantAddress?.state}{" "}
                {selectedRequest.restaurantAddress?.zipCode}
              </p>
            </div>

            <div className="modal-actions">
              <button onClick={() => setShowModal(false)} className="cancel-button">
                Cancel
              </button>
              <button onClick={handleReject} className="update-button">
                Reject
              </button>
              <button onClick={handleApprove} className="update-button">
                Approve
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperAdminDashboard;