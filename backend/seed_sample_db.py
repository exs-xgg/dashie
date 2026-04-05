#!/usr/bin/env python3
"""
Seed script for Dashie — creates a `sample_db` database with realistic sales data.

Usage:
    python seed_sample_db.py

Prerequisites:
    pip install psycopg2-binary faker python-dotenv
"""

import random
import sys
from datetime import datetime, timedelta

import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
from faker import Faker
import os
from dotenv import load_dotenv

# Load environment variables from .env file in the same directory
load_dotenv()

# ── Config ────────────────────────────────────────────────────────────────────
PG_HOST = os.getenv("PG_HOST", "localhost")
PG_PORT = int(os.getenv("PG_PORT", 5432))
PG_USER = os.getenv("PG_USER", "postgres")
PG_PASSWORD = os.getenv("PG_PASSWORD", "changeme")
TARGET_DB = "sample_db"

fake = Faker()
Faker.seed(42)
random.seed(42)

# ── Helpers ───────────────────────────────────────────────────────────────────

def ensure_database_exists():
    """Connect to the default `postgres` db and create TARGET_DB if missing."""
    conn = psycopg2.connect(
        host=PG_HOST, port=PG_PORT,
        user=PG_USER, password=PG_PASSWORD,
        dbname="postgres",
    )
    conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
    cur = conn.cursor()
    cur.execute("SELECT 1 FROM pg_database WHERE datname = %s", (TARGET_DB,))
    if cur.fetchone() is None:
        cur.execute(f'CREATE DATABASE "{TARGET_DB}"')
        print(f"✅  Database '{TARGET_DB}' created.")
    else:
        print(f"ℹ️   Database '{TARGET_DB}' already exists — skipping creation.")
    cur.close()
    conn.close()


def get_target_conn():
    return psycopg2.connect(
        host=PG_HOST, port=PG_PORT,
        user=PG_USER, password=PG_PASSWORD,
        dbname=TARGET_DB,
    )


# ── Schema ────────────────────────────────────────────────────────────────────

