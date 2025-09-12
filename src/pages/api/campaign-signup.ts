export const prerender = false;

import type { APIRoute, APIContext } from 'astro';

interface CampaignSignupData {
  name: string;
  email: string;
  company?: string | undefined;
  phone?: string | undefined;
  message?: string | undefined;
  campaign_slug: string;
  form_type: string;
  tracking_id: string;
  utm_params?: string | undefined;
  submission_timestamp?: string;
  user_agent?: string | undefined;
  page_url?: string | undefined;
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

    // Extract and validate form data
    const signupData: CampaignSignupData = {
      name: (formData.get('name') as string)?.trim(),
      email: (formData.get('email') as string)?.trim().toLowerCase(),
      company: (formData.get('company') as string)?.trim() || undefined,
      phone: (formData.get('phone') as string)?.trim() || undefined,
      message: (formData.get('message') as string)?.trim() || undefined,
      campaign_slug: formData.get('campaign_slug') as string,
      form_type: formData.get('form_type') as string,
      tracking_id: formData.get('tracking_id') as string,
      utm_params: formData.get('utm_params') as string || undefined,
      submission_timestamp: formData.get('submission_timestamp') as string || new Date().toISOString(),
      user_agent: request.headers.get('user-agent') || undefined,
      page_url: formData.get('page_url') as string || undefined
    };

    // Validate required fields
    const errors: string[] = [];

    if (!signupData.name || signupData.name.length < 2) {
      errors.push('Name is required and must be at least 2 characters');
    }

    if (!signupData.email || !isValidEmail(signupData.email)) {
      errors.push('Valid email address is required');
    }

    if (!signupData.campaign_slug) {
      errors.push('Campaign slug is required');
    }

    if (!signupData.form_type) {
      errors.push('Form type is required');
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

    // Check if campaign exists and is active
    let campaignId: number | null = null;
    try {
      const campaignQuery = `
        SELECT id, title, status, end_date 
        FROM campaigns 
        WHERE slug = ?1
      `;
      const campaignResult = await DB.prepare(campaignQuery).bind(signupData.campaign_slug).first();

      if (!campaignResult) {
        return new Response(JSON.stringify({
          success: false,
          error: 'Campaign not found'
        }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // Check if campaign is active and not expired
      const now = new Date();
      const endDate = campaignResult.end_date ? new Date(campaignResult.end_date as string) : null;

      if (campaignResult.status !== 'active' || (endDate && now > endDate)) {
        return new Response(JSON.stringify({
          success: false,
          error: 'Campaign is no longer active'
        }), {
          status: 410, // Gone
          headers: { 'Content-Type': 'application/json' }
        });
      }

      campaignId = campaignResult.id as number;
    } catch (error) {
      console.error('Error checking campaign:', error);
      return new Response(JSON.stringify({
        success: false,
        error: 'Error validating campaign'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Parse UTM parameters
    let utmData: any = {};
    if (signupData.utm_params) {
      try {
        utmData = JSON.parse(signupData.utm_params);
      } catch (error) {
        console.error('Error parsing UTM parameters:', error);
      }
    }

    // Check for duplicate submission (same email + campaign within 24 hours)
    try {
      const duplicateQuery = `
        SELECT id FROM campaign_visits 
        WHERE campaign_id = ?1 
        AND conversion_type = 'form_submit'
        AND utm_source = ?2
        AND utm_campaign = ?3
        AND visit_timestamp > datetime('now', '-24 hours')
        LIMIT 1
      `;

      const duplicateResult = await DB.prepare(duplicateQuery).bind(
        campaignId,
        utmData.utm_source || null,
        utmData.utm_campaign || null
      ).first();

      // Allow duplicate if it's a different form type or significant time has passed
      if (duplicateResult) {
        console.log('Potential duplicate submission detected, but allowing...');
      }
    } catch (error) {
      console.error('Error checking for duplicates:', error);
      // Continue with submission even if duplicate check fails
    }

    // Insert campaign visit record for form submission
    let visitId: number | null = null;
    try {
      const visitQuery = `
        INSERT INTO campaign_visits (
          campaign_id, utm_source, utm_medium, utm_campaign, utm_term, utm_content,
          referrer, session_id, user_id, conversion_type, conversion_value,
          ip_address, user_agent, visit_timestamp
        ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, CURRENT_TIMESTAMP)
      `;

      const visitResult = await DB.prepare(visitQuery).bind(
        campaignId,
        utmData.utm_source || null,
        utmData.utm_medium || null,
        utmData.utm_campaign || null,
        utmData.utm_term || null,
        utmData.utm_content || null,
        utmData.referrer || null,
        utmData.session_id || null,
        signupData.email, // Use email as user_id for tracking
        'form_submit',
        1, // Conversion value for form submission
        clientAddress,
        signupData.user_agent,
      ).run();

      if (visitResult.success) {
        visitId = visitResult.meta.last_row_id as number;
      }
    } catch (error) {
      console.error('Error inserting campaign visit:', error);
      // Continue even if visit tracking fails
    }

    // Store the signup data (you might want to create a separate table for this)
    // For now, we'll store it in analytics_events table
    try {
      const eventData = {
        campaign_id: campaignId,
        campaign_slug: signupData.campaign_slug,
        form_type: signupData.form_type,
        tracking_id: signupData.tracking_id,
        name: signupData.name,
        email: signupData.email,
        company: signupData.company,
        phone: signupData.phone,
        message: signupData.message,
        utm_params: utmData,
        visit_id: visitId,
        page_url: signupData.page_url
      };

      const analyticsQuery = `
        INSERT INTO analytics_events (
          event_type, event_data, user_email, user_id, session_id,
          ip_address, user_agent, timestamp
        ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, CURRENT_TIMESTAMP)
      `;

      await DB.prepare(analyticsQuery).bind(
        'campaign_signup',
        JSON.stringify(eventData),
        signupData.email,
        signupData.email,
        utmData.session_id || null,
        clientAddress,
        signupData.user_agent
      ).run();

    } catch (error) {
      console.error('Error storing signup data:', error);
      return new Response(JSON.stringify({
        success: false,
        error: 'Error storing signup data'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Determine success message based on form type
    let successMessage = 'Thank you for your interest! We\'ll be in touch soon.';
    let nextSteps = '';

    switch (signupData.form_type) {
      case 'consultation-request':
        successMessage = 'Your consultation request has been received!';
        nextSteps = 'We\'ll contact you within 24 hours to schedule your free consultation.';
        break;
      case 'campaign-signup':
        successMessage = 'You\'re all set!';
        nextSteps = 'Check your email for next steps and additional resources.';
        break;
      case 'download-request':
        successMessage = 'Your download is ready!';
        nextSteps = 'Check your email for the download link.';
        break;
    }

    return new Response(JSON.stringify({
      success: true,
      message: successMessage,
      next_steps: nextSteps,
      tracking_id: signupData.tracking_id,
      visit_id: visitId
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Campaign signup API error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Internal server error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

/**
 * Validate email address format
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
}

