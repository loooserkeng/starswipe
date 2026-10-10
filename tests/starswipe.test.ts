import { db } from '../server/db.js';

console.log('--- RUNNING STARSWIPE INTEGRATION & WORKFLOW TESTS ---');

let passed = 0;
let failed = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    console.log(`✅ [PASS] ${message}`);
    passed++;
  } else {
    console.error(`❌ [FAIL] ${message}`);
    failed++;
  }
}

async function runTests() {
  // Test 1: Voting Operations
  console.log('\n[Suite 1: Voting Rules & Uniqueness]');
  const voter1 = `test_voter_${Date.now()}`;
  const actress = db.getActresses()[0];

  const firstVote = db.castVote(voter1, actress.id, 'like');
  assert(firstVote.success === true, 'First vote succeeds');
  assert(firstVote.isUpdate === false, 'First vote creates new record');

  // Repeating vote must not create duplicates
  const repeatVote = db.castVote(voter1, actress.id, 'like');
  assert(repeatVote.success === true, 'Repeating same vote succeeds');
  assert(repeatVote.isUpdate === true, 'Repeating vote is idempotent and does not create duplicates');

  // Changing vote updates existing vote
  const changedVote = db.castVote(voter1, actress.id, 'dislike');
  assert(changedVote.success === true, 'Changing vote succeeds');
  assert(changedVote.isUpdate === true, 'Changing vote updates existing vote');
  assert(changedVote.vote.vote_type === 'dislike', 'Vote type correctly updated to dislike');

  // Undo vote
  const undoResult = db.undoVote(voter1, actress.id);
  assert(undoResult.success === true, 'Undo vote removes existing vote record');

  // Test 2: Leaderboard & Calculation Math
  console.log('\n[Suite 2: Leaderboard & Like Rate Math]');
  const allActresses = db.getActresses();
  assert(allActresses.length > 0, 'Actresses loaded from database');
  for (const a of allActresses) {
    assert(a.net_votes === a.likes - a.dislikes, `Net votes match (${a.name}: ${a.net_votes} = ${a.likes} - ${a.dislikes})`);
    if (a.total_votes > 0) {
      assert(a.like_rate === Math.round((a.likes / a.total_votes) * 100), `Like rate calculated correctly (${a.like_rate}%)`);
    }
  }

  // Test 3: Image Moderation & Duplicate Detection
  console.log('\n[Suite 3: Image Submission & Moderation Pipeline]');
  const testHash = `hash_${Date.now()}`;
  const subResult = db.submitImage({
    uploaderId: 'user_admin_01',
    actressId: actress.id,
    storagePath: '/test/path.jpg',
    contentHash: testHash,
  });
  assert(subResult.success === true, 'Image submitted into pending queue');
  assert(subResult.image?.moderation_status === 'pending', 'Submitted image has pending status');

  // Duplicate hash rejection
  const dupResult = db.submitImage({
    uploaderId: 'user_admin_01',
    actressId: actress.id,
    storagePath: '/test/path2.jpg',
    contentHash: testHash,
  });
  assert(dupResult.success === false, 'Duplicate content hash is rejected');

  // Approval workflow
  if (subResult.image) {
    const modResult = db.moderateImage(subResult.image.id, 'approve', 'user_admin_01');
    assert(modResult.success === true, 'Moderator can approve image');
    assert(modResult.image?.moderation_status === 'approved', 'Approved status set on image');
  }

  // Summary
  console.log(`\n---------------------------------------`);
  console.log(`Tests Completed: ${passed + failed} | Passed: ${passed} | Failed: ${failed}`);
  if (failed > 0) {
    process.exit(1);
  } else {
    console.log('All StarSwipe automated verification tests PASSED!\n');
  }
}

runTests().catch((e) => {
  console.error(e);
  process.exit(1);
});
