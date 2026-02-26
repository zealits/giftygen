import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./SuperAdminDashboard.css";
import Modal from "../Notification/Modal";

const SuperAdminDashboard = () => {
  const [requests, setRequests] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectNotes, setRejectNotes] = useState("");
  const [notifyVisible, setNotifyVisible] = useState(false);
  const [notifyMessage, setNotifyMessage] = useState("");
  const [adminForm, setAdminForm] = useState({
    name: "",
    email: "",
    restaurantName: "",
    phone: "",
    businessSlug: "",
    password: "",
  });

  // ── Promo Code State ─────────────────────────────────────────────────────
  const [promoCodes, setPromoCodes] = useState([]);
  const [promoForm, setPromoForm] = useState({
    code: "",
    description: "",
    discountPercent: 60,
    maxUses: "",
    planLevel: "all", // all, small, medium, large
    period: "all",    // all, quarterly, biannual, yearly
  });
  const [promoLoading, setPromoLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    // Check if super admin is logged in
    const token = localStorage.getItem("superAdminToken");
    if (!token) {
      navigate("/superlogin");
      return;
    }

    fetchData();
    fetchPromoCodes();
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

  // ── Promo Code Functions ────────────────────────────────────────────────
  const fetchPromoCodes = async () => {
    try {
      const token = localStorage.getItem("superAdminToken");
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const res = await axios.get("/api/superadmin/promo-codes", config);
      setPromoCodes(res.data.promoCodes);
    } catch (error) {
      console.error("Error fetching promo codes:", error);
    }
  };

  const handleCreatePromo = async () => {
    if (!promoForm.code.trim()) {
      setNotifyMessage("Promo code is required");
      setNotifyVisible(true);
      return;
    }
    setPromoLoading(true);

    // Map planLevel and period to backend plan keys
    // small: quarterly, biannual, yearly
    // medium: medium_quarterly, medium_biannual, medium_yearly
    // large: large_quarterly, large_biannual, large_yearly
    let applicablePlanTypes = [];
    
    if (promoForm.planLevel !== "all" || promoForm.period !== "all") {
      const levels = promoForm.planLevel === "all" ? ["small", "medium", "large"] : [promoForm.planLevel];
      const periods = promoForm.period === "all" ? ["quarterly", "biannual", "yearly"] : [promoForm.period];
      
      levels.forEach(level => {
        periods.forEach(per => {
          if (level === "small") applicablePlanTypes.push(per);
          else applicablePlanTypes.push(`${level}_${per}`);
        });
      });
    }

    try {
      const token = localStorage.getItem("superAdminToken");
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.post("/api/superadmin/promo-codes", {
        code: promoForm.code,
        description: promoForm.description,
        discountPercent: Number(promoForm.discountPercent) || 60,
        maxUses: promoForm.maxUses ? Number(promoForm.maxUses) : null,
        applicablePlanTypes,
      }, config);
      setNotifyMessage("Promo code created successfully!");
      setNotifyVisible(true);
      setPromoForm({ code: "", description: "", discountPercent: 60, maxUses: "", planLevel: "all", period: "all" });
      fetchPromoCodes();
    } catch (error) {
      setNotifyMessage(error?.response?.data?.message || "Failed to create promo code");
      setNotifyVisible(true);
    } finally {
      setPromoLoading(false);
    }
  };

  const handleTogglePromo = async (id) => {
    try {
      const token = localStorage.getItem("superAdminToken");
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.put(`/api/superadmin/promo-codes/${id}/toggle`, {}, config);
      fetchPromoCodes();
    } catch (error) {
      setNotifyMessage("Failed to toggle promo code");
      setNotifyVisible(true);
    }
  };

  const handleDeletePromo = async (id) => {
    if (!window.confirm("Are you sure you want to delete this promo code?")) return;
    try {
      const token = localStorage.getItem("superAdminToken");
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.delete(`/api/superadmin/promo-codes/${id}`, config);
      setNotifyMessage("Promo code deleted");
      setNotifyVisible(true);
      fetchPromoCodes();
    } catch (error) {
      setNotifyMessage("Failed to delete promo code");
      setNotifyVisible(true);
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

      setNotifyMessage("Request approved! Login credentials have been sent to the registered email.");
      setNotifyVisible(true);

      // Refresh data and close modal
      fetchData();
      setShowModal(false);
      setSelectedRequest(null);
    } catch (error) {
      console.error("Error approving request:", error);
      setNotifyMessage(error?.response?.data?.message || "Failed to approve request");
      setNotifyVisible(true);
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

      setNotifyMessage("Request rejected successfully.");
      setNotifyVisible(true);

      // Refresh data and close modal
      fetchData();
      setShowModal(false);
      setSelectedRequest(null);
      setRejectNotes("");
    } catch (error) {
      console.error("Error rejecting request:", error);
      setNotifyMessage(error?.response?.data?.message || "Failed to reject request");
      setNotifyVisible(true);
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

      {/* <div className="create-admin-section">
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
                setNotifyMessage("Business admin created");
                setNotifyVisible(true);
                setAdminForm({ name: "", email: "", restaurantName: "", phone: "", businessSlug: "", password: "" });
              } catch (e) {
                setNotifyMessage(e?.response?.data?.message || "Failed to create admin");
                setNotifyVisible(true);
              }
            }}
          >
            Create
          </button>
        </div>
      </div> */}

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
                    Reject
                  </button>

                  <button
                    onClick={handleApproveRequest}
                    className="approve-button"
                    disabled={actionLoading}
                  >
                    Approve Request
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

      {/* ── Promo Codes Section ────────────────────────────────────────────── */}
      <div className="requests-section">
        <h2>🎟️ Promo Codes</h2>

        <div className="promo-create-form">
          <input
            placeholder="PROMO CODE"
            value={promoForm.code}
            onChange={(e) => setPromoForm({ ...promoForm, code: e.target.value.toUpperCase() })}
            style={{ textTransform: "uppercase" }}
          />
          <input
            placeholder="Description (optional)"
            value={promoForm.description}
            onChange={(e) => setPromoForm({ ...promoForm, description: e.target.value })}
          />
          <input
            type="number"
            placeholder="Discount %"
            value={promoForm.discountPercent}
            onChange={(e) => setPromoForm({ ...promoForm, discountPercent: e.target.value })}
            min="1" max="100"
            style={{ width: "100px" }}
          />
          <input
            type="number"
            placeholder="Max Uses (empty=unlimited)"
            value={promoForm.maxUses}
            onChange={(e) => setPromoForm({ ...promoForm, maxUses: e.target.value })}
            min="1"
            style={{ width: "160px" }}
          />

          {/* New Dropdowns for Plan Level and Period */}
          <select
            value={promoForm.planLevel}
            onChange={(e) => setPromoForm({ ...promoForm, planLevel: e.target.value })}
            style={{ 
              padding: "10px", 
              borderRadius: "6px", 
              border: "1px solid rgba(255,255,255,0.15)", 
              background: "rgba(255,255,255,0.06)", 
              color: "#e5e7eb" 
            }}
          >
            <option value="all" style={{ color: "black" }}>All Business Plans</option>
            <option value="small" style={{ color: "black" }}>Starter Plan</option>
            <option value="medium" style={{ color: "black" }}>Growth Plan</option>
            <option value="large" style={{ color: "black" }}>Scale Plan</option>
          </select>

          <select
            value={promoForm.period}
            onChange={(e) => setPromoForm({ ...promoForm, period: e.target.value })}
            style={{ 
              padding: "10px", 
              borderRadius: "6px", 
              border: "1px solid rgba(255,255,255,0.15)", 
              background: "rgba(255,255,255,0.06)", 
              color: "#e5e7eb" 
            }}
          >
            <option value="all" style={{ color: "black" }}>All Periods</option>
            <option value="quarterly" style={{ color: "black" }}>3 Months</option>
            <option value="biannual" style={{ color: "black" }}>6 Months</option>
            <option value="yearly" style={{ color: "black" }}>1 Year</option>
          </select>
          <button onClick={handleCreatePromo} disabled={promoLoading} className="approve-button">
            {promoLoading ? "Creating..." : "Create"}
          </button>
        </div>

        {promoCodes.length > 0 && (
          <div className="requests-table">
            <table>
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Discount</th>
                  <th>Description</th>
                  <th>Applied To</th>
                  <th>Used</th>
                  <th>Max Uses</th>
                  <th>Status</th>
                  <th>Expires</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {promoCodes.map((p) => (
                  <tr key={p._id}>
                    <td style={{ fontWeight: "bold", letterSpacing: "1px" }}>{p.code}</td>
                    <td>{p.discountPercent}%</td>
                    <td>{p.description || "—"}</td>
                    <td style={{ fontSize: "12px", color: "#a0aec0" }}>
                      {p.applicablePlanTypes && p.applicablePlanTypes.length > 0 
                        ? p.applicablePlanTypes.join(", ") 
                        : "All Plans"}
                    </td>
                    <td>{p.usedCount}</td>
                    <td>{p.maxUses || "∞"}</td>
                    <td>
                      <span
                        className="status-badge"
                        style={{
                          backgroundColor: p.isActive ? "#27ae60" : "#e74c3c",
                        }}
                      >
                        {p.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td>
                      {p.expiresAt
                        ? new Date(p.expiresAt).toLocaleDateString()
                        : "Never"}
                    </td>
                    <td>
                      <button
                        onClick={() => handleTogglePromo(p._id)}
                        className="view-button"
                        style={{ marginRight: "6px" }}
                      >
                        {p.isActive ? "Disable" : "Enable"}
                      </button>
                      <button
                        onClick={() => handleDeletePromo(p._id)}
                        className="reject-button"
                        style={{ padding: "6px 12px", fontSize: "0.85rem" }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {promoCodes.length === 0 && (
          <p style={{ color: "#95a5a6", textAlign: "center", padding: "20px" }}>
            No promo codes yet. Create one above.
          </p>
        )}
      </div>


      {notifyVisible && (
        <Modal message={notifyMessage} onClose={() => setNotifyVisible(false)} />
      )}
    </div>
  );
};

export default SuperAdminDashboard;