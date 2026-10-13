-- SQL migration for LIGHT CASH (supabase / postgres)

BEGIN;

-- profiles table: mirrored with supabase auth user.id
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY,
  username text UNIQUE NOT NULL,
  email text,
  is_admin boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- wallets table
CREATE TABLE IF NOT EXISTS wallets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  balance numeric(18,2) NOT NULL DEFAULT 0,
  updated_at timestamptz DEFAULT now()
);

-- transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_ref text UNIQUE NOT NULL,
  sender uuid REFERENCES profiles(id),
  recipient uuid REFERENCES profiles(id),
  amount numeric(18,2) NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'completed',
  created_at timestamptz DEFAULT now()
);

-- idempotency records
CREATE TABLE IF NOT EXISTS idempotency_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now(),
  result jsonb
);

-- admin audit logs
CREATE TABLE IF NOT EXISTS admin_audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid REFERENCES profiles(id),
  action text NOT NULL,
  target jsonb,
  created_at timestamptz DEFAULT now()
);

-- ensure every profile has a wallet: create trigger
CREATE OR REPLACE FUNCTION ensure_wallet_exists() RETURNS trigger AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM wallets WHERE owner = NEW.id) THEN
    INSERT INTO wallets(owner, balance) VALUES (NEW.id, 0);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_ensure_wallet ON profiles;
CREATE TRIGGER trigger_ensure_wallet AFTER INSERT ON profiles
  FOR EACH ROW EXECUTE FUNCTION ensure_wallet_exists();

-- Transfer function with idempotency and atomicity
CREATE OR REPLACE FUNCTION transfer_virtual(
  sender_id uuid,
  recipient_identifier text,
  amount numeric,
  idempotency_key text
) RETURNS TABLE(transaction_ref text) AS $$
DECLARE
  recipient_id uuid;
  sender_wallet wallets;
  recipient_wallet wallets;
  tx_ref text := concat('LGT-', gen_random_uuid());
  idrec idempotency_records;
BEGIN
  IF amount <= 0 THEN
    RAISE EXCEPTION 'amount must be positive';
  END IF;

  -- idempotency check
  PERFORM 1 FROM idempotency_records WHERE key = idempotency_key;
  IF FOUND THEN
    -- return previous result
    RETURN QUERY SELECT (result->> 'transaction_ref')::text FROM idempotency_records WHERE key = idempotency_key;
    RETURN;
  END IF;

  -- resolve recipient: allow username or uuid
  BEGIN
    SELECT id INTO recipient_id FROM profiles WHERE username = recipient_identifier LIMIT 1;
    IF recipient_id IS NULL THEN
      -- try uuid
      recipient_id := recipient_identifier::uuid;
    END IF;
  EXCEPTION WHEN others THEN
    RAISE EXCEPTION 'invalid recipient identifier';
  END;

  IF recipient_id = sender_id THEN
    RAISE EXCEPTION 'cannot send to self';
  END IF;

  -- lock wallets
  SELECT * INTO sender_wallet FROM wallets WHERE owner = sender_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'sender wallet not found'; END IF;
  SELECT * INTO recipient_wallet FROM wallets WHERE owner = recipient_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'recipient wallet not found'; END IF;

  IF sender_wallet.balance < amount THEN
    RAISE EXCEPTION 'insufficient balance';
  END IF;

  -- perform updates
  UPDATE wallets SET balance = balance - amount, updated_at = now() WHERE id = sender_wallet.id;
  UPDATE wallets SET balance = balance + amount, updated_at = now() WHERE id = recipient_wallet.id;

  -- record transactions for both sides
  INSERT INTO transactions(transaction_ref, sender, recipient, amount, description)
    VALUES (tx_ref, sender_id, recipient_id, -abs(amount), 'send') ;
  INSERT INTO transactions(transaction_ref, sender, recipient, amount, description)
    VALUES (tx_ref, sender_id, recipient_id, abs(amount), 'receive') ;

  -- record idempotency
  INSERT INTO idempotency_records(key, result) VALUES (idempotency_key, jsonb_build_object('transaction_ref', tx_ref));

  RETURN QUERY SELECT tx_ref;
END;
$$ LANGUAGE plpgsql;

-- Demo add funds function (server-side protection)
CREATE OR REPLACE FUNCTION add_demo_funds(target_user_id uuid, amount numeric, idempotency_key text) RETURNS TABLE(transaction_ref text) AS $$
DECLARE
  w wallets;
  tx_ref text := concat('LGT-DEM-', gen_random_uuid());
BEGIN
  IF amount <= 0 THEN RAISE EXCEPTION 'amount must be positive'; END IF;
  PERFORM 1 FROM idempotency_records WHERE key = idempotency_key;
  IF FOUND THEN
    RETURN QUERY SELECT (result->> 'transaction_ref')::text FROM idempotency_records WHERE key = idempotency_key;
    RETURN;
  END IF;
  SELECT * INTO w FROM wallets WHERE owner = target_user_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'wallet not found'; END IF;
  UPDATE wallets SET balance = balance + amount, updated_at = now() WHERE id = w.id;
  INSERT INTO transactions(transaction_ref, sender, recipient, amount, description)
    VALUES (tx_ref, NULL, target_user_id, amount, 'demo_topup');
  INSERT INTO idempotency_records(key, result) VALUES (idempotency_key, jsonb_build_object('transaction_ref', tx_ref));
  RETURN QUERY SELECT tx_ref;
END;
$$ LANGUAGE plpgsql;

-- Enable pgcrypto for gen_random_uuid if not present
CREATE EXTENSION IF NOT EXISTS pgcrypto;

COMMIT;
