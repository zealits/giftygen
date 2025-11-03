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
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectNotes, setRejectNotes] = useState("");
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
    // Check if super admin is logged in
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

  const handleApproveRequest = async () => {
    if (!selectedRequest) return;
    
    setActionLoading(true);
    try {
      const token = localStorage.getItem("superAdminToken");
      const config = { headers: { Authorization: `Bearer ${token}` } };

      // Create business admin with data from the registration request
      const adminData = {
        name: selectedRequest.name,
        email: selectedRequest.email,
        restaurantName: selectedRequest.restaurantName,
        phone: selectedRequest.phone,
        businessSlug: selectedRequest.businessSlug || "",
        password: "", // Let backend generate password
        restaurantAddress: selectedRequest.restaurantAddress,
        businessType: selectedRequest.businessType,
        website: selectedRequest.website
      };

      // Create business admin (this will send credentials via email)
      await axios.post("/api/superadmin/business-admin", adminData, config);

      // Update request status to approved
      await axios.put(
        `/api/superadmin/registration-requests/${selectedRequest._id}/status`,
        { status: "approved", notes: "Request approved and credentials sent via email" },
        config
      );

      alert("Request approved! Login credentials have been sent to the registered email.");
      
      // Refresh data and close modal
      fetchData();
      setShowModal(false);
      setSelectedRequest(null);
    } catch (error) {
      console.error("Error approving request:", error);
      alert(error?.response?.data?.message || "Failed to approve request");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectRequest = async () => {
    if (!selectedRequest) return;
    
    setActionLoading(true);
    try {
      const token = localStorage.getItem("superAdminToken");
      const config = { headers: { Authorization: `Bearer ${token}` } };

      // Update request status to rejected
      await axios.put(
        `/api/superadmin/registration-requests/${selectedRequest._id}/status`,
        { status: "rejected", notes: rejectNotes || "Request rejected" },
        config
      );

      alert("Request rejected successfully.");
      
      // Refresh data and close modal
      fetchData();
      setShowModal(false);
      setSelectedRequest(null);
      setRejectNotes("");
    } catch (error) {
      console.error("Error rejecting request:", error);
      alert(error?.response?.data?.message || "Failed to reject request");
    } finally {
      setActionLoading(false);
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
        <h2>Create Business Admin (Manual)</h2>
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
                        setRejectNotes("");
                      }}
                      className="view-button"
                    >
                      View/Action
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Action Modal */}
      {showModal && selectedRequest && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Request Details & Actions</h3>
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
                <strong>Business Type:</strong> {selectedRequest.businessType || "N/A"}
              </p>
              <p>
                <strong>Website:</strong> {selectedRequest.website || "N/A"}
              </p>
              <p>
                <strong>Address:</strong>{" "}
                {selectedRequest.restaurantAddress
                  ? `${selectedRequest.restaurantAddress.street}, ${selectedRequest.restaurantAddress.city}, ${selectedRequest.restaurantAddress.state} ${selectedRequest.restaurantAddress.zipCode}`
                  : "N/A"}
              </p>
              <p>
                <strong>Current Status:</strong>{" "}
                <span style={{ color: getStatusColor(selectedRequest.status), fontWeight: "bold" }}>
                  {selectedRequest.status}
                </span>
              </p>
            </div>

            {selectedRequest.status === "pending" && (
              <>
                <div className="form-group">
                  <label>Notes (optional):</label>
                  <textarea
                    value={rejectNotes}
                    onChange={(e) => setRejectNotes(e.target.value)}
                    placeholder="Add any notes"
                    rows="3"
                  />
                </div>

                <div className="modal-actions">
                  <button onClick={() => setShowModal(false)} className="cancel-button" disabled={actionLoading}>
                    Cancel
                  </button>
                   <button
                  onClick={handleRejectRequest}
                  className="reject-button"
                  disabled={actionLoading}
               >
                  {actionLoading ? "Processing..." : "Reject"}
                   </button>

                  <button
                   onClick={handleApproveRequest}
                   className="approve-button"
                   disabled={actionLoading}
                  >
                    {actionLoading ? "Processing..." : "Approve Request"}
                  </button>
                </div>
              </>
            )}

            {selectedRequest.status !== "pending" && (
              <div className="modal-actions">
                <button onClick={() => setShowModal(false)} className="cancel-button">
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperAdminDashboard;