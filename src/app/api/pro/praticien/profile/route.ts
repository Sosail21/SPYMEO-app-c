// API routes for practitioner profile management
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { COOKIE_NAME } from '@/lib/auth/session';
import { prisma } from '@/lib/prisma';

// GET - Retrieve practitioner profile
export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(COOKIE_NAME);

    if (!sessionCookie) {
      return NextResponse.json(
        { success: false, error: 'Non authentifié' },
        { status: 401 }
      );
    }

    const session = JSON.parse(sessionCookie.value);
    const userId = session.id;

    // Verify user is a practitioner
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        role: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        siret: true,
        profileData: true,
        profile: {
          select: {
            avatar: true,
            bio: true,
          },
        },
        practitionerProfile: {
          select: {
            id: true,
            slug: true,
            publicName: true,
            specialties: true,
            description: true,
            siret: true,
            address: true,
            city: true,
            postalCode: true,
            verified: true,
            featured: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    if (user.role !== 'PRACTITIONER') {
      return NextResponse.json(
        { success: false, error: 'Accès réservé aux praticiens' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      profile: {
        // User data
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        avatar: user.profile?.avatar,
        bio: user.profile?.bio,

        // PractitionerProfile data
        practitionerProfile: user.practitionerProfile,

        // Additional professional data from JSON
        profileData: user.profileData,
      },
    });
  } catch (error) {
    console.error('[GET /api/pro/praticien/profile] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// PATCH - Update practitioner profile
export async function PATCH(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(COOKIE_NAME);

    if (!sessionCookie) {
      return NextResponse.json(
        { success: false, error: 'Non authentifié' },
        { status: 401 }
      );
    }

    const session = JSON.parse(sessionCookie.value);
    const userId = session.id;

    // Verify user is a practitioner
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        role: true,
        practitionerProfile: {
          select: { id: true },
        },
      },
    });

    if (!user || user.role !== 'PRACTITIONER') {
      return NextResponse.json(
        { success: false, error: 'Accès réservé aux praticiens' },
        { status: 403 }
      );
    }

    const body = await req.json();

    // Update User fields
    const userUpdateData: any = {};
    if (body.firstName !== undefined) userUpdateData.firstName = body.firstName;
    if (body.lastName !== undefined) userUpdateData.lastName = body.lastName;
    if (body.phone !== undefined) userUpdateData.phone = body.phone;

    if (Object.keys(userUpdateData).length > 0) {
      await prisma.user.update({
        where: { id: userId },
        data: userUpdateData,
      });
    }

    // Update Profile (bio)
    if (body.bio !== undefined) {
      await prisma.profile.upsert({
        where: { userId: userId },
        create: {
          userId: userId,
          bio: body.bio,
        },
        update: {
          bio: body.bio,
        },
      });
    }

    // Helper function to generate slug
    function generateSlug(name: string): string {
      return name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
        .replace(/\s+/g, '-')          // Spaces to dashes
        .replace(/-+/g, '-')           // Multiple dashes to single
        .replace(/^-|-$/g, '');        // Remove leading/trailing dashes
    }

    // Update or create PractitionerProfile
    const practitionerUpdateData: any = {};
    if (body.publicName !== undefined) {
      practitionerUpdateData.publicName = body.publicName;
      // Always regenerate slug when publicName changes
      practitionerUpdateData.slug = generateSlug(body.publicName);
    }
    if (body.specialties !== undefined) practitionerUpdateData.specialties = body.specialties;
    if (body.description !== undefined) practitionerUpdateData.description = body.description;
    if (body.address !== undefined) practitionerUpdateData.address = body.address;
    if (body.city !== undefined) practitionerUpdateData.city = body.city;
    if (body.postalCode !== undefined) practitionerUpdateData.postalCode = body.postalCode;
    if (body.siret !== undefined) practitionerUpdateData.siret = body.siret;

    if (user.practitionerProfile) {
      // Update existing profile
      await prisma.practitionerProfile.update({
        where: { id: user.practitionerProfile.id },
        data: practitionerUpdateData,
      });
    } else if (Object.keys(practitionerUpdateData).length > 0) {
      // Create new profile
      if (!practitionerUpdateData.publicName) {
        return NextResponse.json(
          { success: false, error: 'Le nom public est requis pour créer le profil' },
          { status: 400 }
        );
      }
      // Ensure slug exists for new profiles
      if (!practitionerUpdateData.slug) {
        practitionerUpdateData.slug = generateSlug(practitionerUpdateData.publicName);
      }

      await prisma.practitionerProfile.create({
        data: {
          ...practitionerUpdateData,
          userId: userId,
          verified: false, // Don't auto-verify - require admin approval
          featured: false,
        },
      });
    }

    // Update profileData (rates, hours, etc.)
    if (body.profileData !== undefined) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          profileData: body.profileData,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Profil mis à jour avec succès',
    });
  } catch (error) {
    console.error('[PATCH /api/pro/praticien/profile] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
