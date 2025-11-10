/**
 * Admin Utility Functions
 *
 * Helper functions for managing resources, intakes, and provider submissions
 *
 * Usage:
 *   node scripts/admin-utils.js <command> [args]
 *
 * Commands:
 *   stats                          Show database statistics
 *   list-intakes [status]          List intake applications (default: new)
 *   update-intake <id> <status>    Update intake status
 *   list-providers [status]        List provider submissions (default: pending)
 *   approve-provider <id>          Approve provider submission and create resource
 *   reject-provider <id>           Reject provider submission
 *   deactivate-resource <id>       Deactivate a resource
 *   verify-resource <id>           Update lastVerifiedAt timestamp
 *   search-resources <query>       Search resources by name
 */

import { getDb, getCollection } from '../lib/mongodb.js';
import { createFoodResource, updateIntake, updateFoodResource } from '../lib/models.js';

async function showStats() {
  const db = await getDb();

  const [
    resourcesCount,
    activeResourcesCount,
    intakesCount,
    newIntakesCount,
    providersCount,
    pendingProvidersCount,
  ] = await Promise.all([
    db.collection('resources').countDocuments(),
    db.collection('resources').countDocuments({ isActive: true }),
    db.collection('intakes').countDocuments(),
    db.collection('intakes').countDocuments({ status: 'new' }),
    db.collection('provider_submissions').countDocuments(),
    db.collection('provider_submissions').countDocuments({ status: 'pending' }),
  ]);

  console.log('\n📊 Database Statistics\n');
  console.log('Resources:');
  console.log(`  Total: ${resourcesCount}`);
  console.log(`  Active: ${activeResourcesCount}`);
  console.log(`  Inactive: ${resourcesCount - activeResourcesCount}\n`);

  console.log('Intakes:');
  console.log(`  Total: ${intakesCount}`);
  console.log(`  New (needs attention): ${newIntakesCount}`);
  console.log(`  Processed: ${intakesCount - newIntakesCount}\n`);

  console.log('Provider Submissions:');
  console.log(`  Total: ${providersCount}`);
  console.log(`  Pending Review: ${pendingProvidersCount}`);
  console.log(`  Reviewed: ${providersCount - pendingProvidersCount}\n`);
}

async function listIntakes(status = 'new') {
  const intakes = await getCollection('intakes');
  const results = await intakes
    .find({ status })
    .sort({ createdAt: -1 })
    .limit(20)
    .toArray();

  console.log(`\n📋 Recent Intakes (status: ${status})\n`);

  if (results.length === 0) {
    console.log('  No intakes found.\n');
    return;
  }

  results.forEach((intake, index) => {
    console.log(`${index + 1}. [${intake.kind.toUpperCase()}] ${intake.applicant.name}`);
    console.log(`   ID: ${intake._id}`);
    console.log(`   Phone: ${intake.applicant.phone}`);
    console.log(`   ZIP: ${intake.address.zip}`);
    console.log(`   Household: ${intake.householdSize}`);
    if (intake.hasChildrenUnder2) {
      console.log(`   Infant Needs: ${intake.infantNeeds.join(', ')}`);
    }
    console.log(`   Status: ${intake.status}`);
    console.log(`   Created: ${intake.createdAt.toISOString()}\n`);
  });

  console.log(`Showing ${results.length} results\n`);
}

async function updateIntakeStatus(id, newStatus) {
  const { ObjectId } = await import('mongodb');

  try {
    const result = await updateIntake(id, { status: newStatus });

    if (!result) {
      console.error(`❌ Intake not found: ${id}`);
      return;
    }

    console.log(`✅ Updated intake ${id}`);
    console.log(`   Name: ${result.applicant.name}`);
    console.log(`   Status: ${result.status}`);
    console.log(`   Updated: ${result.updatedAt.toISOString()}\n`);
  } catch (error) {
    console.error(`❌ Error updating intake:`, error.message);
  }
}

async function listProviders(status = 'pending') {
  const providers = await getCollection('provider_submissions');
  const results = await providers
    .find({ status })
    .sort({ submittedAt: -1 })
    .limit(20)
    .toArray();

  console.log(`\n🏪 Provider Submissions (status: ${status})\n`);

  if (results.length === 0) {
    console.log('  No submissions found.\n');
    return;
  }

  results.forEach((provider, index) => {
    console.log(`${index + 1}. ${provider.orgName}`);
    console.log(`   ID: ${provider._id}`);
    if (provider.siteName) console.log(`   Site: ${provider.siteName}`);
    console.log(`   Type: ${provider.type}`);
    console.log(`   County: ${provider.county}`);
    console.log(`   Address: ${provider.address.street}, ${provider.address.city}, ${provider.address.zip}`);
    console.log(`   Contact: ${provider.contact.phone || provider.contact.email}`);
    console.log(`   Services: ${provider.services.join(', ')}`);
    console.log(`   Submitted: ${provider.submittedAt.toISOString()}\n`);
  });

  console.log(`Showing ${results.length} results\n`);
}

