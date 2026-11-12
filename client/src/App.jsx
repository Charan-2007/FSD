import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Trash2, 
  Edit3, 
  AlertTriangle, 
  CheckCircle, 
  Package, 
  DollarSign, 
  ShieldAlert,
  Clock,
  X
} from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/medicines';

export default function App() {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalItems: 0,
    totalStock: 0,
    totalValue: 0,
    lowStockCount: 0,
    expiredCount: 0,
    categories: []
  });

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [lowStockFilter, setLowStockFilter] = useState(false);
  const [expiredFilter, setExpiredFilter] = useState(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    genericName: '',
    category: 'Antibiotics',
    dosage: '',
    manufacturer: '',
    batchNumber: '',
    quantity: 0,
    minThreshold: 10,
    price: 0,
    expiryDate: '',
    supplierName: '',
    supplierContact: '',
  });

  const categoriesList = ['Antibiotics', 'Pain Relief', 'Cardiovascular', 'Vitamins', 'Respiratory', 'Dermatology', 'Gastrointestinal', 'Other'];

  const fetchStats = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/stats/summary`);
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  };

  const fetchMedicines = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (categoryFilter !== 'All') params.append('category', categoryFilter);
      if (lowStockFilter) params.append('lowStock', 'true');
      if (expiredFilter) params.append('expired', 'true');

      const res = await fetch(`${API_BASE_URL}?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setMedicines(data);
      }
    } catch (err) {
      console.error('Failed to fetch medicines:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    fetchMedicines();
  }, [search, categoryFilter, lowStockFilter, expiredFilter]);

  const handleOpenAdd = () => {
    setEditingMedicine(null);
    setFormData({
      name: '',
      genericName: '',
      category: 'Antibiotics',
      dosage: '',
      manufacturer: '',
      batchNumber: `BAT-${Math.floor(1000 + Math.random() * 9000)}`,
      quantity: 50,
      minThreshold: 10,
      price: 15.00,
      expiryDate: new Date(Date.now() + 365*24*60*60*1000).toISOString().split('T')[0],
      supplierName: '',
      supplierContact: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (med) => {
    setEditingMedicine(med);
    setFormData({
      name: med.name,
      genericName: med.genericName || '',
      category: med.category,
      dosage: med.dosage || '',
      manufacturer: med.manufacturer || '',
      batchNumber: med.batchNumber,
      quantity: med.quantity,
      minThreshold: med.minThreshold,
      price: med.price,
      expiryDate: med.expiryDate ? med.expiryDate.split('T')[0] : '',
      supplierName: med.supplier?.name || '',
      supplierContact: med.supplier?.contact || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      quantity: Number(formData.quantity),
      minThreshold: Number(formData.minThreshold),
      price: Number(formData.price),
      supplier: {
        name: formData.supplierName,
        contact: formData.supplierContact,
      }
    };

    try {
      const url = editingMedicine 
        ? `${API_BASE_URL}/${editingMedicine._id}` 
        : API_BASE_URL;
      const method = editingMedicine ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setIsModalOpen(false);
        fetchMedicines();
        fetchStats();
      } else {
        const errorData = await res.json();
        alert(`Error: ${errorData.error}`);
      }
    } catch (err) {
      alert('Network request failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this medicine?')) return;
    try {
      const res = await fetch(`${API_BASE_URL}/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchMedicines();
        fetchStats();
      }
    } catch (err) {
      alert('Failed to delete medicine');
    }
  };

  const isExpired = (expiryDate) => {
    return new Date(expiryDate) < new Date();
  };

  return (
    <div className="app-container">
      {/* Header */}
      <header className="header">
        <div className="brand">
          <div className="brand-icon">
            <Package size={28} />
          </div>
          <div>
            <h1 className="brand-title">PharmaFlow</h1>
            <p className="brand-subtitle">Smart Pharmacy Inventory Management Web Service</p>
          </div>
        </div>
        <button className="btn-primary" onClick={handleOpenAdd}>
          <Plus size={18} />
          Add Medicine
        </button>
      </header>

      {/* KPI Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-info">
            <p>Total Products</p>
            <h3>{stats.totalItems}</h3>
          </div>
          <div className="stat-icon" style={{ background: '#e0f2fe', color: '#0284c7' }}>
            <Package size={24} />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <p>Units in Stock</p>
            <h3>{stats.totalStock}</h3>
          </div>
          <div className="stat-icon" style={{ background: '#dcfce7', color: '#16a34a' }}>
            <CheckCircle size={24} />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <p>Inventory Value</p>
            <h3>${stats.totalValue.toLocaleString()}</h3>
          </div>
          <div className="stat-icon" style={{ background: '#fef3c7', color: '#d97706' }}>
            <DollarSign size={24} />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <p>Low Stock Alerts</p>
            <h3 style={{ color: stats.lowStockCount > 0 ? '#ef4444' : 'inherit' }}>
              {stats.lowStockCount}
            </h3>
          </div>
          <div className="stat-icon" style={{ background: '#fee2e2', color: '#dc2626' }}>
            <AlertTriangle size={24} />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <p>Expired Batches</p>
            <h3 style={{ color: stats.expiredCount > 0 ? '#ef4444' : 'inherit' }}>
              {stats.expiredCount}
            </h3>
          </div>
          <div className="stat-icon" style={{ background: '#fee2e2', color: '#b91c1c' }}>
            <Clock size={24} />
          </div>
        </div>
      </div>

      {/* Controls & Filter Bar */}
      <div className="controls-bar">
        <div className="search-input-wrapper">
          <Search className="search-icon" size={18} />
          <input
            type="text"
            className="search-input"
            placeholder="Search by medicine name, generic name, batch, or manufacturer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="filters-group">
          <select 
            className="select-filter"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="All">All Categories</option>
            {categoriesList.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          <button 
            className={`toggle-btn ${lowStockFilter ? 'active' : ''}`}
            onClick={() => setLowStockFilter(!lowStockFilter)}
          >
            Low Stock Only
          </button>

          <button 
            className={`toggle-btn ${expiredFilter ? 'active' : ''}`}
            onClick={() => setExpiredFilter(!expiredFilter)}
          >
            Expired Only
          </button>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="table-container">
        {loading ? (
          <div className="empty-state">Loading pharmacy inventory...</div>
        ) : medicines.length === 0 ? (
          <div className="empty-state">
            <p>No medicines found matching the criteria.</p>
          </div>
        ) : (
          <table className="inventory-table">
            <thead>
              <tr>
                <th>Medicine</th>
                <th>Category</th>
                <th>Batch No</th>
                <th>Stock Quantity</th>
                <th>Unit Price</th>
                <th>Expiry Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {medicines.map((med) => {
                const expired = isExpired(med.expiryDate);
                const isLow = med.quantity <= med.minThreshold;

                return (
                  <tr key={med._id}>
                    <td>
                      <div className="medicine-name">{med.name} {med.dosage && `(${med.dosage})`}</div>
                      <div className="medicine-generic">{med.genericName || med.manufacturer || 'General'}</div>
                    </td>
                    <td>{med.category}</td>
                    <td><code>{med.batchNumber}</code></td>
                    <td>
                      <strong>{med.quantity}</strong> units
                      {isLow && <span style={{ color: '#ef4444', marginLeft: 6, fontSize: '0.8rem' }}>(Min: {med.minThreshold})</span>}
                    </td>
                    <td>${med.price.toFixed(2)}</td>
                    <td>{new Date(med.expiryDate).toLocaleDateString()}</td>
                    <td>
                      {expired ? (
                        <span className="badge badge-expired">Expired</span>
                      ) : isLow ? (
                        <span className="badge badge-low-stock">Low Stock</span>
                      ) : (
                        <span className="badge badge-in-stock">Available</span>
                      )}
                    </td>
                    <td>
                      <div className="action-btns">
                        <button className="icon-btn" onClick={() => handleOpenEdit(med)} title="Edit">
                          <Edit3 size={16} />
                        </button>
                        <button className="icon-btn delete" onClick={() => handleDelete(med._id)} title="Delete">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal for Create/Update */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingMedicine ? 'Edit Medicine' : 'Add New Medicine'}</h2>
              <button className="icon-btn" onClick={() => setIsModalOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Brand / Medicine Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Amoxicillin"
                  />
                </div>

                <div className="form-group">
                  <label>Generic Name</label>
                  <input
                    type="text"
                    value={formData.genericName}
                    onChange={(e) => setFormData({ ...formData, genericName: e.target.value })}
                    placeholder="e.g. Amoxicillin Trihydrate"
                  />
                </div>

                <div className="form-group">
                  <label>Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    {categoriesList.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Dosage</label>
                  <input
                    type="text"
                    value={formData.dosage}
                    onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                    placeholder="e.g. 500mg, 10ml"
                  />
                </div>

                <div className="form-group">
                  <label>Manufacturer</label>
                  <input
                    type="text"
                    value={formData.manufacturer}
                    onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                    placeholder="e.g. Pfizer, Sun Pharma"
                  />
                </div>

                <div className="form-group">
                  <label>Batch Number *</label>
                  <input
                    type="text"
                    required
                    value={formData.batchNumber}
                    onChange={(e) => setFormData({ ...formData, batchNumber: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Stock Quantity *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Min Threshold (Alert) *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.minThreshold}
                    onChange={(e) => setFormData({ ...formData, minThreshold: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Unit Price ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Expiry Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.expiryDate}
                    onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Supplier Name</label>
                  <input
                    type="text"
                    value={formData.supplierName}
                    onChange={(e) => setFormData({ ...formData, supplierName: e.target.value })}
                    placeholder="e.g. MedDistributors Ltd."
                  />
                </div>

                <div className="form-group">
                  <label>Supplier Contact</label>
                  <input
                    type="text"
                    value={formData.supplierContact}
                    onChange={(e) => setFormData({ ...formData, supplierContact: e.target.value })}
                    placeholder="Phone or Email"
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editingMedicine ? 'Update Medicine' : 'Save Medicine'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
