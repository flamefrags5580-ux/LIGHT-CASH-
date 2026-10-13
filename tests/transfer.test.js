/* Basic test script for transfer function. Requires SUPABASE_SERVICE_ROLE_KEY or DATABASE_URL env var.
   This script is intended for local dev only. Do NOT commit production service keys. */

const { Client } = require('pg')

async function main(){
  const connectionString = process.env.DATABASE_URL || process.env.SUPABASE_DB_URL
  if(!connectionString){
    console.error('Please set DATABASE_URL or SUPABASE_DB_URL to run tests (local dev)')
    process.exit(1)
  }
  const client = new Client({ connectionString })
  await client.connect()

  try{
    // Create two test profiles
    const res1 = await client.query("INSERT INTO profiles(id, username, email) VALUES (gen_random_uuid(), 'test_a', 'a@test') RETURNING id")
    const userA = res1.rows[0].id
    const res2 = await client.query("INSERT INTO profiles(id, username, email) VALUES (gen_random_uuid(), 'test_b', 'b@test') RETURNING id")
    const userB = res2.rows[0].id

    // ensure wallets created
    await client.query("INSERT INTO wallets(owner, balance) VALUES ($1, 1000)", [userA])
    await client.query("INSERT INTO wallets(owner, balance) VALUES ($1, 0)", [userB])

    // call transfer function
    const idemp = 'test-key-' + Date.now()
    const tx = await client.query('SELECT * FROM transfer_virtual($1, $2, $3, $4)', [userA, 'test_b', 250, idemp])
    console.log('transfer result', tx.rows)

    const balA = await client.query('SELECT balance FROM wallets WHERE owner = $1', [userA])
    const balB = await client.query('SELECT balance FROM wallets WHERE owner = $1', [userB])
    console.log('balances', balA.rows[0], balB.rows[0])

    // cleanup - in CI you'd rollback
  }catch(err){
    console.error(err)
  }finally{
    await client.end()
  }
}

main()
