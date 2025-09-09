export const prerender = false;

import type { APIRoute, APIContext } from 'astro';

interface CampaignVisitData {
  campaign_id?: number;
  campaign_slug?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  referrer?: string;
  session_id?: string;
  user_id?: string;
  conversion_type?: string;
  conversion_value?: number;
  page_url?: string;
  user_agent?: string;
  ip_address?: string;
}

export const POST: APIRoute = async ({ request, locals, clientAddress }: APIContext) => {
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
    const formData = await request.formData();
    
    // Extract visit data
    const visitData: CampaignVisitData = {
      campaign_slug: formData.get('campaign_slug') as string,
      utm_source: formData.get('utm_source') as string || undefined,
      utm_medium: formData.get('utm_medium') as string || undefined,
      utm_campaign: formData.get('utm_campaign') as string || undefined,
      utm_term: formData.get('utm_term') as string || undefined,
      utm_content: formData.get('utm_content') as string || undefined,
      referrer: formData.get('referrer') as string || undefined,
      session_id: formData.get('session_id') as string || undefined,
      user_id: formData.get('user_id') as string || undefined,
      conversion_type: formData.get('conversion_type') as string || 'page_view',
      conversion_value: parseFloat(formData.get('conversion_value') as string) || 0,
      page_url: formData.get('page_url') as string || undefined,
      user_agent: request.headers.get('user-agent') || undefined,
      ip_address: clientAddress || undefined
    };

    // Validate required fields
    if (!visitData.campaign_slug) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Campaign slug is required' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Get campaign ID from slug
    let campaignId: number | null = null;
    try {
      const campaignQuery = 'SELECT id FROM campaigns WHERE slug = ?1 AND status = "active"';
      const campaignResult = await DB.prepare(campaignQuery).bind(visitData.campaign_slug).first();
      
      if (campaignResult) {
        campaignId = campaignResult.id as number;
      } else {
        // Campaign not found or inactive
        return new Response(JSON.stringify({ 
          success: false, 
          error: 'Campaign not found or inactive' 
        }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    } catch (error) {
      console.error('Error finding campaign:', error);
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Error finding campaign' 
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Insert campaign visit record
    try {
      const insertQuery = `
        INSERT INTO campaign_visits (
          campaign_id, utm_source, utm_medium, utm_campaign, utm_term, utm_content,
          referrer, session_id, user_id, conversion_type, conversion_value,
          ip_address, user_agent, visit_timestamp
        ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, CURRENT_TIMESTAMP)
      `;

      const result = await DB.prepare(insertQuery).bind(
        campaignId,
        visitData.utm_source,
        visitData.utm_medium,
        visitData.utm_campaign,
        visitData.utm_term,
        visitData.utm_content,
        visitData.referrer,
        visitData.session_id,
        visitData.user_id,
        visitData.conversion_type,
        visitData.conversion_value,
        visitData.ip_address,
        visitData.user_agent
      ).run();

      if (result.success) {
        return new Response(JSON.stringify({ 
          success: true, 
          visit_id: result.meta.last_row_id,
          message: 'Campaign visit tracked successfully' 
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      } else {
        throw new Error('Database insert failed');
      }

    } catch (error) {
      console.error('Error inserting campaign visit:', error);
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Error tracking campaign visit' 
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

  } catch (error) {
    console.error('Campaign visit API error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Internal server error' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

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
    
    const campaignSlug = searchParams.get('campaign');
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build query based on parameters
    let query = `
      SELECT 
        cv.*,
        c.slug as campaign_slug,
        c.title as campaign_title
      FROM campaign_visits cv
      JOIN campaigns c ON cv.campaign_id = c.id
      WHERE 1=1
    `;
    
    const params: any[] = [];
    let paramIndex = 1;

    if (campaignSlug) {
      query += ` AND c.slug = ?${paramIndex}`;
      params.push(campaignSlug);
      paramIndex++;
    }

    if (startDate) {
      query += ` AND cv.visit_timestamp >= ?${paramIndex}`;
      params.push(startDate);
      paramIndex++;
    }

    if (endDate) {
      query += ` AND cv.visit_timestamp <= ?${paramIndex}`;
      params.push(endDate);
      paramIndex++;
    }

    query += ` ORDER BY cv.visit_timestamp DESC LIMIT ?${paramIndex} OFFSET ?${paramIndex + 1}`;
    params.push(limit, offset);

    const result = await DB.prepare(query).bind(...params).all();

    // Get total count for pagination
    let countQuery = `
      SELECT COUNT(*) as total
      FROM campaign_visits cv
      JOIN campaigns c ON cv.campaign_id = c.id
      WHERE 1=1
    `;
    
    const countParams: any[] = [];
    let countParamIndex = 1;

    if (campaignSlug) {
      countQuery += ` AND c.slug = ?${countParamIndex}`;
      countParams.push(campaignSlug);
      countParamIndex++;
    }

    if (startDate) {
      countQuery += ` AND cv.visit_timestamp >= ?${countParamIndex}`;
      countParams.push(startDate);
      countParamIndex++;
    }

    if (endDate) {
      countQuery += ` AND cv.visit_timestamp <= ?${countParamIndex}`;
      countParams.push(endDate);
      countParamIndex++;
    }

    const countResult = await DB.prepare(countQuery).bind(...countParams).first();
    const total = (countResult?.total as number) || 0;

    return new Response(JSON.stringify({ 
      success: true,
      data: result.results || [],
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
    console.error('Error retrieving campaign visits:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Error retrieving campaign visits' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};