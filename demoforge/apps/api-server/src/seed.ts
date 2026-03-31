import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { demosTable, stepsTable, templatesTable } from '@workspace/db/schema';
import { v4 as uuidv4 } from 'uuid';
import * as dotenv from 'dotenv';
dotenv.config();

const client = postgres(process.env.DATABASE_URL!);
const db = drizzle(client);

async function seed() {
  console.log('Seeding templates...');
  await db.insert(templatesTable).values([
    {
      id: uuidv4(),
      category: 'fintech',
      title: 'Stripe Payments API',
      description: 'Walk through creating a payment intent and confirming a charge end-to-end.',
      config: {
        steps: [
          { stepType: 'intro', leftPanelType: 'none', description: '<p>This demo walks you through the Stripe Payments API — from creating a payment intent to confirming the charge. All API calls are executed in real-time.</p>' },
          { stepType: 'normal', title: 'Create Payment Intent', leftPanelType: 'browser', codeLanguage: 'curl', codeContent: "curl --request POST \\\n  --url https://api.stripe.com/v1/payment_intents \\\n  --header 'Authorization: Bearer sk_test_4eC39HqLyjWDarjtT1zdp7dc' \\\n  --data 'amount=2000&currency=usd'", successMessage: '{"id":"pi_3PxKLM2eZvKYlo2C1a2b3c4d","object":"payment_intent","amount":2000,"currency":"usd","status":"requires_payment_method","client_secret":"pi_3Px...secret_abc123"}', apiStatusCode: 200, apiResponseMs: 187 },
          { stepType: 'normal', title: 'Confirm the Payment', leftPanelType: 'browser', codeLanguage: 'curl', codeContent: "curl --request POST \\\n  --url https://api.stripe.com/v1/payment_intents/pi_3PxKLM2eZvKYlo2C1a2b3c4d/confirm \\\n  --header 'Authorization: Bearer sk_test_4eC39HqLyjWDarjtT1zdp7dc' \\\n  --data 'payment_method=pm_card_visa'", successMessage: '{"id":"pi_3PxKLM2eZvKYlo2C1a2b3c4d","status":"succeeded","amount":2000,"currency":"usd","payment_method":"pm_card_visa"}', apiStatusCode: 200, apiResponseMs: 312 },
          { stepType: 'success', title: 'Payment Confirmed ✓', leftPanelType: 'none', description: '<p>The payment of <strong>$20.00</strong> was processed successfully. The payment intent status is now <code>succeeded</code>.</p>' },
          { stepType: 'end', title: 'Explore Stripe Docs', leftPanelType: 'none' }
        ]
      }
    },
    {
      id: uuidv4(),
      category: 'api',
      title: 'REST Authentication API',
      description: 'Register, login, and fetch a user profile using a JWT auth API.',
      config: {
        steps: [
          { stepType: 'intro', leftPanelType: 'none', description: 'Auth API Overview - explains register -> login -> /me flow' },
          { stepType: 'normal', title: 'Register User', leftPanelType: 'browser', codeLanguage: 'json', codeContent: 'POST /api/auth/register\n\n{"email":"demo@example.com","password":"SecurePass123!","name":"Jane Doe"}', successMessage: '{"id":"usr_abc123","email":"demo@example.com","name":"Jane Doe","createdAt":"2025-01-15T10:30:00Z"}', apiStatusCode: 201, apiResponseMs: 120 },
          { stepType: 'normal', title: 'Login & Get Token', leftPanelType: 'browser', codeLanguage: 'json', codeContent: 'POST /api/auth/login\n\n{"email":"demo@example.com","password":"SecurePass123!"}', successMessage: '{"access_token":"eyJhbGciOiJIUzI1NiJ9...","token_type":"Bearer","expires_in":3600}', apiStatusCode: 200, apiResponseMs: 154 },
          { stepType: 'normal', title: 'Fetch User Profile', leftPanelType: 'browser', codeLanguage: 'json', codeContent: 'GET /api/users/me\nAuthorization: Bearer {token}', successMessage: '{"id":"usr_abc123","email":"demo@example.com","name":"Jane Doe","role":"user","plan":"free"}', apiStatusCode: 200, apiResponseMs: 80 },
          { stepType: 'end', title: 'Integration Complete', leftPanelType: 'none' }
        ]
      }
    },
    {
      id: uuidv4(),
      category: 'fintech',
      title: 'Rewards & Incentives API',
      description: 'Browse a rewards catalog, select items, and redeem points via API.',
      config: { steps: [ { stepType: 'intro', title: 'Welcome to Rewards API', leftPanelType: 'none' }, { stepType: 'normal', title: 'Browse Catalog', leftPanelType: 'browser', codeContent: 'GET /api/v2/catalog', successMessage: '[{"item":"Amazon Gift Card"}, {"item":"Flipkart Voucher"}]', apiStatusCode: 200, apiResponseMs: 200 }, { stepType: 'normal', title: 'View Item Details', leftPanelType: 'browser', codeContent: 'GET /api/v2/catalog/CAT001/items', successMessage: '[{"id":"ITEM001","denomination":500}]', apiStatusCode: 200 }, { stepType: 'normal', title: 'Redeem Reward', leftPanelType: 'browser', codeContent: 'POST /api/v2/redeem\n\n{"item_id":"ITEM001","user_id":"usr_abc123","points":500}', successMessage: '{"redemption_id":"RDM-789012","status":"confirmed","transaction_id":"TXN-456789","reward":{"name":"Amazon Gift Card Rs 500","code":"AMZN-XXXX-YYYY"}}', apiStatusCode: 200 }, { stepType: 'success', title: 'Redemption Confirmed ✓', leftPanelType: 'none' }, { stepType: 'end', title: 'Start Integrating', leftPanelType: 'none' } ] }
    },
    {
      id: uuidv4(),
      category: 'ai',
      title: 'OpenAI Chat Completions',
      description: 'Send prompts to GPT-4 and receive AI-generated responses.',
      config: { steps: [ { stepType: 'intro', title: 'OpenAI Chat API', leftPanelType: 'none' }, { stepType: 'normal', title: 'Send a Message', leftPanelType: 'browser', codeLanguage: 'json', codeContent: 'POST https://api.openai.com/v1/chat/completions\n\n{"model":"gpt-4","messages":[{"role":"user","content":"Explain quantum entanglement in simple terms"}],"max_tokens":150}', successMessage: '{"id":"chatcmpl-abc123","object":"chat.completion","model":"gpt-4","choices":[{"message":{"role":"assistant","content":"Quantum entanglement is when two particles become linked..."}}],"usage":{"total_tokens":178}}', apiStatusCode: 200 }, { stepType: 'normal', title: 'Try with System Prompt', leftPanelType: 'browser' }, { stepType: 'end', title: 'Build AI-Powered Apps', leftPanelType: 'none' } ] }
    },
    {
      id: uuidv4(),
      category: 'devops',
      title: 'Webhook Integration',
      description: 'Register a webhook endpoint, trigger an event, and receive the payload.',
      config: { steps: [ { stepType: 'intro', title: 'Webhooks Overview', leftPanelType: 'none' }, { stepType: 'normal', title: 'Register Webhook', leftPanelType: 'browser', codeContent: 'POST /api/webhooks/register\n\n{"url":"https://myapp.com/webhooks","events":["payment.succeeded","payment.failed"],"secret":"whsec_abc123"}', successMessage: '{"webhook_id":"wh_abc123","status":"active","events":["payment.succeeded","payment.failed"]}', apiStatusCode: 200 }, { stepType: 'normal', title: 'Trigger Test Event', leftPanelType: 'browser' }, { stepType: 'normal', title: 'Receive the Payload', leftPanelType: 'browser', successMessage: '{"id":"evt_abc123","type":"payment.succeeded","created":1705320000,"data":{"object":{"id":"pi_abc","amount":2000,"status":"succeeded"}}}', apiStatusCode: 200 }, { stepType: 'end', title: 'Webhooks Are Live', leftPanelType: 'none' } ] }
    }
  ]).onConflictDoNothing();

  console.log('Seeding Xoxoday Plum demo...');
  const demoId = uuidv4();
  await db.insert(demosTable).values({
    id: demoId,
    title: 'Xoxoday Plum — Rewards API',
    shareId: 'xoxoday-plum',
    status: 'published',
    description: 'Interactive demo of the Xoxoday Plum rewards and incentives API. Browse catalog, redeem points, track orders.',
    brandColor: '#6366F1'
  }).onConflictDoNothing();

  await db.insert(stepsTable).values([
    { id: uuidv4(), demoId, orderIndex: 0, stepType: 'intro', title: 'Welcome to Xoxoday Plum', leftPanelType: 'none', description: '<p>Plum is a rewards, incentives, and payouts API used by <strong>5,000+ companies</strong> globally. This demo walks you through the complete API flow — browse catalog → select reward → redeem → track order.</p>' },
    { id: uuidv4(), demoId, orderIndex: 1, stepType: 'normal', title: 'Browse the Reward Catalog', leftPanelType: 'browser', rightPanelType: 'code', codeLanguage: 'curl', codeContent: "curl --request GET \\\n  --url https://api.xoxoday.com/v2/plum/catalog \\\n  --header 'Authorization: Bearer plum_live_xyz789' \\\n  --header 'Content-Type: application/json'", successMessage: '{"success":true,"data":[{"id":"CAT001","name":"Amazon Gift Cards","category":"E-Commerce","items_count":150,"points_range":{"min":500,"max":50000}},{"id":"CAT002","name":"Flipkart Vouchers","category":"E-Commerce","items_count":80,"points_range":{"min":200,"max":20000}},{"id":"CAT003","name":"Zomato Credits","category":"Food & Dining","items_count":12,"points_range":{"min":100,"max":5000}},{"id":"CAT004","name":"BookMyShow Tickets","category":"Entertainment","items_count":35,"points_range":{"min":300,"max":10000}}]}', apiStatusCode: 200, apiResponseMs: 143 },
    { id: uuidv4(), demoId, orderIndex: 2, stepType: 'normal', title: 'View Item Details', leftPanelType: 'browser', codeLanguage: 'curl', codeContent: "curl --request GET \\\n  --url https://api.xoxoday.com/v2/plum/catalog/CAT001/items \\\n  --header 'Authorization: Bearer plum_live_xyz789'", successMessage: '{"success":true,"data":[{"id":"ITEM001","name":"Amazon Gift Card ₹500","points_required":500,"denomination":500,"currency":"INR"},{"id":"ITEM002","name":"Amazon Gift Card ₹1000","points_required":1000,"denomination":1000,"currency":"INR"},{"id":"ITEM003","name":"Amazon Gift Card ₹2000","points_required":2000,"denomination":2000,"currency":"INR"}]}', apiStatusCode: 200, apiResponseMs: 98 },
    { id: uuidv4(), demoId, orderIndex: 3, stepType: 'normal', title: 'Redeem a Reward', leftPanelType: 'browser', codeLanguage: 'curl', codeContent: "curl --request POST \\\n  --url https://api.xoxoday.com/v2/plum/redeem \\\n  --header 'Authorization: Bearer plum_live_xyz789' \\\n  --header 'Content-Type: application/json' \\\n  --data '{\"item_id\":\"ITEM001\",\"user_id\":\"usr_abc123\",\"points\":500,\"idempotency_key\":\"idem_xyz_001\"}'", successMessage: '{"success":true,"data":{"redemption_id":"RDM-789012","status":"confirmed","transaction_id":"TXN-456789","reward":{"name":"Amazon Gift Card ₹500","code":"AMZN-5X7Y-9Z2W","expiry":"2025-12-31"},"points_deducted":500,"remaining_balance":4500}}', apiStatusCode: 200, apiResponseMs: 267 },
    { id: uuidv4(), demoId, orderIndex: 4, stepType: 'normal', title: 'Track Order Status', leftPanelType: 'browser', codeLanguage: 'curl', codeContent: "curl --request GET \\\n  --url https://api.xoxoday.com/v2/plum/orders/RDM-789012 \\\n  --header 'Authorization: Bearer plum_live_xyz789'", successMessage: '{"success":true,"data":{"order_id":"RDM-789012","status":"delivered","created_at":"2025-01-15T10:30:00Z","delivered_at":"2025-01-15T10:30:02Z","reward":{"name":"Amazon Gift Card ₹500","code":"AMZN-5X7Y-9Z2W"},"recipient":{"user_id":"usr_abc123","email":"demo@example.com"}}}', apiStatusCode: 200, apiResponseMs: 112 },
    { id: uuidv4(), demoId, orderIndex: 5, stepType: 'end', title: 'Start Integrating Plum', leftPanelType: 'none', description: '<p>You just completed the full Xoxoday Plum API flow. Ready to integrate?</p>', codeContent: '"https://docs.xoxoday.com/plum-api"' }
  ]);

  console.log('Seed check completed.');
  process.exit(0);
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});