SCHEMA_SQL = """
-- Regions
CREATE TABLE IF NOT EXISTS regions (
    id              SERIAL PRIMARY KEY,
    name            VARCHAR(100) NOT NULL UNIQUE
);

-- Sales representatives
CREATE TABLE IF NOT EXISTS sales_reps (
    id              SERIAL PRIMARY KEY,
    first_name      VARCHAR(100) NOT NULL,
    last_name       VARCHAR(100) NOT NULL,
    email           VARCHAR(255) NOT NULL UNIQUE,
    region_id       INT REFERENCES regions(id),
    hire_date       DATE NOT NULL,
    is_active       BOOLEAN DEFAULT TRUE
);

-- Product categories
CREATE TABLE IF NOT EXISTS categories (
    id              SERIAL PRIMARY KEY,
    name            VARCHAR(100) NOT NULL UNIQUE,
    description     TEXT
);

-- Products
CREATE TABLE IF NOT EXISTS products (
    id              SERIAL PRIMARY KEY,
    name            VARCHAR(200) NOT NULL,
    sku             VARCHAR(50) NOT NULL UNIQUE,
    category_id     INT REFERENCES categories(id),
    unit_price      NUMERIC(10,2) NOT NULL,
    cost_price      NUMERIC(10,2) NOT NULL,
    stock_qty       INT DEFAULT 0,
    is_active       BOOLEAN DEFAULT TRUE
);

-- Customers
CREATE TABLE IF NOT EXISTS customers (
    id              SERIAL PRIMARY KEY,
    first_name      VARCHAR(100) NOT NULL,
    last_name       VARCHAR(100) NOT NULL,
    email           VARCHAR(255) UNIQUE,
    phone           VARCHAR(30),
    company         VARCHAR(200),
    city            VARCHAR(100),
    state           VARCHAR(100),
    country         VARCHAR(100) DEFAULT 'USA',
    created_at      TIMESTAMP DEFAULT NOW()
);

-- Orders
CREATE TABLE IF NOT EXISTS orders (
    id              SERIAL PRIMARY KEY,
    customer_id     INT REFERENCES customers(id),
    sales_rep_id    INT REFERENCES sales_reps(id),
    order_date      TIMESTAMP NOT NULL,
    status          VARCHAR(30) DEFAULT 'completed',
    payment_method  VARCHAR(50),
    shipping_cost   NUMERIC(10,2) DEFAULT 0,
    notes           TEXT
);

-- Order line items
CREATE TABLE IF NOT EXISTS order_items (
    id              SERIAL PRIMARY KEY,
    order_id        INT REFERENCES orders(id) ON DELETE CASCADE,
    product_id      INT REFERENCES products(id),
    quantity        INT NOT NULL CHECK (quantity > 0),
    unit_price      NUMERIC(10,2) NOT NULL,
    discount_pct    NUMERIC(5,2) DEFAULT 0
);

-- Handy view: revenue per order item
CREATE OR REPLACE VIEW v_order_item_revenue AS
SELECT
    oi.id                                       AS item_id,
    o.id                                        AS order_id,
    o.order_date,
    c.first_name || ' ' || c.last_name          AS customer_name,
    c.company,
    c.city,
    c.state,
    sr.first_name || ' ' || sr.last_name        AS sales_rep_name,
    r.name                                      AS region,
    cat.name                                    AS category,
    p.name                                      AS product_name,
    oi.quantity,
    oi.unit_price,
    oi.discount_pct,
    ROUND(oi.quantity * oi.unit_price * (1 - oi.discount_pct / 100), 2)  AS revenue,
    ROUND(oi.quantity * p.cost_price, 2)        AS cost,
    ROUND(oi.quantity * oi.unit_price * (1 - oi.discount_pct / 100) - oi.quantity * p.cost_price, 2)  AS profit
FROM order_items oi
JOIN orders o        ON o.id = oi.order_id
JOIN customers c     ON c.id = o.customer_id
JOIN sales_reps sr   ON sr.id = o.sales_rep_id
JOIN regions r       ON r.id = sr.region_id
JOIN products p      ON p.id = oi.product_id
JOIN categories cat  ON cat.id = p.category_id;
"""

# ── Data generators ───────────────────────────────────────────────────────────

REGIONS = ["North", "South", "East", "West", "Central"]

CATEGORIES = {
    "Electronics":      "Consumer electronics and gadgets",
    "Office Supplies":  "Stationery, paper, and office essentials",
    "Furniture":        "Desks, chairs, and storage solutions",
    "Software":         "Licenses, subscriptions, and SaaS products",
    "Networking":       "Routers, switches, cables, and accessories",
}

