import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FaSearch, FaMapMarkerAlt, FaBuilding, FaBed, 
  FaBath, FaRulerCombined, FaRupeeSign, FaList,
  FaSort, FaSortAmountDown, FaSortAmountUp
} from 'react-icons/fa';
import propertyService from '../../services/propertyService';
import './BrowseProperties.css';

const BrowseProperties = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  
  // Filters and sorting
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    city: '',
    propertyType: '',
    minBedrooms: '',
    maxPrice: ''
  });
  const [sort, setSort] = useState({
    field: 'monthlyRent',
    direction: 'asc'
  });
  
  // For mobile filter visibility
  const [showFilters, setShowFilters] = useState(false);
  
  const pageSize = 9;
  
  useEffect(() => {
    fetchProperties();
  }, [page, searchTerm, filters, sort]);
  
  const fetchProperties = async () => {
    try {
      setLoading(true);
      setError('');
      
      const data = await propertyService.getAllAvailableProperties({
        page,
        size: pageSize,
        search: searchTerm,
        ...filters,
        sortBy: sort.field,
        sortDirection: sort.direction
      });
      
      setProperties(data.content || []);
      setTotalPages(data.totalPages || 0);
    } catch (err) {
      console.error('Error fetching properties:', err);
      setError('Failed to load properties. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setPage(0); // Reset to first page when search changes
  };
  
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
    setPage(0); // Reset to first page when filters change
  };
  
  const handleSortChange = (field) => {
    setSort(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
    setPage(0); // Reset to first page when sort changes
  };
  
  const clearFilters = () => {
    setFilters({
      city: '',
      propertyType: '',
      minBedrooms: '',
      maxPrice: ''
    });
    setSearchTerm('');
    setPage(0);
  };
  
  const toggleFilters = () => {
    setShowFilters(prev => !prev);
  };
  
  const propertyTypes = propertyService.getPropertyTypes();
  
  const formatCurrency = (amount) => {
    return `₹${amount.toLocaleString()}`;
  };
  
  const getSortIcon = (field) => {
    if (sort.field !== field) {
      return <FaSort className="sort-icon" />;
    }
    return sort.direction === 'asc' 
      ? <FaSortAmountUp className="sort-icon active" /> 
      : <FaSortAmountDown className="sort-icon active" />;
  };
  
  return (
    <div className="browse-properties-container">
      <div className="browse-header">
        <h1>Available Properties</h1>
        <p>Find your perfect home from our selection of available properties</p>
      </div>
      
      <div className="search-and-filter">
        <div className="search-bar">
          <div className="search-input-container">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search by property title or address..."
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>
          
          <button className="filter-toggle" onClick={toggleFilters}>
            Filters {showFilters ? '▲' : '▼'}
          </button>
        </div>
        
        <div className={`filters-container ${showFilters ? 'show' : ''}`}>
          <div className="filter-group">
            <label htmlFor="city">City</label>
            <input
              id="city"
              name="city"
              type="text"
              placeholder="Any city"
              value={filters.city}
              onChange={handleFilterChange}
            />
          </div>
          
          <div className="filter-group">
            <label htmlFor="propertyType">Property Type</label>
            <select
              id="propertyType"
              name="propertyType"
              value={filters.propertyType}
              onChange={handleFilterChange}
            >
              <option value="">Any type</option>
              {propertyTypes.map(type => (
                <option key={type} value={type}>
                  {type.replace('_', ' ').toLowerCase()}
                </option>
              ))}
            </select>
          </div>
          
          <div className="filter-group">
            <label htmlFor="minBedrooms">Min Bedrooms</label>
            <select
              id="minBedrooms"
              name="minBedrooms"
              value={filters.minBedrooms}
              onChange={handleFilterChange}
            >
              <option value="">Any</option>
              <option value="1">1+</option>
              <option value="2">2+</option>
              <option value="3">3+</option>
              <option value="4">4+</option>
            </select>
          </div>
          
          <div className="filter-group">
            <label htmlFor="maxPrice">Max Price</label>
            <input
              id="maxPrice"
              name="maxPrice"
              type="number"
              placeholder="No limit"
              value={filters.maxPrice}
              onChange={handleFilterChange}
            />
          </div>
          
          <button className="clear-filters" onClick={clearFilters}>
            Clear All
          </button>
        </div>
      </div>
      
      <div className="sort-controls">
        <span>Sort by:</span>
        <button 
          className={`sort-button ${sort.field === 'monthlyRent' ? 'active' : ''}`}
          onClick={() => handleSortChange('monthlyRent')}
        >
          Price {getSortIcon('monthlyRent')}
        </button>
        <button 
          className={`sort-button ${sort.field === 'availableFrom' ? 'active' : ''}`}
          onClick={() => handleSortChange('availableFrom')}
        >
          Date Available {getSortIcon('availableFrom')}
        </button>
        <button 
          className={`sort-button ${sort.field === 'totalArea' ? 'active' : ''}`}
          onClick={() => handleSortChange('totalArea')}
        >
          Size {getSortIcon('totalArea')}
        </button>
      </div>
      
      {loading ? (
        <div className="loading-indicator">Loading properties...</div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : properties.length === 0 ? (
        <div className="no-properties">
          <h2>No properties found</h2>
          <p>Try adjusting your search criteria or check back later for new listings.</p>
        </div>
      ) : (
        <>
          <div className="properties-grid">
            {properties.map(property => (
              <div key={property.id} className="property-card">
                <div className="property-image">
                  {property.images && property.images.length > 0 ? (
                    <img src={property.images[0]} alt={property.title} />
                  ) : (
                    <div className="placeholder-image">
                      <FaBuilding />
                    </div>
                  )}
                </div>
                <div className="property-content">
                  <h2 className="property-title">{property.title}</h2>
                  <div className="property-location">
                    <FaMapMarkerAlt />
                    <span>{property.city}, {property.state}</span>
                  </div>
                  <div className="property-details">
                    {property.numberOfBedrooms && (
                      <div className="detail-item">
                        <FaBed />
                        <span>{property.numberOfBedrooms} {property.numberOfBedrooms === 1 ? 'Bed' : 'Beds'}</span>
                      </div>
                    )}
                    {property.numberOfBathrooms && (
                      <div className="detail-item">
                        <FaBath />
                        <span>{property.numberOfBathrooms} {property.numberOfBathrooms === 1 ? 'Bath' : 'Baths'}</span>
                      </div>
                    )}
                    {property.totalArea && (
                      <div className="detail-item">
                        <FaRulerCombined />
                        <span>{property.totalArea} sq.ft</span>
                      </div>
                    )}
                  </div>
                  {property.availableFrom && (
                    <div className="available-from">
                      Available from: {new Date(property.availableFrom).toLocaleDateString()}
                    </div>
                  )}
                  <div className="property-price">
                    <span>{formatCurrency(property.monthlyRent)}/month</span>
                  </div>
                  <Link to={`/properties/${property.id}`} className="view-property-btn">
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
          
          {totalPages > 1 && (
            <div className="pagination">
              <button 
                className="pagination-btn" 
                disabled={page === 0}
                onClick={() => setPage(prev => prev - 1)}
              >
                Previous
              </button>
              <span className="page-info">
                Page {page + 1} of {totalPages}
              </span>
              <button 
                className="pagination-btn" 
                disabled={page >= totalPages - 1}
                onClick={() => setPage(prev => prev + 1)}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default BrowseProperties; 