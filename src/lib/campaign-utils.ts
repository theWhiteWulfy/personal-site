/**
 * Campaign Utilities
 * Helper functions for campaign management and expiration handling
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

export interface CampaignValidationResult {
  isValid: boolean;
  isExpired: boolean;
  isActive: boolean;
  daysRemaining: number;
  campaign?: Campaign;
  redirectUrl?: string;
}

/**
 * Check if a campaign is expired and update its status if needed
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
 * Get all campaigns that need status updates
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
 * Bulk update expired campaigns
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
 * Get campaign analytics summary
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
 * Generate campaign redirect rules for expired campaigns
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
 * Validate campaign data for creation/updates
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
 * Format campaign for API response
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
 * Get campaign urgency level based on days remaining
 */
export function getCampaignUrgency(daysRemaining: number): 'critical' | 'high' | 'medium' | 'low' {
  if (daysRemaining <= 1) return 'critical';
  if (daysRemaining <= 3) return 'high';
  if (daysRemaining <= 7) return 'medium';
  return 'low';
}

/**
 * Generate campaign tracking parameters
 */
export function generateTrackingParams(campaignSlug: string, source?: string): Record<string, string> {
  return {
    utm_campaign: campaignSlug,
    utm_source: source || 'website',
    utm_medium: 'campaign_page',
    utm_content: 'campaign_landing'
  };
}