PRODUCTS = [
    # (name, category, unit_price, cost_price)
    ("Wireless Mouse",          "Electronics",      29.99,  12.50),
    ("Mechanical Keyboard",     "Electronics",      89.99,  38.00),
    ("27\" 4K Monitor",         "Electronics",     429.99, 210.00),
    ("USB-C Hub 7-in-1",        "Electronics",      49.99,  18.00),
    ("Noise-Cancelling Headphones", "Electronics", 199.99,  85.00),
    ("Webcam 1080p",            "Electronics",      69.99,  28.00),
    ("Portable SSD 1TB",        "Electronics",     109.99,  55.00),
    ("Smart Power Strip",       "Electronics",      34.99,  14.00),
    ("A4 Copy Paper (5 ream)",  "Office Supplies",  24.99,  10.00),
    ("Ballpoint Pens (50 pk)",  "Office Supplies",  12.99,   4.50),
    ("Sticky Notes Assorted",   "Office Supplies",   8.99,   2.80),
    ("Binder Clips (100 pk)",   "Office Supplies",   6.99,   2.00),
    ("Whiteboard Markers (12)", "Office Supplies",  14.99,   5.20),
    ("File Folders (25 pk)",    "Office Supplies",  11.99,   4.00),
    ("Standing Desk",           "Furniture",       549.99, 260.00),
    ("Ergonomic Chair",         "Furniture",       399.99, 180.00),
    ("Bookshelf 5-Tier",        "Furniture",       129.99,  55.00),
    ("Filing Cabinet 3-Drawer", "Furniture",       179.99,  75.00),
    ("Monitor Arm Dual",        "Furniture",        89.99,  35.00),
    ("Desk Organizer",          "Furniture",        39.99,  15.00),
    ("Antivirus Suite (1yr)",   "Software",         59.99,   5.00),
    ("Project Mgmt Tool (mo)",  "Software",         14.99,   2.00),
    ("Cloud Backup 500GB (yr)", "Software",         99.99,  10.00),
    ("Office Suite License",    "Software",        149.99,  20.00),
    ("VPN Service (1yr)",       "Software",         39.99,   4.00),
    ("Managed Switch 24-Port",  "Networking",      299.99, 140.00),
    ("Wi-Fi 6 Router",          "Networking",      179.99,  75.00),
    ("Cat6 Cable 100ft",        "Networking",       29.99,   8.00),
    ("Network Patch Panel",     "Networking",       49.99,  20.00),
    ("PoE Injector",            "Networking",       39.99,  15.00),
]

PAYMENT_METHODS = ["Credit Card", "Debit Card", "Bank Transfer", "PayPal", "Invoice"]
ORDER_STATUSES  = ["completed", "completed", "completed", "completed",
                   "shipped", "processing", "refunded", "cancelled"]

US_STATES = [
    "California", "Texas", "New York", "Florida", "Illinois",
    "Pennsylvania", "Ohio", "Georgia", "North Carolina", "Michigan",
    "New Jersey", "Virginia", "Washington", "Arizona", "Massachusetts",
    "Tennessee", "Indiana", "Missouri", "Maryland", "Colorado",
]


def seed_regions(cur):
    for name in REGIONS:
        cur.execute(
            "INSERT INTO regions (name) VALUES (%s) ON CONFLICT DO NOTHING", (name,)
        )


def seed_sales_reps(cur, count=15):
    cur.execute("SELECT id FROM regions")
    region_ids = [r[0] for r in cur.fetchall()]
    for _ in range(count):
        cur.execute(
            """INSERT INTO sales_reps (first_name, last_name, email, region_id, hire_date)
               VALUES (%s, %s, %s, %s, %s)""",
            (
                fake.first_name(),
                fake.last_name(),
                fake.unique.email(),
                random.choice(region_ids),
                fake.date_between(start_date="-5y", end_date="-6m"),
            ),
        )


def seed_categories(cur):
    for name, desc in CATEGORIES.items():
        cur.execute(
            "INSERT INTO categories (name, description) VALUES (%s, %s) ON CONFLICT DO NOTHING",
            (name, desc),
        )


def seed_products(cur):
    cur.execute("SELECT id, name FROM categories")
    cat_map = {name: cid for cid, name in cur.fetchall()}
    for i, (name, cat, price, cost) in enumerate(PRODUCTS):
        sku = f"SKU-{i+1:04d}"
        stock = random.randint(20, 500)
        cur.execute(
            """INSERT INTO products (name, sku, category_id, unit_price, cost_price, stock_qty)
               VALUES (%s, %s, %s, %s, %s, %s) ON CONFLICT DO NOTHING""",
            (name, sku, cat_map[cat], price, cost, stock),
        )


def seed_customers(cur, count=200):
    for _ in range(count):
        cur.execute(
            """INSERT INTO customers
               (first_name, last_name, email, phone, company, city, state, country, created_at)
               VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)""",
            (
                fake.first_name(),
                fake.last_name(),
                fake.unique.email(),
                fake.phone_number(),
                fake.company() if random.random() > 0.3 else None,
                fake.city(),
                random.choice(US_STATES),
                "USA",
                fake.date_time_between(start_date="-3y", end_date="-6m"),
            ),
        )


