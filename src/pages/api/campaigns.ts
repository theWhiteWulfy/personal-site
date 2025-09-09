export const prerender = false;

import type { APIRoute, APIContext } from 'astro';

interface CampaignData {
  id?: number;
  slug: string;
  title: string;
  description?: string;
  start_date: string;
  end_date?: string;
  status: 'active' | 'paused' | 'expired';
  created_at?: string;
  updated_at?: string;
}

interface CampaignAnalytics {
  total_visits: number;
  unique_visitors: number;
  conversions: number;
  conversion_rate: number;
  top_utm_sources: Array<{ source: string; count: number }>;
  daily_visits: Array<{ date: string; visits: number; conversions: number }>;
}

/**
 * GET /api/campaigns - Retrieve campaigns with optional filtering and analytics
 * Query parameters:
 * - status: Filter by campaign status (active, paused, expired)
 * - include_analytics: Include analytics data (true/false)
 * - slug: Get specific campaign by slug
 * - limit: Number of results to return (default: 50)
 * - offset: Pagination offset (default: 0)
 */
export const GET: APIRoute = async ({ url, locals }: APIContext) => {
  try {
    // Check if database is available
    if (!locals?.runtime?.env?.DB) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Database not configured' 
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const { DB } = locals.runtime.env;
    const searchParams = new URL(url).searchParams;
    
    const status = searchParams.get('status');
    const includeAnalytics = searchParams.get('include_analytics') === 'true';
    const slug = searchParams.get('slug');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build base query
    let query = 'SELECT * FROM campaigns WHERE 1=1';
    const params: any[] = [];
    let paramIndex = 1;

    // Add filters
    if (status && ['active', 'paused', 'expired'].includes(status)) {
      query += ` AND status = ?${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    if (slug) {
      query += ` AND slug = ?${paramIndex}`;
      params.push(slug);
      paramIndex++;
    }

    // Add ordering and pagination
    query += ` ORDER BY created_at DESC LIMIT ?${paramIndex} OFFSET ?${paramIndex + 1}`;
    params.push(limit, offset);

    // Execute query
    const result = await DB.prepare(query).bind(...params).all();
    const campaigns = result.results || [];

    // Get total count for pagination
    let countQuery = 'SELECT COUNT(*) as total FROM campaigns WHERE 1=1';
    const countParams: any[] = [];
    let countParamIndex = 1;

    if (status && ['active', 'paused', 'expired'].includes(status)) {
      countQuery += ` AND status = ?${countParamIndex}`;
      countParams.push(status);
      countParamIndex++;
    }

    if (slug) {
      countQuery += ` AND slug = ?${countParamIndex}`;
      countParams.push(slug);
      countParamIndex++;
    }

    const countResult = await DB.prepare(countQuery).bind(...countParams).first();
    const total = (countResult?.total as number) || 0;

    // Add analytics data if requested
    let campaignsWithAnalytics = campaigns;
    if (includeAnalytics) {
      campaignsWithAnalytics = await Promise.all(
        campaigns.map(async (campaign: any) => {
          const analytics = await getCampaignAnalytics(DB, campaign.id);
          return { ...campaign, analytics };
        })
      );
    }

    // Check for expired campaigns and update status
    const now = new Date();
    const updatedCampaigns = await Promise.all(
      campaignsWithAnalytics.map(async (campaign: any) => {
        const endDate = campaign.end_date ? new Date(campaign.end_date) : null;
        const isExpired = endDate && now > endDate;
        
        // Auto-update expired campaigns
        if (isExpired && campaign.status === 'active') {
          try {
            await DB.prepare('UPDATE campaigns SET status = "expired", updated_at = CURRENT_TIMESTAMP WHERE id = ?1')
              .bind(campaign.id)
              .run();
            campaign.status = 'expired';
            campaign.updated_at = now.toISOString();
          } catch (error) {
            console.error('Error updating expired campaign:', error);
          }
        }

        return campaign;
      })
    );

    return new Response(JSON.stringify({ 
      success: true,
      data: updatedCampaigns,
      pagination: {
        total,
        limit,
        offset,
        has_more: (offset + limit) < total
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error retrieving campaigns:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Error retrieving campaigns' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

/**
 * POST /api/campaigns - Create a new campaign
 */
export const POST: APIRoute = async ({ request, locals }: APIContext) => {
  try {
    // Check if database is available
    if (!locals?.runtime?.env?.DB) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Database not configured' 
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const { DB } = locals.runtime.env;
    const campaignData: CampaignData = await request.json();

    // Validate required fields
    const errors: string[] = [];
    
    if (!campaignData.slug || campaignData.slug.trim().length === 0) {
      errors.push('Campaign slug is required');
    }
    
    if (!campaignData.title || campaignData.title.trim().length === 0) {
      errors.push('Campaign title is required');
    }
    
    if (!campaignData.start_date) {
      errors.push('Start date is required');
    }
    
    if (!campaignData.status || !['active', 'paused', 'expired'].includes(campaignData.status)) {
      errors.push('Valid status is required (active, paused, or expired)');
    }

    // Validate dates
    if (campaignData.start_date) {
      const startDate = new Date(campaignData.start_date);
      if (isNaN(startDate.getTime())) {
        errors.push('Invalid start date format');
      }
    }

    if (campaignData.end_date) {
      const endDate = new Date(campaignData.end_date);
      if (isNaN(endDate.getTime())) {
        errors.push('Invalid end date format');
      } else if (campaignData.start_date) {
        const startDate = new Date(campaignData.start_date);
        if (endDate <= startDate) {
          errors.push('End date must be after start date');
        }
      }
    }

    if (errors.length > 0) {
      return new Response(JSON.stringify({ 
        success: false, 
        errors,
        message: 'Validation failed' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Check for duplicate slug
    const existingCampaign = await DB.prepare('SELECT id FROM campaigns WHERE slug = ?1')
      .bind(campaignData.slug.trim())
      .first();

    if (existingCampaign) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Campaign with this slug already exists' 
      }), {
        status: 409,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Insert new campaign
    const insertQuery = `
      INSERT INTO campaigns (slug, title, description, start_date, end_date, status, created_at, updated_at)
      VALUES (?1, ?2, ?3, ?4, ?5, ?6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `;

    const result = await DB.prepare(insertQuery).bind(
      campaignData.slug.trim(),
      campaignData.title.trim(),
      campaignData.description?.trim() || null,
      campaignData.start_date,
      campaignData.end_date || null,
      campaignData.status
    ).run();

    if (result.success) {
      // Retrieve the created campaign
      const newCampaign = await DB.prepare('SELECT * FROM campaigns WHERE id = ?1')
        .bind(result.meta.last_row_id)
        .first();

      return new Response(JSON.stringify({ 
        success: true,
        data: newCampaign,
        message: 'Campaign created successfully' 
      }), {
        status: 201,
        headers: { 'Content-Type': 'application/json' }
      });
    } else {
      throw new Error('Database insert failed');
    }

  } catch (error) {
    console.error('Error creating campaign:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Error creating campaign' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

/**
 * PUT /api/campaigns - Update an existing campaign
 */
export const PUT: APIRoute = async ({ request, locals }: APIContext) => {
  try {
    // Check if database is available
    if (!locals?.runtime?.env?.DB) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Database not configured' 
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const { DB } = locals.runtime.env;
    const campaignData: CampaignData = await request.json();

    // Validate required fields
    if (!campaignData.id) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Campaign ID is required for updates' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Check if campaign exists
    const existingCampaign = await DB.prepare('SELECT * FROM campaigns WHERE id = ?1')
      .bind(campaignData.id)
      .first();

    if (!existingCampaign) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Campaign not found' 
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Build update query dynamically based on provided fields
    const updateFields: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (campaignData.slug && campaignData.slug.trim() !== existingCampaign.slug) {
      // Check for duplicate slug
      const duplicateSlug = await DB.prepare('SELECT id FROM campaigns WHERE slug = ?1 AND id != ?2')
        .bind(campaignData.slug.trim(), campaignData.id)
        .first();

      if (duplicateSlug) {
        return new Response(JSON.stringify({ 
          success: false, 
          error: 'Campaign with this slug already exists' 
        }), {
          status: 409,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      updateFields.push(`slug = ?${paramIndex}`);
      params.push(campaignData.slug.trim());
      paramIndex++;
    }

    if (campaignData.title && campaignData.title.trim() !== existingCampaign.title) {
      updateFields.push(`title = ?${paramIndex}`);
      params.push(campaignData.title.trim());
      paramIndex++;
    }

    if (campaignData.description !== undefined && campaignData.description !== existingCampaign.description) {
      updateFields.push(`description = ?${paramIndex}`);
      params.push(campaignData.description?.trim() || null);
      paramIndex++;
    }

    if (campaignData.start_date && campaignData.start_date !== existingCampaign.start_date) {
      const startDate = new Date(campaignData.start_date);
      if (isNaN(startDate.getTime())) {
        return new Response(JSON.stringify({ 
          success: false, 
          error: 'Invalid start date format' 
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      updateFields.push(`start_date = ?${paramIndex}`);
      params.push(campaignData.start_date);
      paramIndex++;
    }

    if (campaignData.end_date !== undefined && campaignData.end_date !== existingCampaign.end_date) {
      if (campaignData.end_date) {
        const endDate = new Date(campaignData.end_date);
        if (isNaN(endDate.getTime())) {
          return new Response(JSON.stringify({ 
            success: false, 
            error: 'Invalid end date format' 
          }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          });
        }
      }

      updateFields.push(`end_date = ?${paramIndex}`);
      params.push(campaignData.end_date || null);
      paramIndex++;
    }

    if (campaignData.status && campaignData.status !== existingCampaign.status) {
      if (!['active', 'paused', 'expired'].includes(campaignData.status)) {
        return new Response(JSON.stringify({ 
          success: false, 
          error: 'Invalid status. Must be active, paused, or expired' 
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      updateFields.push(`status = ?${paramIndex}`);
      params.push(campaignData.status);
      paramIndex++;
    }

    // If no fields to update
    if (updateFields.length === 0) {
      return new Response(JSON.stringify({ 
        success: true,
        data: existingCampaign,
        message: 'No changes detected' 
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Add updated_at field
    updateFields.push(`updated_at = CURRENT_TIMESTAMP`);

    // Build and execute update query
    const updateQuery = `UPDATE campaigns SET ${updateFields.join(', ')} WHERE id = ?${paramIndex}`;
    params.push(campaignData.id);

    const result = await DB.prepare(updateQuery).bind(...params).run();

    if (result.success) {
      // Retrieve the updated campaign
      const updatedCampaign = await DB.prepare('SELECT * FROM campaigns WHERE id = ?1')
        .bind(campaignData.id)
        .first();

      return new Response(JSON.stringify({ 
        success: true,
        data: updatedCampaign,
        message: 'Campaign updated successfully' 
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    } else {
      throw new Error('Database update failed');
    }

  } catch (error) {
    console.error('Error updating campaign:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Error updating campaign' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

/**
 * DELETE /api/campaigns - Delete a campaign
 */
export const DELETE: APIRoute = async ({ request, locals }: APIContext) => {
  try {
    // Check if database is available
    if (!locals?.runtime?.env?.DB) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Database not configured' 
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const { DB } = locals.runtime.env;
    const { id } = await request.json();

    if (!id) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Campaign ID is required' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Check if campaign exists
    const existingCampaign = await DB.prepare('SELECT * FROM campaigns WHERE id = ?1')
      .bind(id)
      .first();

    if (!existingCampaign) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Campaign not found' 
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Delete campaign (cascade will handle related records)
    const result = await DB.prepare('DELETE FROM campaigns WHERE id = ?1')
      .bind(id)
      .run();

    if (result.success) {
      return new Response(JSON.stringify({ 
        success: true,
        message: 'Campaign deleted successfully' 
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    } else {
      throw new Error('Database delete failed');
    }

  } catch (error) {
    console.error('Error deleting campaign:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Error deleting campaign' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

/**
 * Helper function to get campaign analytics
 */
async function getCampaignAnalytics(DB: any, campaignId: number): Promise<CampaignAnalytics> {
  try {
    // Get total visits and unique visitors
    const visitsQuery = `
      SELECT 
        COUNT(*) as total_visits,
        COUNT(DISTINCT COALESCE(user_id, ip_address)) as unique_visitors,
        COUNT(CASE WHEN conversion_type != 'page_view' THEN 1 END) as conversions
      FROM campaign_visits 
      WHERE campaign_id = ?1
    `;
    
    const visitsResult = await DB.prepare(visitsQuery).bind(campaignId).first();
    
    const totalVisits = visitsResult?.total_visits || 0;
    const uniqueVisitors = visitsResult?.unique_visitors || 0;
    const conversions = visitsResult?.conversions || 0;
    const conversionRate = totalVisits > 0 ? (conversions / totalVisits) * 100 : 0;

    // Get top UTM sources
    const utmQuery = `
      SELECT 
        COALESCE(utm_source, 'direct') as source,
        COUNT(*) as count
      FROM campaign_visits 
      WHERE campaign_id = ?1
      GROUP BY utm_source
      ORDER BY count DESC
      LIMIT 5
    `;
    
    const utmResult = await DB.prepare(utmQuery).bind(campaignId).all();
    const topUtmSources = (utmResult.results || []).map((row: any) => ({
      source: row.source,
      count: row.count
    }));

    // Get daily visits for the last 30 days
    const dailyQuery = `
      SELECT 
        DATE(visit_timestamp) as date,
        COUNT(*) as visits,
        COUNT(CASE WHEN conversion_type != 'page_view' THEN 1 END) as conversions
      FROM campaign_visits 
      WHERE campaign_id = ?1 
        AND visit_timestamp >= datetime('now', '-30 days')
      GROUP BY DATE(visit_timestamp)
      ORDER BY date DESC
    `;
    
    const dailyResult = await DB.prepare(dailyQuery).bind(campaignId).all();
    const dailyVisits = (dailyResult.results || []).map((row: any) => ({
      date: row.date,
      visits: row.visits,
      conversions: row.conversions
    }));

    return {
      total_visits: totalVisits,
      unique_visitors: uniqueVisitors,
      conversions,
      conversion_rate: Math.round(conversionRate * 100) / 100,
      top_utm_sources: topUtmSources,
      daily_visits: dailyVisits
    };

  } catch (error) {
    console.error('Error getting campaign analytics:', error);
    return {
      total_visits: 0,
      unique_visitors: 0,
      conversions: 0,
      conversion_rate: 0,
      top_utm_sources: [],
      daily_visits: []
    };
  }
}