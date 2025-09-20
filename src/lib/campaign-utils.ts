/**
 * Campaign Utilities
 * Helper functions for campaign management and expiration handling
 */

/**
 * Interface for a campaign object.
 * @property {number} id - The unique identifier for the campaign.
 * @property {string} slug - The URL-friendly slug for the campaign.
 * @property {string} title - The title of the campaign.
 * @property {string} [description] - A description of the campaign.
 * @property {string} start_date - The start date of the campaign in ISO format.
 * @property {string} [end_date] - The end date of the campaign in ISO format.
 * @property {'active' | 'paused' | 'expired'} status - The status of the campaign.
 * @property {string} created_at - The creation date of the campaign in ISO format.
 * @property {string} updated_at - The last update date of the campaign in ISO format.
 */
export interface Campaign {
  id: number;
  slug: string;
  title: string;
  description?: string;
  start_date: string;
  end_date?: string;
  status: 'active' | 'paused' | 'expired';
  created_at: string;
  updated_at: string;
}

/**
 * Interface for the result of a campaign validation check.
 * @property {boolean} isValid - Whether the campaign is valid.
 * @property {boolean} isExpired - Whether the campaign is expired.
 * @property {boolean} isActive - Whether the campaign is currently active.
 * @property {number} daysRemaining - The number of days remaining for the campaign.
 * @property {Campaign} [campaign] - The campaign object if it is valid.
 * @property {string} [redirectUrl] - The URL to redirect to if the campaign is not valid.
 */
export interface CampaignValidationResult {
  isValid: boolean;
  isExpired: boolean;
  isActive: boolean;
  daysRemaining: number;
  campaign?: Campaign;
  redirectUrl?: string;
}

/**
 * Checks if a campaign is expired and updates its status in the database if necessary.
 * @param {any} DB - The database connection object.
 * @param {string} campaignSlug - The slug of the campaign to validate.
 * @returns {Promise<CampaignValidationResult>} A promise that resolves to an object containing the validation result.
 */
