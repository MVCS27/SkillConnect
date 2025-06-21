import React, { useEffect, useState } from "react";
import NavbarAdmin from "../../components/navbar-admin";
import API_BASE_URL from "../../config/api";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetch(`${API_BASE_URL}/admin/customers`)
      .then(res => res.json())
      .then(data => {
        if (data.status === "ok") setUsers(data.data);
      });
  }, []);

  return (
    <div>
      <NavbarAdmin />
      <div style={{ maxWidth: 900, margin: "2rem auto", padding: "2rem" }}>
        <h2 style={{ color: "#d4a017" }}>Admin Users</h2>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ borderBottom: "1px solid #ccc" }}>Name</th>
              <th style={{ borderBottom: "1px solid #ccc" }}>Email</th>
              <th style={{ borderBottom: "1px solid #ccc" }}>Phone Number</th>
              <th style={{ borderBottom: "1px solid #ccc" }}>Address</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user._id}>
                <td>{user.firstName} {user.lastName}</td>
                <td>{user.email}</td>
                <td>{user.phoneNumber}</td>
                <td>
                  {user.address?.street}, {user.address?.barangay}, {user.address?.cityMunicipality}, {user.address?.province}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}