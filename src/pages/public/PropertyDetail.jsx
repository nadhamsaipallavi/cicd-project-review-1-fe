import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FaBed, FaBath, FaRulerCombined, FaMapMarkerAlt, FaCalendarAlt, FaCheckCircle, FaTimesCircle, FaArrowLeft, FaHeart } from 'react-icons/fa';
import axios from '../../utils/api';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';
import propertyService from '../../services/propertyService';

const PropertyDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [showInquiryModal, setShowInquiryModal] = useState(false);
  const [inquiry, setInquiry] = useState({
    name: user ? `${user.firstName} ${user.lastName}` : '',
    email: user ? user.email : '',
    phone: user ? user.phone : '',
    message: '',
  });
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPropertyDetails();
  }, [id]);

  const fetchPropertyDetails = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await propertyService.getPropertyById(id);
      setProperty(response);
    } catch (error) {
      console.error('Error fetching property details:', error);
      setError('Failed to load property details. Please try again later.');
      
      // Use sample data if API fails
      setProperty(sampleProperty);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setInquiry({
      ...inquiry,
      [name]: value,
    });
  };

  const handleSubmitInquiry = async (e) => {
    e.preventDefault();
    setIsSending(true);

    try {
      // In a real app, this would send the data to the API
      // await axios.post('/api/inquiries', {
      //   propertyId: id,
      //   ...inquiry
      // });

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Your inquiry has been sent! Property owner will contact you soon.');
      setShowInquiryModal(false);
      setInquiry({
        ...inquiry,
        message: '',
      });
    } catch (error) {
      console.error('Error sending inquiry:', error);
      toast.error('Failed to send inquiry. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  // Sample property data
  const sampleProperty = {
    id: 1,
    title: 'Luxury Apartment in Downtown',
    description: `This modern apartment offers breathtaking views of the city skyline. Located in a prime downtown location, this property features high-end finishes throughout, including hardwood floors, granite countertops, and stainless steel appliances.

The open-concept floor plan provides a spacious living area that flows seamlessly into the dining area and kitchen. Large windows allow for abundant natural light and showcase the spectacular city views.

The primary bedroom features a walk-in closet and an en-suite bathroom with a soaking tub and separate shower. The second bedroom is spacious and can also serve as a home office or guest room.

Building amenities include a fitness center, rooftop pool, and 24-hour concierge service. The location offers easy access to restaurants, shopping, and public transportation.`,
    address: '123 Main St, Downtown',
    city: 'New York',
    state: 'NY',
    monthlyRent: 1500,
    securityDeposit: 1500,
    availableFrom: '2023-08-01',
    numberOfBedrooms: 2,
    numberOfBathrooms: 2,
    totalArea: 1200,
    propertyType: 'APARTMENT',
    amenities: ['Parking', 'Pool', 'Gym', 'Pet Friendly', 'Elevator', 'Dishwasher', 'Central AC', 'In-unit Laundry', 'Balcony'],
    images: [
      'https://via.placeholder.com/800x600',
      'https://via.placeholder.com/800x600',
      'https://via.placeholder.com/800x600',
      'https://via.placeholder.com/800x600',
    ],
    available: true,
    landlord: {
      id: 2,
      firstName: 'John',
      lastName: 'Doe',
      email: 'landlord@example.com',
      phone: '(123) 456-7890',
      profileImage: 'https://via.placeholder.com/100'
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="text-center py-16">
        <h1 className="text-2xl font-bold mb-4">Property Not Found</h1>
        <p className="mb-6">The property you're looking for doesn't exist or has been removed.</p>
        <Link to="/properties">
          <Button variant="primary">View All Properties</Button>
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Back button */}
      <Link to="/properties" className="inline-flex items-center mb-6 text-primary hover:underline">
        <FaArrowLeft className="mr-2" /> Back to Properties
      </Link>

      {/* Image gallery */}
      <div className="mb-8">
        <div className="relative overflow-hidden rounded-lg bg-gray-100 h-96 mb-2">
          <img
            src={property.images[activeImageIndex]}
            alt={`${property.title} - Image ${activeImageIndex + 1}`}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="grid grid-cols-5 gap-2">
          {property.images.map((image, index) => (
            <div
              key={index}
              className={`cursor-pointer overflow-hidden rounded-md h-24 ${
                index === activeImageIndex ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => setActiveImageIndex(index)}
            >
              <img src={image} alt={`${property.title} - Thumbnail ${index + 1}`} className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
      </div>

      {/* Property details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main content */}
        <div className="lg:col-span-2">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">{property.title}</h1>
              <div className="flex items-center text-gray-500 mb-4">
                <FaMapMarkerAlt className="mr-2" />
                <span>{property.address}</span>
              </div>
              <div className="flex flex-wrap gap-4 mb-6">
                <div className="flex items-center">
                  <FaBed className="mr-2 text-gray-500" />
                  <span className="font-medium">{property.numberOfBedrooms} Bedrooms</span>
                </div>
                <div className="flex items-center">
                  <FaBath className="mr-2 text-gray-500" />
                  <span className="font-medium">{property.numberOfBathrooms} Bathrooms</span>
                </div>
                <div className="flex items-center">
                  <FaRulerCombined className="mr-2 text-gray-500" />
                  <span className="font-medium">{property.totalArea} sq ft</span>
                </div>
                <div className="flex items-center">
                  <FaCalendarAlt className="mr-2 text-gray-500" />
                  <span className="font-medium">Available {new Date(property.availableFrom).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="flex items-center">
                <span className="font-bold text-3xl text-primary">₹{property.monthlyRent.toLocaleString()}</span>
                <span className="text-gray-500 ml-2">/month</span>
              </div>
            </div>
            <button className="btn btn-circle btn-outline" title="Add to favorites">
              <FaHeart />
            </button>
          </div>

          <div className="divider"></div>

          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4">Description</h2>
            <div className="prose max-w-none">
              <p>{property.description}</p>
            </div>
          </div>

          <div className="divider"></div>
          
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4">Features & Amenities</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {property.amenities.map((amenity, index) => (
                <div key={index} className="flex items-center">
                  <FaCheckCircle className="text-success mr-2" />
                  <span>{amenity}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="divider"></div>

          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4">Property Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-gray-500">Property Type</p>
                <p className="font-medium">{property.propertyType}</p>
              </div>
              <div>
                <p className="text-gray-500">Year Built</p>
                <p className="font-medium">{property.yearBuilt}</p>
              </div>
              <div>
                <p className="text-gray-500">Last Renovated</p>
                <p className="font-medium">{property.lastRenovated}</p>
              </div>
              <div>
                <p className="text-gray-500">Security Deposit</p>
                <p className="font-medium">₹{property.securityDeposit.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-gray-500">Lease Terms</p>
                <p className="font-medium">{property.leaseTerms}</p>
              </div>
              <div>
                <p className="text-gray-500">Pet Policy</p>
                <p className="font-medium">{property.petPolicy}</p>
              </div>
              <div>
                <p className="text-gray-500">Parking</p>
                <p className="font-medium">
                  {property.parkingAvailable ? (
                    <span className="flex items-center">
                      <FaCheckCircle className="text-success mr-2" /> Available
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <FaTimesCircle className="text-error mr-2" /> Not available
                    </span>
                  )}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Appliances Included</p>
                <p className="font-medium">{property.appliancesIncluded}</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-gray-500">Utilities Included</p>
                <p className="font-medium">{property.utilitiesIncluded}</p>
              </div>
            </div>
          </div>

          <div className="divider"></div>

          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4">Location</h2>
            <div className="w-full h-64 bg-gray-200 rounded-lg mb-4">
              {/* Google Maps or other map integration would go here */}
              <div className="flex justify-center items-center h-full text-gray-500">
                Map view would be integrated here
              </div>
            </div>
            <p className="text-gray-500">{property.address}</p>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="card bg-base-100 shadow-xl mb-6 sticky top-8">
            <div className="card-body">
              <h2 className="card-title mb-4">Contact Property Manager</h2>
              
              <div className="mb-6">
                <h3 className="font-bold">{property.landlord.firstName} {property.landlord.lastName}</h3>
                <div className="flex flex-col gap-2 mt-2">
                  <div className="flex items-center">
                    <span className="text-gray-500 min-w-[120px]">Response Rate:</span>
                    <span>{property.landlord.responseRate}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-gray-500 min-w-[120px]">Response Time:</span>
                    <span>{property.landlord.responseTime}</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <Button
                  variant="primary"
                  className="w-full"
                  onClick={() => setShowInquiryModal(true)}
                >
                  Request Information
                </Button>
                
                {user && user.role === 'TENANT' && (
                  <Button
                    variant="secondary"
                    className="w-full"
                    onClick={() => navigate(`/tenant/application/new?propertyId=${property.id}`)}
                  >
                    Apply for this Property
                  </Button>
                )}
                
                <div className="divider my-4">OR</div>
                
                <a href={`tel:${property.landlord.phone}`} className="btn btn-outline w-full">
                  Call {property.landlord.phone}
                </a>
                
                <a href={`mailto:${property.landlord.email}`} className="btn btn-outline w-full">
                  Email Property Manager
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Inquiry Modal */}
      <Modal
        isOpen={showInquiryModal}
        onClose={() => setShowInquiryModal(false)}
        title="Request Information"
        size="md"
      >
        <form onSubmit={handleSubmitInquiry}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text">Name</span>
              </label>
              <input
                type="text"
                name="name"
                value={inquiry.name}
                onChange={handleInputChange}
                className="input input-bordered w-full"
                required
              />
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Phone</span>
              </label>
              <input
                type="tel"
                name="phone"
                value={inquiry.phone}
                onChange={handleInputChange}
                className="input input-bordered w-full"
                required
              />
            </div>
          </div>
          <div className="form-control mb-4">
            <label className="label">
              <span className="label-text">Email</span>
            </label>
            <input
              type="email"
              name="email"
              value={inquiry.email}
              onChange={handleInputChange}
              className="input input-bordered w-full"
              required
            />
          </div>
          <div className="form-control mb-6">
            <label className="label">
              <span className="label-text">Message</span>
            </label>
            <textarea
              name="message"
              value={inquiry.message}
              onChange={handleInputChange}
              className="textarea textarea-bordered h-32"
              placeholder={`Hi, I'm interested in this property. I would like to schedule a viewing. Is this property still available?`}
              required
            ></textarea>
          </div>
          
          <div className="modal-action">
            <Button variant="ghost" onClick={() => setShowInquiryModal(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={isSending}>
              {isSending ? (
                <>
                  <span className="loading loading-spinner loading-sm mr-2"></span>
                  Sending...
                </>
              ) : (
                'Send Message'
              )}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default PropertyDetail; 