// SingleInventoryView.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './SingleInventoryView.css';
import { useSelector } from 'react-redux';

const SingleInventoryView = ({ userType = 'admin', userBranch = null }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [inventory, setInventory] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [formData, setFormData] = useState({});
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [validationErrors, setValidationErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { token, user } = useSelector((state) => state.auth);

    const API_BASE_URL = user?.role == 'admin' ? `${import.meta.env.VITE_API_URL}/api/subadmin` : `${import.meta.env.VITE_API_URL}/api/subadmin`

    // Get base URL for images
    const getImageUrl = (imagePath) => {
        if (!imagePath) return '/placeholder-image.jpg';
        return `${import.meta.env.VITE_API_URL}${imagePath}`;
    };

    const getAuthToken = () => {
        return token;
    };

    const fetchInventory = async () => {
        try {
            setLoading(true);
            const token = getAuthToken();
            const response = await fetch(`${API_BASE_URL}/inventory/${id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch inventory');
            }

            const data = await response.json();
            console.log(data);
            if (data.success) {
                setInventory(data.data);
                setFormData(data.data);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const updateInventory = async () => {
        try {
            setIsSubmitting(true);
            setValidationErrors({});
            
            const token = getAuthToken();
            const updatePayload = {
                quantity_in_stock: formData.quantity_in_stock,
                quantity_reserved: formData.quantity_reserved,
                reorder_level: formData.reorder_level,
                max_stock_level: formData.max_stock_level,
                cost_price: formData.cost_price,
                selling_price: formData.selling_price,
                supplier: formData.supplier,
                expiry_date: formData.expiry_date,
                notes: formData.notes,
                // is_active: formData.is_active
            };

            // Convert boolean to string for form data
            if (updatePayload.is_active !== undefined) {
                updatePayload.is_active = updatePayload.is_active ? 'true' : 'false';
            }

            const formDataEncoded = new URLSearchParams();
            Object.keys(updatePayload).forEach(key => {
                if (updatePayload[key] !== null && updatePayload[key] !== undefined) {
                    formDataEncoded.append(key, updatePayload[key]);
                }
            });

            const response = await fetch(`${API_BASE_URL}/inventory/${id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: formDataEncoded,
            });

            const data = await response.json();

            if (!response.ok) {
                if (response.status === 422 && data.errors) {
                    // Handle validation errors
                    setValidationErrors(data.errors);
                    throw new Error(data.message || 'Validation failed');
                } else {
                    throw new Error(data.message || 'Failed to update inventory');
                }
            }

            if (data.success) {
                setInventory(data.data);
                setEditMode(false);
                setValidationErrors({});
                alert('Inventory updated successfully');
            }
        } catch (err) {
            setError(err.message);
            // If it's not a validation error, show the general error
            if (!err.message.includes('Validation failed')) {
                alert(`Error: ${err.message}`);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const deleteInventory = async () => {
        if (!window.confirm('Are you sure you want to delete this inventory item?')) {
            return;
        }

        try {
            const token = getAuthToken();
            const response = await fetch(`${API_BASE_URL}/inventory/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error('Failed to delete inventory');
            }

            const data = await response.json();
            if (data.success) {
                alert('Inventory deleted successfully');
                navigate('/inventory');
            }
        } catch (err) {
            setError(err.message);
        }
    };

    useEffect(() => {
        if (id) {
            fetchInventory();
        }
    }, [id]);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));

        // Clear validation error for this field when user starts typing
        if (validationErrors[name]) {
            setValidationErrors(prev => ({
                ...prev,
                [name]: null
            }));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        updateInventory();
    };

    // Helper function to display validation errors for a field
    const renderFieldError = (fieldName) => {
        const error = validationErrors[fieldName];
        if (error && error.length > 0) {
            return (
                <div className="field-error">
                    {error.map((err, index) => (
                        <span key={index} className="error-text">{err}</span>
                    ))}
                </div>
            );
        }
        return null;
    };

    if (loading) return <div className="loading">Loading inventory details...</div>;
    if (error && !validationErrors) return <div className="error">Error: {error}</div>;
    if (!inventory) return <div className="error">Inventory not found</div>;

    // Get all available images
    const productImages = inventory.product?.images || [];
    const mainImage = inventory.product?.image ? [inventory.product.image] : [];
    const allImages = [...mainImage, ...productImages].filter(Boolean);

    return (
        <div className="admin-products">
            <div className="products-header">
                <div>
                    <button
                        className="btn-secondary"
                        onClick={() => navigate('/inventory')}
                        style={{ marginRight: '10px' }}
                    >
                        ← Back to Inventory
                    </button>
                    <h1>Inventory Details</h1>
                    <p>{inventory.product?.name}</p>
                </div>
                <div className="header-actions">
                    {!editMode ? (
                        <>
                            <button
                                className="btn-primary"
                                onClick={() => setEditMode(true)}
                                style={{ marginRight: '10px' }}
                            >
                                Edit Inventory
                            </button>
                            <button
                                className="btn-danger"
                                onClick={deleteInventory}
                            >
                                Delete Inventory
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                className="btn-secondary"
                                onClick={() => {
                                    setEditMode(false);
                                    setFormData(inventory);
                                    setSelectedImageIndex(0);
                                    setValidationErrors({});
                                }}
                                style={{ marginRight: '10px' }}
                            >
                                Cancel
                            </button>
                            <button
                                className="btn-primary"
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Saving...' : 'Save Changes'}
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Display general validation error message */}
            {validationErrors && Object.keys(validationErrors).length > 0 && (
                <div className="validation-error-banner">
                    <h4>Please fix the following errors:</h4>
                    <ul>
                        {Object.entries(validationErrors).map(([field, errors]) => (
                            errors.map((error, index) => (
                                <li key={`${field}-${index}`}>{error}</li>
                            ))
                        ))}
                    </ul>
                </div>
            )}

            <div className="inventory-details">
                <div className="details-gri">
                    {/* Product Images Section */}
                    {allImages.length > 0 && (
                        <div className="details-section product-images-section">
                            <h3>Product Images</h3>
                            <div className="image-gallery">
                                <div className="main-image">
                                    <img 
                                        src={getImageUrl(allImages[selectedImageIndex])} 
                                        alt={`${inventory.product?.name} - Image ${selectedImageIndex + 1}`}
                                        onError={(e) => {
                                            e.target.src = '/placeholder-image.jpg';
                                        }}
                                    />
                                </div>
                                {allImages.length > 1 && (
                                    <div className="image-thumbnails">
                                        {allImages.map((image, index) => (
                                            <div 
                                                key={index}
                                                className={`thumbnail ${selectedImageIndex === index ? 'active' : ''}`}
                                                onClick={() => setSelectedImageIndex(index)}
                                            >
                                                <img 
                                                    src={getImageUrl(image)} 
                                                    alt={`Thumbnail ${index + 1}`}
                                                    onError={(e) => {
                                                        e.target.src = '/placeholder-image.jpg';
                                                    }}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    <div className="details-section">
                        <h3>Product Information</h3>
                        <div className="detail-item">
                            <label>Product Name:</label>
                            <span>{inventory.product?.name}</span>
                        </div>
                        <div className="detail-item">
                            <label>SKU:</label>
                            <span>{inventory.product?.sku}</span>
                        </div>
                        <div className="detail-item">
                            <label>Brand:</label>
                            <span>{inventory.product?.brand}</span>
                        </div>
                        <div className="detail-item">
                            <label>Size:</label>
                            <span>{inventory.product?.size || 'Not specified'}</span>
                        </div>
                        <div className="detail-item">
                            <label>Description:</label>
                            <span className="description-text">{inventory.product?.description}</span>
                        </div>
                    </div>

                    <div className="details-section">
                        <h3>Stock Information</h3>
                        {editMode ? (
                            <>
                                <div className="detail-item">
                                    <label>Quantity in Stock:</label>
                                    <input
                                        type="number"
                                        name="quantity_in_stock"
                                        value={formData.quantity_in_stock}
                                        onChange={handleInputChange}
                                        className={validationErrors.quantity_in_stock ? 'error' : ''+ 'form-control'}
                                    />
                                    {renderFieldError('quantity_in_stock')}
                                </div>
                                <div className="detail-item">
                                    <label>Quantity Reserved:</label>
                                    <input
                                        type="number"
                                        name="quantity_reserved"
                                        value={formData.quantity_reserved}
                                        onChange={handleInputChange}
                                        className={validationErrors.quantity_reserved ? 'error' : '' + 'form-control'}
                                    />
                                    {renderFieldError('quantity_reserved')}
                                </div>
                                <div className="detail-item">
                                    <label>Quantity Available:</label>
                                    <span>{formData.quantity_available}</span>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="detail-item">
                                    <label>Quantity in Stock:</label>
                                    <span>{inventory.quantity_in_stock}</span>
                                </div>
                                <div className="detail-item">
                                    <label>Quantity Reserved:</label>
                                    <span>{inventory.quantity_reserved}</span>
                                </div>
                                <div className="detail-item">
                                    <label>Quantity Available:</label>
                                    <span>{inventory.quantity_available}</span>
                                </div>
                            </>
                        )}
                    </div>

                    <div className="details-section">
                        <h3>Pricing & Settings</h3>
                        {editMode ? (
                            <>
                                <div className="detail-item">
                                    <label>Cost Price:</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        name="cost_price"
                                        value={formData.cost_price || ''}
                                        onChange={handleInputChange}
                                        className={validationErrors.cost_price ? 'error' : '' + 'form-control'}
                                    />
                                    {renderFieldError('cost_price')}
                                </div>
                                <div className="detail-item">
                                    <label>Selling Price:</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        name="selling_price"
                                        value={formData.selling_price}
                                        onChange={handleInputChange}
                                        className={validationErrors.selling_price ? 'error' : '' + 'form-control'}
                                    />
                                    {renderFieldError('selling_price')}
                                </div>
                                <div className="detail-item">
                                    <label>Reorder Level:</label>
                                    <input
                                        type="number"
                                        name="reorder_level"
                                        value={formData.reorder_level}
                                        onChange={handleInputChange}
                                        className={validationErrors.reorder_level ? 'error' : '' + 'form-control'}
                                    />
                                    {renderFieldError('reorder_level')}
                                </div>
                                <div className="detail-item">
                                    <label>Max Stock Level:</label>
                                    <input
                                        type="number"
                                        name="max_stock_level"
                                        value={formData.max_stock_level || ''}
                                        onChange={handleInputChange}
                                        className={validationErrors.max_stock_level ? 'error' : '' + 'form-control'}
                                    />
                                    {renderFieldError('max_stock_level')}
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="detail-item">
                                    <label>Cost Price:</label>
                                    <span>₦{parseFloat(inventory.cost_price || 0).toLocaleString()}</span>
                                </div>
                                <div className="detail-item">
                                    <label>Selling Price:</label>
                                    <span>₦{parseFloat(inventory.selling_price).toLocaleString()}</span>
                                </div>
                                <div className="detail-item">
                                    <label>Product Price:</label>
                                    <span>₦{parseFloat(inventory.product?.price || 0).toLocaleString()}</span>
                                </div>
                                <div className="detail-item">
                                    <label>Sale Price:</label>
                                    <span>₦{parseFloat(inventory.product?.sale_price || 0).toLocaleString()}</span>
                                </div>
                                <div className="detail-item">
                                    <label>Reorder Level:</label>
                                    <span>{inventory.reorder_level}</span>
                                </div>
                                <div className="detail-item">
                                    <label>Max Stock Level:</label>
                                    <span>{inventory.max_stock_level || 'Not set'}</span>
                                </div>
                            </>
                        )}
                    </div>

                    <div className="details-section">
                        <h3>Additional Information</h3>
                        {editMode ? (
                            <>
                                <div className="detail-item">
                                    <label>Supplier:</label>
                                    <input
                                        type="text"
                                        name="supplier"
                                        value={formData.supplier || ''}
                                        onChange={handleInputChange}
                                        className={validationErrors.supplier ? 'error' : '' + 'form-control'}
                                    />
                                    {renderFieldError('supplier')}
                                </div>
                                <div className="detail-item">
                                    <label>Expiry Date:</label>
                                    <input
                                        type="date"
                                        name="expiry_date"
                                        value={formData.expiry_date || ''}
                                        onChange={handleInputChange}
                                        className={validationErrors.expiry_date ? 'error' : '' + 'form-control'}
                                    />
                                    {renderFieldError('expiry_date')}
                                </div>
                                <div className="detail-item">
                                    <label>Notes:</label>
                                    <textarea
                                        name="notes"
                                        value={formData.notes || ''}
                                        onChange={handleInputChange}
                                        rows="3"
                                        className={validationErrors.notes ? 'error' : '' + 'form-control'}
                                    />
                                    {renderFieldError('notes')}
                                </div>
                                <div className="detail-item checkbox-item">
                                    <label className="checkbox-label">
                                        <input
                                            type="checkbox"
                                            name="is_active"
                                            checked={formData.is_active}
                                            onChange={handleInputChange}
                                            className={validationErrors.is_active ? 'error' : '' + 'form-contro'}
                                        />
                                        Active
                                    </label>
                                    {renderFieldError('is_active')}
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="detail-item">
                                    <label>Supplier:</label>
                                    <span>{inventory.supplier || 'Not specified'}</span>
                                </div>
                                <div className="detail-item">
                                    <label>Expiry Date:</label>
                                    <span>{inventory.expiry_date || 'Not set'}</span>
                                </div>
                                <div className="detail-item">
                                    <label>Last Restocked:</label>
                                    <span>{inventory.last_restocked ? new Date(inventory.last_restocked).toLocaleDateString() : 'Never'}</span>
                                </div>
                                <div className="detail-item">
                                    <label>Notes:</label>
                                    <span>{inventory.notes || 'No notes'}</span>
                                </div>
                                <div className="detail-item">
                                    <label>Status:</label>
                                    <span className={`status-badge ${inventory.is_active ? 'active' : 'inactive'}`}>
                                        {inventory.is_active ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                <div className="details-section">
                    <h3>Timestamps</h3>
                    <div className="detail-item">
                        <label>Created At:</label>
                        <span>{new Date(inventory.created_at).toLocaleString()}</span>
                    </div>
                    <div className="detail-item">
                        <label>Updated At:</label>
                        <span>{new Date(inventory.updated_at).toLocaleString()}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SingleInventoryView;