def seed_orders(cur, count=2000):
    cur.execute("SELECT id FROM customers")
    customer_ids = [r[0] for r in cur.fetchall()]
    cur.execute("SELECT id FROM sales_reps")
    rep_ids = [r[0] for r in cur.fetchall()]
    cur.execute("SELECT id, unit_price FROM products")
    products = cur.fetchall()

    start_date = datetime.now() - timedelta(days=730)  # ~2 years back

    for _ in range(count):
        order_date = fake.date_time_between(start_date=start_date, end_date="now")
        status = random.choice(ORDER_STATUSES)
        shipping = round(random.choice([0, 0, 5.99, 9.99, 14.99, 19.99]), 2)

        cur.execute(
            """INSERT INTO orders
               (customer_id, sales_rep_id, order_date, status, payment_method, shipping_cost, notes)
               VALUES (%s, %s, %s, %s, %s, %s, %s) RETURNING id""",
            (
                random.choice(customer_ids),
                random.choice(rep_ids),
                order_date,
                status,
                random.choice(PAYMENT_METHODS),
                shipping,
                fake.sentence() if random.random() > 0.7 else None,
            ),
        )
        order_id = cur.fetchone()[0]

        # Each order gets 1-5 line items
        n_items = random.randint(1, 5)
        chosen_products = random.sample(products, min(n_items, len(products)))
        for prod_id, unit_price in chosen_products:
            qty = random.randint(1, 10)
            discount = random.choice([0, 0, 0, 5, 10, 15, 20])
            cur.execute(
                """INSERT INTO order_items (order_id, product_id, quantity, unit_price, discount_pct)
                   VALUES (%s, %s, %s, %s, %s)""",
                (order_id, prod_id, qty, float(unit_price), discount),
            )




# ── Main ──────────────────────────────────────────────────────────────────────

def main():
    print("🌱  Dashie Sample DB Seeder")
    print("=" * 50)

    # Step 1 — ensure database
    ensure_database_exists()

    # Step 2 — connect to target db
    conn = get_target_conn()
    conn.autocommit = False
    cur = conn.cursor()

    try:
        # Step 3 — create schema
        print("📐  Creating schema …")
        cur.execute(SCHEMA_SQL)
        conn.commit()

        # Check if data already exists
        cur.execute("SELECT COUNT(*) FROM orders")
        existing = cur.fetchone()[0]
        if existing > 0:
            print(f"ℹ️   Data already seeded ({existing} orders found). Skipping table seeding.")
        else:
            # Step 4 — seed data
            print("🗺️   Seeding regions …")
            seed_regions(cur)

            print("👤  Seeding sales reps (15) …")
            seed_sales_reps(cur, count=15)

            print("📁  Seeding categories …")
            seed_categories(cur)

            print("📦  Seeding products (30) …")
            seed_products(cur)

            print("🧑‍💼  Seeding customers (200) …")
            seed_customers(cur, count=200)

            print("🛒  Seeding orders & line items (2 000 orders) …")
            seed_orders(cur, count=2000)

            conn.commit()

            # Quick summary
            for table in ["regions", "sales_reps", "categories", "products",
                           "customers", "orders", "order_items"]:
                cur.execute(f"SELECT COUNT(*) FROM {table}")
                print(f"    {table:20s} → {cur.fetchone()[0]:,} rows")

        print("=" * 50)
        print("✅  Done! 'sample_db' is seeded and registered in Dashie.")

    except Exception as e:
        conn.rollback()
        print(f"❌  Error: {e}", file=sys.stderr)
        raise
    finally:
        cur.close()
        conn.close()


if __name__ == "__main__":
    main()
