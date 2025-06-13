import express from "express";
import fetch from "node-fetch";
import "dotenv/config";

const app = express();
app.use(express.json());

const { PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET, PORT = 8082 } = process.env;
const PAYPAL_API = "https://api-m.sandbox.paypal.com"; // Use live endpoint for production

// Your plans configuration
const plans = [
    {
        name: "Basic",
        description: "Basic monthly membership",
        amount: "11.95"
    },
    {
        name: "VIP Member",
        description: "VIP monthly membership",
        amount: "14.95"
    },
    {
        name: "Business",
        description: "Business monthly membership",
        amount: "16.95"
    }
];

// Get OAuth token from PayPal
async function getAccessToken() {
    const response = await fetch(`${PAYPAL_API}/v1/oauth2/token`, {
        method: "POST",
        headers: {
            "Authorization": "Basic " + Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString("base64"),
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: "grant_type=client_credentials"
    });
    const data = await response.json();
    return data.access_token;
}

// Create a product (required before creating plans)
async function createProduct(accessToken) {
    const response = await fetch(`${PAYPAL_API}/v1/catalogs/products`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${accessToken}`
        },
        body: JSON.stringify({
            name: "TowerClub Membership",
            description: "TowerClub Recurring Membership",
            type: "SERVICE",
            category: "SOFTWARE"
        })
    });
    const data = await response.json();
    if (!data.id) throw new Error("Failed to create product: " + JSON.stringify(data));
    return data.id;
}

// Create a plan for a given product and plan config
async function createPlan(accessToken, product_id, plan) {
    const response = await fetch(`${PAYPAL_API}/v1/billing/plans`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${accessToken}`
        },
        body: JSON.stringify({
            product_id,
            name: plan.name + " Plan",
            description: plan.description,
            billing_cycles: [
                {
                    frequency: {
                        interval_unit: "MONTH",
                        interval_count: 1
                    },
                    tenure_type: "REGULAR",
                    sequence: 1,
                    total_cycles: 0, // 0 = infinite
                    pricing_scheme: {
                        fixed_price: {
                            value: plan.amount,
                            currency_code: "USD"
                        }
                    }
                }
            ],
            payment_preferences: {
                auto_bill_outstanding: true,
                setup_fee: {
                    value: "0",
                    currency_code: "USD"
                },
                setup_fee_failure_action: "CONTINUE",
                payment_failure_threshold: 3
            }
        })
    });
    const data = await response.json();
    if (!data.id) throw new Error("Failed to create plan: " + JSON.stringify(data));
    return data;
}

// Endpoint to create all plans at once
app.post("/api/paypal/create-all-plans", async (req, res) => {
    try {
        const accessToken = await getAccessToken();
        const product_id = await createProduct(accessToken);

        const createdPlans = [];
        for (const plan of plans) {
            const planData = await createPlan(accessToken, product_id, plan);
            createdPlans.push({
                name: plan.name,
                plan_id: planData.id,
                status: planData.status,
                details: planData
            });
        }
        res.json({ product_id, plans: createdPlans });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`PayPal All Plans server running at http://localhost:${PORT}/`);
});