export async function validateCampaignStatus(
  DB: any, 
  campaignSlug: string
): Promise<CampaignValidationResult> {
  try {
    // Get campaign from database
    const campaign = await DB.prepare('SELECT * FROM campaigns WHERE slug = ?1')
      .bind(campaignSlug)
      .first();

    if (!campaign) {
      return {
        isValid: false,
        isExpired: false,
        isActive: false,
        daysRemaining: 0,
        redirectUrl: '/404'
      };
    }

    const now = new Date();
    const startDate = new Date(campaign.start_date);
    const endDate = campaign.end_date ? new Date(campaign.end_date) : null;
    
    // Check if campaign has started
    const hasStarted = now >= startDate;
    
    // Check if campaign is expired
    const isExpired = endDate ? now > endDate : false;
    
    // Calculate days remaining
    const daysRemaining = endDate 
      ? Math.max(0, Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
      : Infinity;

    // Determine if campaign is currently active
    const isCurrentlyActive = hasStarted && !isExpired && campaign.status === 'active';

    // Auto-update expired campaigns
    if (isExpired && campaign.status === 'active') {
      try {
        await DB.prepare('UPDATE campaigns SET status = "expired", updated_at = CURRENT_TIMESTAMP WHERE id = ?1')
          .bind(campaign.id)
          .run();
        
        campaign.status = 'expired';
        campaign.updated_at = now.toISOString();
        
        console.log(`Campaign ${campaignSlug} automatically updated to expired status`);
      } catch (error) {
        console.error('Error updating expired campaign status:', error);
      }
    }

    // Determine redirect URL for invalid campaigns
    let redirectUrl: string | undefined;
    if (!isCurrentlyActive) {
      if (isExpired || campaign.status === 'expired') {
        redirectUrl = `/offers/expired?campaign=${encodeURIComponent(campaignSlug)}&title=${encodeURIComponent(campaign.title)}`;
      } else if (campaign.status === 'paused') {
        redirectUrl = `/offers/expired?campaign=${encodeURIComponent(campaignSlug)}&title=${encodeURIComponent(campaign.title)}&reason=paused`;
      } else if (!hasStarted) {
        redirectUrl = `/offers/expired?campaign=${encodeURIComponent(campaignSlug)}&title=${encodeURIComponent(campaign.title)}&reason=not_started`;
      }
    }

    return {
      isValid: true,
      isExpired,
      isActive: isCurrentlyActive,
      daysRemaining: typeof daysRemaining === 'number' ? daysRemaining : 0,
      campaign,
      redirectUrl
    };

  } catch (error) {
    console.error('Error validating campaign status:', error);
    return {
      isValid: false,
      isExpired: false,
      isActive: false,
      daysRemaining: 0,
      redirectUrl: '/404'
    };
  }
}

/**
 * Retrieves all active campaigns that have expired but have not yet been updated in the database.
 * @param {any} DB - The database connection object.
 * @returns {Promise<Campaign[]>} A promise that resolves to an array of expired campaign objects.
 */
export async function getExpiredCampaigns(DB: any): Promise<Campaign[]> {
  try {
    const now = new Date().toISOString();
    
    const query = `
      SELECT * FROM campaigns 
      WHERE status = 'active' 
        AND end_date IS NOT NULL 
        AND end_date < ?1
      ORDER BY end_date DESC
    `;
    
    const result = await DB.prepare(query).bind(now).all();
    return result.results || [];
  } catch (error) {
    console.error('Error getting expired campaigns:', error);
    return [];
  }
}

/**
 * Bulk updates the status of all expired campaigns to "expired".
 * @param {any} DB - The database connection object.
 * @returns {Promise<number>} A promise that resolves to the number of campaigns that were updated.
 */
export async function updateExpiredCampaigns(DB: any): Promise<number> {
  try {
    const now = new Date().toISOString();
    
    const updateQuery = `
      UPDATE campaigns 
      SET status = 'expired', updated_at = CURRENT_TIMESTAMP 
      WHERE status = 'active' 
        AND end_date IS NOT NULL 
        AND end_date < ?1
    `;
    
    const result = await DB.prepare(updateQuery).bind(now).run();
    const updatedCount = result.changes || 0;
    
    if (updatedCount > 0) {
      console.log(`Updated ${updatedCount} expired campaigns`);
    }
    
    return updatedCount;
  } catch (error) {
    console.error('Error updating expired campaigns:', error);
    return 0;
  }
}

/**
 * Retrieves a summary of analytics for a given campaign.
 * @param {any} DB - The database connection object.
 * @param {string} campaignSlug - The slug of the campaign to get a summary for.
 * @returns {Promise<any>} A promise that resolves to an object containing the campaign summary, or null if the campaign is not found.
 */
export async function getCampaignSummary(DB: any, campaignSlug: string): Promise<any> {
  try {
    // Get campaign basic info
    const campaign = await DB.prepare('SELECT * FROM campaigns WHERE slug = ?1')
      .bind(campaignSlug)
      .first();

    if (!campaign) {
      return null;
    }

    // Get visit statistics
    const statsQuery = `
      SELECT 
        COUNT(*) as total_visits,
        COUNT(DISTINCT COALESCE(user_id, ip_address)) as unique_visitors,
        COUNT(CASE WHEN conversion_type != 'page_view' THEN 1 END) as conversions,
        MAX(visit_timestamp) as last_visit,
        MIN(visit_timestamp) as first_visit
      FROM campaign_visits 
      WHERE campaign_id = ?1
    `;
    
    const stats = await DB.prepare(statsQuery).bind(campaign.id).first();

    // Get UTM source breakdown
    const utmQuery = `
      SELECT 
        COALESCE(utm_source, 'direct') as source,
        COUNT(*) as visits,
        COUNT(CASE WHEN conversion_type != 'page_view' THEN 1 END) as conversions
      FROM campaign_visits 
      WHERE campaign_id = ?1
      GROUP BY utm_source
      ORDER BY visits DESC
      LIMIT 10
    `;
    
    const utmResult = await DB.prepare(utmQuery).bind(campaign.id).all();
    const utmBreakdown = utmResult.results || [];

    return {
      campaign,
      stats: {
        total_visits: stats?.total_visits || 0,
        unique_visitors: stats?.unique_visitors || 0,
        conversions: stats?.conversions || 0,
        conversion_rate: stats?.total_visits > 0 
          ? Math.round((stats.conversions / stats.total_visits) * 10000) / 100 
          : 0,
        first_visit: stats?.first_visit,
        last_visit: stats?.last_visit
      },
      utm_breakdown: utmBreakdown
    };

  } catch (error) {
    console.error('Error getting campaign summary:', error);
    return null;
  }
}

/**
 * Generates an array of redirect rules for all expired campaigns.
 * @param {any} DB - The database connection object.
 * @returns {Promise<string[]>} A promise that resolves to an array of redirect rules.
 */
export async function generateCampaignRedirects(DB: any): Promise<string[]> {
  try {
    const expiredCampaigns = await DB.prepare(`
      SELECT slug, title FROM campaigns 
      WHERE status = 'expired'
      ORDER BY updated_at DESC
    `).all();

    const redirectRules: string[] = [];
    
    (expiredCampaigns.results || []).forEach((campaign: any) => {
      const rule = `/offers/${campaign.slug} /offers/expired?campaign=${encodeURIComponent(campaign.slug)}&title=${encodeURIComponent(campaign.title)} 301`;
      redirectRules.push(rule);
    });

    return redirectRules;
  } catch (error) {
    console.error('Error generating campaign redirects:', error);
    return [];
  }
}

/**
 * Validates campaign data for creation or updates.
 * @param {Partial<Campaign>} data - The campaign data to validate.
 * @returns {{isValid: boolean; errors: string[]}} An object containing a boolean indicating if the data is valid and an array of error messages.
 */
export function validateCampaignData(data: Partial<Campaign>): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Required fields
  if (!data.slug || data.slug.trim().length === 0) {
    errors.push('Campaign slug is required');
  } else if (!/^[a-z0-9-]+$/.test(data.slug)) {
    errors.push('Campaign slug must contain only lowercase letters, numbers, and hyphens');
  }

  if (!data.title || data.title.trim().length === 0) {
    errors.push('Campaign title is required');
  } else if (data.title.length > 200) {
    errors.push('Campaign title must be 200 characters or less');
  }

  if (data.description && data.description.length > 1000) {
    errors.push('Campaign description must be 1000 characters or less');
  }

  if (!data.start_date) {
    errors.push('Start date is required');
  } else {
    const startDate = new Date(data.start_date);
    if (isNaN(startDate.getTime())) {
      errors.push('Invalid start date format');
    }
  }

  if (data.end_date) {
    const endDate = new Date(data.end_date);
    if (isNaN(endDate.getTime())) {
      errors.push('Invalid end date format');
    } else if (data.start_date) {
      const startDate = new Date(data.start_date);
      if (endDate <= startDate) {
        errors.push('End date must be after start date');
      }
    }
  }

  if (!data.status || !['active', 'paused', 'expired'].includes(data.status)) {
    errors.push('Valid status is required (active, paused, or expired)');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Formats a campaign object for an API response.
 * @param {any} campaign - The campaign object to format.
 * @returns {Campaign} The formatted campaign object.
 */
export function formatCampaignResponse(campaign: any): Campaign {
  return {
    id: campaign.id,
    slug: campaign.slug,
    title: campaign.title,
    description: campaign.description || undefined,
    start_date: campaign.start_date,
    end_date: campaign.end_date || undefined,
    status: campaign.status,
    created_at: campaign.created_at,
    updated_at: campaign.updated_at
  };
}

/**
 * Determines the urgency level of a campaign based on the number of days remaining.
 * @param {number} daysRemaining - The number of days remaining for the campaign.
 * @returns {'critical' | 'high' | 'medium' | 'low'} The urgency level.
 */
export function getCampaignUrgency(daysRemaining: number): 'critical' | 'high' | 'medium' | 'low' {
  if (daysRemaining <= 1) return 'critical';
  if (daysRemaining <= 3) return 'high';
  if (daysRemaining <= 7) return 'medium';
  return 'low';
}

/**
 * Generates a record of UTM tracking parameters for a campaign.
 * @param {string} campaignSlug - The slug of the campaign.
 * @param {string} [source] - The source of the campaign traffic.
 * @returns {Record<string, string>} A record of UTM tracking parameters.
 */
export function generateTrackingParams(campaignSlug: string, source?: string): Record<string, string> {
  return {
    utm_campaign: campaignSlug,
    utm_source: source || 'website',
    utm_medium: 'campaign_page',
    utm_content: 'campaign_landing'
  };
}