async function approveProvider(id) {
  const { ObjectId } = await import('mongodb');
  const providers = await getCollection('provider_submissions');

  try {
    const submission = await providers.findOne({ _id: new ObjectId(id) });

    if (!submission) {
      console.error(`❌ Provider submission not found: ${id}`);
      return;
    }

    if (submission.status !== 'pending') {
      console.error(`❌ Submission is not pending (current status: ${submission.status})`);
      return;
    }

    // Create resource from submission
    const resource = await createFoodResource({
      name: submission.orgName + (submission.siteName ? ` - ${submission.siteName}` : ''),
      type: submission.type,
      county: submission.county,
      location: submission.location,
      address: submission.address,
      hours: submission.hours || [],
      services: submission.services || [],
      languages: submission.languages || ['English'],
      contact: submission.contact || {},
      eligibility: submission.eligibility || '',
      notes: submission.notes || '',
      isActive: true,
    });

    // Update submission status
    await providers.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          status: 'approved',
          reviewedAt: new Date(),
          resourceId: resource._id,
        },
      }
    );

    console.log(`✅ Provider approved and resource created!`);
    console.log(`   Organization: ${submission.orgName}`);
    console.log(`   Resource ID: ${resource._id}`);
    console.log(`   County: ${submission.county}\n`);

    // TODO: Send email notification to provider
  } catch (error) {
    console.error(`❌ Error approving provider:`, error.message);
  }
}

async function rejectProvider(id) {
  const { ObjectId } = await import('mongodb');
  const providers = await getCollection('provider_submissions');

  try {
    const result = await providers.findOneAndUpdate(
      { _id: new ObjectId(id) },
      {
        $set: {
          status: 'rejected',
          reviewedAt: new Date(),
        },
      },
      { returnDocument: 'after' }
    );

    if (!result.value) {
      console.error(`❌ Provider submission not found: ${id}`);
      return;
    }

    console.log(`✅ Provider submission rejected`);
    console.log(`   Organization: ${result.value.orgName}`);
    console.log(`   Rejected: ${result.value.reviewedAt.toISOString()}\n`);

    // TODO: Send email notification to provider with reason
  } catch (error) {
    console.error(`❌ Error rejecting provider:`, error.message);
  }
}

async function deactivateResource(id) {
  try {
    const result = await updateFoodResource(id, { isActive: false });

    if (!result) {
      console.error(`❌ Resource not found: ${id}`);
      return;
    }

    console.log(`✅ Resource deactivated`);
    console.log(`   Name: ${result.name}`);
    console.log(`   County: ${result.county}`);
    console.log(`   Status: Inactive\n`);
  } catch (error) {
    console.error(`❌ Error deactivating resource:`, error.message);
  }
}

async function verifyResource(id) {
  try {
    const result = await updateFoodResource(id, {
      lastVerifiedAt: new Date(),
    });

    if (!result) {
      console.error(`❌ Resource not found: ${id}`);
      return;
    }

    console.log(`✅ Resource verified`);
    console.log(`   Name: ${result.name}`);
    console.log(`   Verified: ${result.lastVerifiedAt.toISOString()}\n`);
  } catch (error) {
    console.error(`❌ Error verifying resource:`, error.message);
  }
}

async function searchResources(query) {
  const resources = await getCollection('resources');

  const results = await resources
    .find({
      name: { $regex: query, $options: 'i' },
      isActive: true,
    })
    .limit(10)
    .toArray();

  console.log(`\n🔍 Search Results: "${query}"\n`);

  if (results.length === 0) {
    console.log('  No resources found.\n');
    return;
  }

  results.forEach((resource, index) => {
    console.log(`${index + 1}. ${resource.name}`);
    console.log(`   ID: ${resource._id}`);
    console.log(`   Type: ${resource.type}`);
    console.log(`   County: ${resource.county}`);
    console.log(`   Address: ${resource.address.city}, ${resource.address.zip}`);
    console.log(`   Active: ${resource.isActive ? 'Yes' : 'No'}\n`);
  });

  console.log(`Found ${results.length} results\n`);
}

// CLI Command Router
async function main() {
  const command = process.argv[2];
  const args = process.argv.slice(3);

  if (!command) {
    console.log('\n❌ Command required\n');
    console.log('Available commands:');
    console.log('  stats');
    console.log('  list-intakes [status]');
    console.log('  update-intake <id> <status>');
    console.log('  list-providers [status]');
    console.log('  approve-provider <id>');
    console.log('  reject-provider <id>');
    console.log('  deactivate-resource <id>');
    console.log('  verify-resource <id>');
    console.log('  search-resources <query>\n');
    process.exit(1);
  }

  try {
    switch (command) {
      case 'stats':
        await showStats();
        break;

      case 'list-intakes':
        await listIntakes(args[0] || 'new');
        break;

      case 'update-intake':
        if (!args[0] || !args[1]) {
          console.error('❌ Usage: update-intake <id> <status>');
          process.exit(1);
        }
        await updateIntakeStatus(args[0], args[1]);
        break;

      case 'list-providers':
        await listProviders(args[0] || 'pending');
        break;

      case 'approve-provider':
        if (!args[0]) {
          console.error('❌ Usage: approve-provider <id>');
          process.exit(1);
        }
        await approveProvider(args[0]);
        break;

      case 'reject-provider':
        if (!args[0]) {
          console.error('❌ Usage: reject-provider <id>');
          process.exit(1);
        }
        await rejectProvider(args[0]);
        break;

      case 'deactivate-resource':
        if (!args[0]) {
          console.error('❌ Usage: deactivate-resource <id>');
          process.exit(1);
        }
        await deactivateResource(args[0]);
        break;

      case 'verify-resource':
        if (!args[0]) {
          console.error('❌ Usage: verify-resource <id>');
          process.exit(1);
        }
        await verifyResource(args[0]);
        break;

      case 'search-resources':
        if (!args[0]) {
          console.error('❌ Usage: search-resources <query>');
          process.exit(1);
        }
        await searchResources(args.join(' '));
        break;

      default:
        console.error(`❌ Unknown command: ${command}`);
        process.exit(1);
    }

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

main();
