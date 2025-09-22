import React from 'react';
import './Card.css';

const Card = ({
  children,
  title,
  image,
  imageAlt = 'Card image',
  imagePosition = 'top',
  className = '',
  onClick,
  footer,
  variant = 'default',
  ...props
}) => {
  const handleClick = () => {
    if (onClick) onClick();
  };

  return (
    <div
      className={`custom-card ${variant} ${
        onClick ? 'clickable' : ''
      } ${className}`}
      onClick={handleClick}
      {...props}
    >
      {image && imagePosition === 'top' && (
        <div className="card-image">
          <img
            src={image}
            alt={imageAlt}
          />
        </div>
      )}
      <div className="card-body">
        {title && <h2 className="card-title">{title}</h2>}
        <div className="card-content">{children}</div>
      </div>
      {image && imagePosition === 'bottom' && (
        <div className="card-image bottom">
          <img
            src={image}
            alt={imageAlt}
          />
        </div>
      )}
      {footer && <div className="card-footer">{footer}</div>}
    </div>
  );
};

export default Card;