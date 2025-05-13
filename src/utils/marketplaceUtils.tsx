import {ListingType, MarketplaceItem,} from '@/redux/features/marketplace/marketplaceApi';

/**
 * Check if a marketplace item is a course
 */
export const isCourse = (item: MarketplaceItem): boolean => {
  return item.type === ListingType.COURSE;
};

/**
 * Check if a marketplace item is an online course
 */
export const isOnlineCourse = (item: MarketplaceItem): boolean => {
  return item.type === ListingType.ONLINE_COURSE;
};

/**
 * Get the appropriate display information for a marketplace item based on its type
 */
export const getListingTypeInfo = (item: MarketplaceItem) => {
  if (isCourse(item)) {
    return {
      icon: '📚', // You can use any icon library you prefer
      label: 'Static Course',
      description: 'Self-paced course with static content',
      contentInfo:
        item.contentDescription || 'Course materials available after purchase',
    };
  } else if (isOnlineCourse(item)) {
    return {
      icon: '🎓', // You can use any icon library you prefer
      label: 'Interactive Course',
      description: 'Live/interactive sessions with instructor',
      dateInfo:
        item.startDate && item.endDate
          ? `${new Date(item.startDate).toLocaleDateString()} - ${new Date(
              item.endDate
            ).toLocaleDateString()}`
          : 'Dates to be announced',
      locationInfo: item.location || 'Online',
      studentsInfo: item.maxStudents
        ? `Limited to ${item.maxStudents} students`
        : 'Unlimited students',
    };
  }

  // Default fallback
  return {
    icon: '📝',
    label: 'Listing',
    description: 'Skill listing',
  };
};

/**
 * Render the appropriate content for a marketplace item based on its type
 */
export const renderListingContent = (item: MarketplaceItem) => {
  if (isCourse(item)) {
    return {
      mainContent: (
        <>
          <h3>Course Content</h3>
          <p>{item.contentDescription}</p>
          {item.contentUrls && item.contentUrls.length > 0 && (
            <div className="content-preview">
              <h4>Content Preview</h4>
              <ul>
                {item.contentUrls.map((url, index) => (
                  <li key={index}>
                    <a href={url} target="_blank" rel="noopener noreferrer">
                      {getFileNameFromUrl(url)}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      ),
    };
  } else if (isOnlineCourse(item)) {
    return {
      mainContent: (
        <>
          <h3>Course Details</h3>
          <div className="course-details">
            {item.location && (
              <div className="detail-item">
                <span className="label">Location:</span>
                <span>{item.location}</span>
              </div>
            )}
            {item.startDate && (
              <div className="detail-item">
                <span className="label">Start Date:</span>
                <span>{new Date(item.startDate).toLocaleDateString()}</span>
              </div>
            )}
            {item.endDate && (
              <div className="detail-item">
                <span className="label">End Date:</span>
                <span>{new Date(item.endDate).toLocaleDateString()}</span>
              </div>
            )}
            {item.maxStudents && (
              <div className="detail-item">
                <span className="label">Maximum Students:</span>
                <span>{item.maxStudents}</span>
              </div>
            )}
            {item.durationHours && (
              <div className="detail-item">
                <span className="label">Duration:</span>
                <span>{item.durationHours} hours</span>
              </div>
            )}
          </div>
          {item.materials && item.materials.length > 0 && (
            <div className="materials">
              <h4>Course Materials</h4>
              <ul>
                {item.materials.map((url, index) => (
                  <li key={index}>
                    <a href={url} target="_blank" rel="noopener noreferrer">
                      {getFileNameFromUrl(url)}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      ),
    };
  }

  // Default fallback
  return {
    mainContent: (
      <>
        <h3>Listing Details</h3>
        <p>{item.description}</p>
      </>
    ),
  };
};

/**
 * Helper function to extract file name from URL
 */
const getFileNameFromUrl = (url: string): string => {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    const segments = pathname.split('/');
    return segments[segments.length - 1];
  } catch (error) {
    // If URL parsing fails, just return the original URL
    return url;
  }
};
