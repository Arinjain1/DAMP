
import { visitsAPI } from '../config/api';

/**
 * Create a site visit with multiple properties
 * This will automatically create a task in the backend
 */
export const createSiteVisit = async (data) => {
  try {
    const { client_id, property_ids, scheduled_date, scheduled_time } = data;

    if (!client_id || !property_ids || property_ids.length === 0) {
      throw new Error('Client and properties are required');
    }

    const response = await visitsAPI.create({
      client_id,
      property_ids,
      scheduled_date,
      scheduled_time
    });

    if (response.data.success) {
      return {
        success: true,
        visitId: response.data.data.id,
        message: 'Site visit scheduled successfully!'
      };
    }
  } catch (error) {
    console.error('Error creating site visit:', error);
    throw error;
  }
};

/**
 * Get site visit details with all properties
 */
export const getSiteVisitDetails = async (visitId) => {
  try {
    const response = await visitsAPI.getById(visitId);

    if (response.data.success) {
      return {
        success: true,
        properties: response.data.data
      };
    }
  } catch (error) {
    console.error('Error fetching site visit:', error);
    throw error;
  }
};

/**
 * Submit feedback for a property in site visit
 */
export const submitPropertyFeedback = async (itemId, outcome, notes) => {
  try {
    const response = await visitsAPI.submitFeedback(itemId, {
      outcome, // 'interested', 'not_interested', 'maybe'
      notes
    });

    if (response.data.success) {
      return {
        success: true,
        message: 'Feedback recorded!',
        data: response.data.data
      };
    }
  } catch (error) {
    console.error('Error submitting feedback:', error);
    throw error;
  }
};

/**
 * Format site visit data for display
 */
export const formatSiteVisitForDisplay = (visitData) => {
  return {
    id: visitData.id,
    scheduledAt: visitData.scheduled_at,
    status: visitData.status,
    properties: visitData.properties?.map(p => ({
      itemId: p.item_id,
      propertyId: p.property_id,
      title: p.title,
      address: p.address,
      price: p.price,
      image: p.cover_image_url,
      visitStatus: p.visit_status,
      outcome: p.outcome,
      ownerName: p.owner_name,
      ownerPhone: p.owner_phone,
      location: p.map_location
    })) || []
  };
};
