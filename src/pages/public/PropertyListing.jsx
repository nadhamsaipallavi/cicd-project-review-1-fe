import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaSearch, FaBed, FaBath, FaRulerCombined, FaMapMarkerAlt, FaFilter, FaRupeeSign } from 'react-icons/fa';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import propertyService from '../../services/propertyService';

const PropertyListing = () => {
  const [properties, setProperties] = useState([]);
  const [filteredProperties, setFilteredProperties] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [error, setError] = useState(null);
  
  // Filter states
  const [filters, setFilters] = useState({
    priceMin: '',
    priceMax: '',
    bedrooms: '',
    bathrooms: '',
    propertyType: '',
    amenities: [],
  });

  useEffect(() => {
    fetchProperties();
  }, [currentPage]);

  const fetchProperties = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // If we have filters applied, use the search endpoint
      if (hasActiveFilters()) {
        const searchParams = {
          page: currentPage,
          size: 10,
          propertyType: filters.propertyType || null,
          maxPrice: filters.priceMax ? parseFloat(filters.priceMax) : null,
          minBedrooms: filters.bedrooms ? parseInt(filters.bedrooms) : null
        };
        
        const response = await propertyService.searchProperties(searchParams);
        setProperties(response.content || []);
        setFilteredProperties(response.content || []);
        setTotalPages(response.totalPages || 0);
      } else {
        // Otherwise just get available properties
        const response = await propertyService.getAllAvailableProperties({
          page: currentPage,
          size: 10
        });
        setProperties(response.content || []);
        setFilteredProperties(response.content || []);
        setTotalPages(response.totalPages || 0);
      }
    } catch (error) {
      console.error('Error fetching properties:', error);
      setError('Failed to load properties. Please try again later.');
      
      // If API is not ready, use sample data
      setProperties(sampleProperties);
      setFilteredProperties(sampleProperties);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (searchTerm) {
      filterPropertiesBySearchTerm();
    } else {
      setFilteredProperties(properties);
    }
  }, [searchTerm, properties]);

  const hasActiveFilters = () => {
    return (
      filters.priceMin ||
      filters.priceMax ||
      filters.bedrooms ||
      filters.bathrooms ||
      filters.propertyType ||
      filters.amenities.length > 0
    );
  };

  const filterPropertiesBySearchTerm = () => {
    const filtered = properties.filter(
      (property) =>
        property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.state.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredProperties(filtered);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value,
    });
  };

  const handleAmenityChange = (amenity) => {
    if (filters.amenities.includes(amenity)) {
      setFilters({
        ...filters,
        amenities: filters.amenities.filter((a) => a !== amenity),
      });
    } else {
      setFilters({
        ...filters,
        amenities: [...filters.amenities, amenity],
      });
    }
  };

  const resetFilters = () => {
    setFilters({
      priceMin: '',
      priceMax: '',
      bedrooms: '',
      bathrooms: '',
      propertyType: '',
      amenities: [],
    });
    setSearchTerm('');
    setCurrentPage(0);
    fetchProperties();
  };

  const applyFilters = () => {
    setCurrentPage(0);
    fetchProperties();
  };

  const handleNextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Sample property data for fallback
  const sampleProperties = [
    {
      id: 1,
      title: 'Luxury Apartment in Downtown',
      description: 'Modern apartment with great views of the city skyline.',
      address: '123 Main St, Downtown, City',
      city: 'New York',
      state: 'NY',
      monthlyRent: 1500,
      numberOfBedrooms: 2,
      numberOfBathrooms: 2,
      totalArea: 1200,
      propertyType: 'APARTMENT',
      amenities: ['Parking', 'Pool', 'Gym', 'Pet Friendly'],
      images: ['https://via.placeholder.com/600x400'],
      available: true,
    },
    // ...other sample properties
  ];

  // Sample amenities list
  const amenitiesList = [
    'Parking',
    'Pool',
    'Gym',
    'Pet Friendly',
    'Laundry',
    'Dishwasher',
    'Air Conditioning',
    'Balcony',
    'Elevator',
    'Furnished',
    'Security System',
    'Internet',
  ];

  // Property type options
  const propertyTypes = [
    { value: '', label: 'All Property Types' },
    { value: 'APARTMENT', label: 'Apartment' },
    { value: 'HOUSE', label: 'House' },
    { value: 'CONDO', label: 'Condo' },
    { value: 'TOWNHOUSE', label: 'Townhouse' },
    { value: 'DUPLEX', label: 'Duplex' },
    { value: 'STUDIO', label: 'Studio' },
  ];

  // Check if there are any additional formatter functions to update
  const formatCurrency = (amount) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  return (
    <div className="property-listing-page">
      <div className="property-listing-header">
        <h1>Find Your Perfect Rental</h1>
        <p>Browse through our wide selection of properties</p>
      </div>

      <div className="search-filter-container">
        <div className="search-bar">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search by location, property name, or description"
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>
        <Button 
          onClick={() => setShowFilters(!showFilters)} 
          variant="secondary"
          className="filter-button"
        >
          <FaFilter /> {showFilters ? 'Hide Filters' : 'Show Filters'}
        </Button>
      </div>

      {showFilters && (
        <div className="filters-container">
          <div className="filter-row">
            <div className="filter-group">
              <label>Property Type</label>
              <select name="propertyType" value={filters.propertyType} onChange={handleFilterChange}>
                {propertyTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Min Bedrooms</label>
              <select name="bedrooms" value={filters.bedrooms} onChange={handleFilterChange}>
                <option value="">Any</option>
                <option value="1">1+</option>
                <option value="2">2+</option>
                <option value="3">3+</option>
                <option value="4">4+</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Min Bathrooms</label>
              <select name="bathrooms" value={filters.bathrooms} onChange={handleFilterChange}>
                <option value="">Any</option>
                <option value="1">1+</option>
                <option value="2">2+</option>
                <option value="3">3+</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Min Price (₹)</label>
              <input
                type="number"
                name="priceMin"
                min="0"
                step="100"
                value={filters.priceMin}
                onChange={handleFilterChange}
                placeholder="Min ₹"
              />
            </div>

            <div className="filter-group">
              <label>Max Price (₹)</label>
              <input
                type="number"
                name="priceMax"
                min="0"
                step="100"
                value={filters.priceMax}
                onChange={handleFilterChange}
                placeholder="Max ₹"
              />
            </div>
          </div>

          <div className="amenities-section">
            <label>Amenities</label>
            <div className="amenities-list">
              {amenitiesList.map((amenity) => (
                <div key={amenity} className="amenity-checkbox">
                  <input
                    type="checkbox"
                    id={`amenity-${amenity}`}
                    checked={filters.amenities.includes(amenity)}
                    onChange={() => handleAmenityChange(amenity)}
                  />
                  <label htmlFor={`amenity-${amenity}`}>{amenity}</label>
                </div>
              ))}
            </div>
          </div>

          <div className="filter-actions">
            <Button onClick={resetFilters} variant="secondary">
              Reset Filters
            </Button>
            <Button onClick={applyFilters} variant="primary">
              Apply Filters
            </Button>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading properties...</p>
        </div>
      ) : error ? (
        <div className="error-container">
          <p>{error}</p>
          <Button onClick={fetchProperties} variant="primary">
            Try Again
          </Button>
        </div>
      ) : filteredProperties.length === 0 ? (
        <div className="no-results">
          <h2>No properties found</h2>
          <p>Try adjusting your filters or search criteria</p>
          <Button onClick={resetFilters} variant="primary">
            Clear Filters
          </Button>
        </div>
      ) : (
        <>
          <div className="property-cards-container">
            {filteredProperties.map((property) => (
              <Card key={property.id} className="property-card">
                <div className="property-image">
                  <img
                    src={property.images && property.images.length > 0 ? property.images[0] : 'https://via.placeholder.com/600x400?text=No+Image'}
                    alt={property.title}
                  />
                </div>
                <div className="property-info">
                  <h3>{property.title}</h3>
                  <p className="property-location">
                    <FaMapMarkerAlt /> {property.address}, {property.city}, {property.state}
                  </p>
                  <div className="property-details">
                    <span>
                      <FaBed /> {property.numberOfBedrooms} bed
                    </span>
                    <span>
                      <FaBath /> {property.numberOfBathrooms} bath
                    </span>
                    <span>
                      <FaRulerCombined /> {property.totalArea} sqft
                    </span>
                  </div>
                  <p className="property-description">{property.description.substring(0, 100)}...</p>
                  <p className="property-price">
                    {formatCurrency(property.monthlyRent)}/month
                  </p>
                  <Link to={`/properties/${property.id}`} className="view-details-link">
                    <Button variant="primary" className="view-details-button">
                      View Details
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="pagination-controls">
              <Button 
                onClick={handlePrevPage} 
                disabled={currentPage === 0}
                variant="secondary"
              >
                Previous
              </Button>
              <span className="page-indicator">
                Page {currentPage + 1} of {totalPages}
              </span>
              <Button
                onClick={handleNextPage}
                disabled={currentPage === totalPages - 1}
                variant="secondary"
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default PropertyListing; 