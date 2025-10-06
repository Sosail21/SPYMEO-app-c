/**
 * API endpoint for managing email preferences
 * GET/PUT /api/account/email-preferences
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Email preferences schema
const emailPreferencesSchema = z.object({
  marketing: z.boolean().optional(),
  notifications: z.boolean().optional(),
  appointments: z.boolean().optional(),
  messages: z.boolean().optional(),
  passUpdates: z.boolean().optional(),
  blogUpdates: z.boolean().optional(),
});

// Mock database (replace with real DB)
const emailPreferences = new Map<string, Record<string, boolean>>();

/**
 * Get email preferences for current user
 * GET /api/account/email-preferences
 */
export async function GET(request: NextRequest) {
  try {
    // TODO: Get user ID from session
    const userId = 'mock-user-id';

    // Get preferences or use defaults
    const preferences = emailPreferences.get(userId) || {
      marketing: true,
      notifications: true,
      appointments: true,
      messages: true,
      passUpdates: true,
      blogUpdates: true,
    };

    return NextResponse.json({
      success: true,
      preferences,
    });
  } catch (error) {
    console.error('Get email preferences error:', error);
    return NextResponse.json(
      { error: 'Failed to get email preferences' },
      { status: 500 }
    );
  }
}

/**
 * Update email preferences
 * PUT /api/account/email-preferences
 */
export async function PUT(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const preferences = emailPreferencesSchema.parse(body);

    // TODO: Get user ID from session
    const userId = 'mock-user-id';

    // Get current preferences
    const current = emailPreferences.get(userId) || {};

    // Update preferences
    const updated = {
      ...current,
      ...preferences,
    };

    // Save to database
    emailPreferences.set(userId, updated);

    return NextResponse.json({
      success: true,
      preferences: updated,
      message: 'Email preferences updated successfully',
    });
  } catch (error) {
    console.error('Update email preferences error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update email preferences' },
      { status: 500 }
    );
  }
}

/**
 * Unsubscribe from all emails (except system)
 * POST /api/account/email-preferences/unsubscribe
 */
export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Unsubscribe from all optional emails
    const unsubscribed = {
      marketing: false,
      notifications: false,
      appointments: false,
      messages: false,
      passUpdates: false,
      blogUpdates: false,
    };

    emailPreferences.set(userId, unsubscribed);

    return NextResponse.json({
      success: true,
      message: 'Successfully unsubscribed from all emails',
    });
  } catch (error) {
    console.error('Unsubscribe error:', error);
    return NextResponse.json(
      { error: 'Failed to unsubscribe' },
      { status: 500 }
    );
  }
}
