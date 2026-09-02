-- Our Table — demo seed data
--
-- IMPORTANT: profiles.id is a foreign key to auth.users.id. Supabase auth
-- users can't be created from plain SQL, so before running this seed:
--   1. Sign up two accounts through the app (or Supabase Studio -> Authentication).
--   2. Replace the two placeholder UUIDs below with the real auth.users ids.
-- If you just want to see the product without wiring up real accounts, run
-- `npm run dev` without Supabase env vars set — the app ships with an
-- equivalent in-memory demo dataset (src/lib/demo-data.ts) for that.

do $$
declare
  v_household_id uuid;
  v_mina_id uuid := '11111111-1111-1111-1111-111111111111'; -- replace with real auth.users.id
  v_jae_id uuid := '22222222-2222-2222-2222-222222222222';  -- replace with real auth.users.id
  v_recipe_katsu uuid;
  v_recipe_tacos uuid;
  v_recipe_sauce uuid;
  v_recipe_salmon uuid;
  v_recipe_friedrice uuid;
  v_plan_id uuid;
  v_list_id uuid;
  v_meal_mon uuid;
  v_meal_tue uuid;
  v_meal_thu uuid;
  v_meal_fri uuid;
  v_meal_sat uuid;
begin
  insert into profiles (id, display_name)
  values
    (v_mina_id, 'Mina'),
    (v_jae_id, 'Jae')
  on conflict (id) do nothing;

  insert into households (name) values ('Our Table') returning id into v_household_id;

  insert into household_members (household_id, profile_id, role) values
    (v_household_id, v_mina_id, 'owner'),
    (v_household_id, v_jae_id, 'member');

  insert into telegram_links (household_id, telegram_chat_id, chat_title) values
    (v_household_id, -1001234567890, 'Our Table 🍽️');

  -- Recipes -------------------------------------------------------------

  insert into recipes (household_id, title, source_url, description, ingredients, instructions,
    cuisine_tags, ingredient_tags, illustration_seed, status, discovered_date, discovered_by)
  values (
    v_household_id, 'Chicken Katsu Curry', 'https://example.com/recipe/chicken-katsu-curry',
    'Crispy panko chicken cutlet swimming in a glossy, mildly sweet curry sauce. Captured from the group chat after Jae found it at 11pm.',
    array['2 boneless chicken thighs', '1 cup panko breadcrumbs', '2 tbsp curry roux cubes', '1 onion, sliced', '1 carrot, sliced', '2 cups steamed rice', '1 egg, beaten', 'Neutral oil for frying'],
    E'1. Pound chicken thighs to even thickness, season with salt and pepper.\n2. Dredge in flour, egg, then panko.\n3. Shallow-fry until golden, about 3 minutes per side.\n4. Simmer onion and carrot until soft, dissolve curry roux into the broth.\n5. Slice chicken, serve over rice with curry sauce.',
    array['japanese'], array['chicken', 'panko', 'curry'], 'chicken-katsu-curry',
    'idea', current_date - interval '6 days', v_jae_id
  ) returning id into v_recipe_katsu;

  insert into recipes (household_id, title, source_url, description, ingredients, instructions,
    cuisine_tags, ingredient_tags, illustration_seed, status, discovered_date, discovered_by)
  values (
    v_household_id, 'Weeknight Fish Tacos', 'https://example.com/recipe/weeknight-fish-tacos',
    'Quick pan-seared white fish, lime-dressed cabbage slaw, warm corn tortillas. A 25-minute regular.',
    array['1 lb white fish fillets', '8 corn tortillas', '2 cups shredded cabbage', '1 lime', '1/4 cup sour cream', 'Chili powder', 'Cilantro'],
    E'1. Season fish with chili powder, salt, cumin.\n2. Sear 3 minutes per side until flaky.\n3. Toss cabbage with lime juice and a pinch of salt.\n4. Warm tortillas, assemble with fish, slaw, and a drizzle of crema.',
    array['mexican'], array['fish', 'cabbage', 'lime'], 'weeknight-fish-tacos',
    'planned', current_date - interval '20 days', v_mina_id
  ) returning id into v_recipe_tacos;

  insert into recipes (household_id, title, source_url, description, ingredients, instructions,
    cuisine_tags, ingredient_tags, illustration_seed, status, discovered_date, discovered_by)
  values (
    v_household_id, E'Grandma''s Sunday Sauce', null,
    'The slow tomato-pork sauce that started this whole household archive. No shortcuts allowed.',
    array['2 lb pork shoulder', '28 oz crushed tomatoes', '1 onion, diced', '4 cloves garlic', 'Handful fresh basil', '1 lb pasta', 'Parmesan to finish'],
    E'1. Brown pork shoulder on all sides, remove.\n2. Soften onion and garlic in the same pot.\n3. Return pork, add crushed tomatoes, simmer covered 3 hours.\n4. Shred pork back into the sauce, stir in torn basil.\n5. Serve over pasta with parmesan.',
    array['italian'], array['tomato', 'pork', 'basil'], 'grandmas-sunday-sauce',
    'repeated', current_date - interval '90 days', v_mina_id
  ) returning id into v_recipe_sauce;

  insert into recipes (household_id, title, source_url, description, ingredients, instructions,
    cuisine_tags, ingredient_tags, illustration_seed, status, discovered_date, discovered_by)
  values (
    v_household_id, 'Miso Glazed Salmon', 'https://example.com/recipe/miso-glazed-salmon',
    'Sticky-sweet miso glaze, five ingredients, done under the broiler in ten minutes.',
    array['4 salmon fillets', '3 tbsp white miso', '2 tbsp honey', '1 tbsp rice vinegar', '2 cups steamed rice', 'Sesame seeds'],
    E'1. Whisk miso, honey, and rice vinegar.\n2. Brush over salmon fillets.\n3. Broil 8-10 minutes until caramelized at the edges.\n4. Serve over rice, scatter with sesame seeds.',
    array['japanese'], array['salmon', 'miso', 'rice'], 'miso-glazed-salmon',
    'cooked', current_date - interval '18 days', v_jae_id
  ) returning id into v_recipe_salmon;

  insert into recipes (household_id, title, source_url, description, ingredients, instructions,
    cuisine_tags, ingredient_tags, illustration_seed, status, discovered_date, discovered_by)
  values (
    v_household_id, 'Weekend Tofu Fried Rice', 'https://example.com/recipe/weekend-tofu-fried-rice',
    'Day-old rice, crispy tofu cubes, whatever vegetables are about to turn. A clean-out-the-fridge favorite.',
    array['14 oz firm tofu, cubed', '3 cups day-old rice', '2 eggs', '1 cup frozen peas and carrots', '2 tbsp soy sauce', '1 tsp sesame oil', 'Green onion'],
    E'1. Press and pan-fry tofu cubes until golden on most sides.\n2. Push tofu aside, scramble eggs in the same pan.\n3. Add rice, breaking up clumps, then peas and carrots.\n4. Stir in soy sauce and sesame oil, toss everything together.\n5. Top with sliced green onion.',
    array['japanese'], array['tofu', 'rice', 'egg'], 'weekend-tofu-fried-rice',
    'idea', current_date - interval '3 days', v_jae_id
  ) returning id into v_recipe_friedrice;

  -- Grocery finds ---------------------------------------------------------

  insert into grocery_finds (household_id, store, ingredient, price, description, source_url, image_url, expiry_date, created_by)
  values (v_household_id, 'Safeway', 'Boneless chicken thighs', 4.99,
    'Family pack marked down $2 this week — enough for katsu curry twice.', null, null,
    current_date + interval '4 days', v_mina_id)
  returning id into v_list_id; -- reuse var, overwritten below

  insert into grocery_find_recipes (grocery_find_id, recipe_id) values (v_list_id, v_recipe_katsu);

  insert into grocery_finds (household_id, store, ingredient, price, description, source_url, image_url, expiry_date, created_by)
  values (v_household_id, '99 Ranch', 'Silken tofu, 3-pack', 2.49,
    'Stock-up size, keeps for weeks unopened. Great for the fried rice.', null, null,
    current_date + interval '25 days', v_jae_id)
  returning id into v_list_id;

  insert into grocery_find_recipes (grocery_find_id, recipe_id) values (v_list_id, v_recipe_friedrice);

  insert into grocery_finds (household_id, store, ingredient, price, description, source_url, image_url, expiry_date, created_by)
  values (v_household_id, 'Target', 'Corn tortillas, 30-count', 2.79,
    'Good Gather brand, sturdy enough for pan-searing leftovers into quesadillas too.', null, null,
    current_date + interval '10 days', v_mina_id)
  returning id into v_list_id;

  insert into grocery_find_recipes (grocery_find_id, recipe_id) values (v_list_id, v_recipe_tacos);

  insert into grocery_finds (household_id, store, ingredient, price, description, source_url, image_url, expiry_date, created_by)
  values (v_household_id, E'Trader Joe''s', 'Wild-caught salmon fillets', 8.99,
    'Previously frozen but flash-thawed today, needs to be cooked within 2 days.', null, null,
    current_date + interval '2 days', v_jae_id)
  returning id into v_list_id;

  insert into grocery_find_recipes (grocery_find_id, recipe_id) values (v_list_id, v_recipe_salmon);

  -- Weekly plan -------------------------------------------------------------

  insert into weekly_plans (household_id, chapter_title, weekly_memory, week_start_date)
  values (
    v_household_id,
    E'The Week We Tried Something New',
    'Fish tacos made Monday feel easy. We changed our minds twice, ate out once, and still ended the week around our own table.',
    date_trunc('week', current_date)::date
  )
  returning id into v_plan_id;

  insert into meal_cards (weekly_plan_id, day_index, recipe_id, state, note) values
    (v_plan_id, 0, v_recipe_tacos, 'cooked', null) returning id into v_meal_mon;
  insert into meal_cards (weekly_plan_id, day_index, recipe_id, state, note) values
    (v_plan_id, 1, v_recipe_sauce, 'planned', null) returning id into v_meal_tue;
  insert into meal_cards (weekly_plan_id, day_index, recipe_id, state, note) values
    (v_plan_id, 2, null, 'eating_out', E'Date night at Luna''s');
  insert into meal_cards (weekly_plan_id, day_index, recipe_id, state, note) values
    (v_plan_id, 3, v_recipe_friedrice, 'planned', null) returning id into v_meal_thu;
  insert into meal_cards (weekly_plan_id, day_index, recipe_id, state, note) values
    (v_plan_id, 4, v_recipe_salmon, 'replaced', 'Swapped for leftovers, too tired to cook') returning id into v_meal_fri;
  insert into meal_cards (weekly_plan_id, day_index, recipe_id, state, note) values
    (v_plan_id, 5, v_recipe_katsu, 'planned', null) returning id into v_meal_sat;
  insert into meal_cards (weekly_plan_id, day_index, recipe_id, state, note) values
    (v_plan_id, 6, null, 'skipped', E'Potluck at the Kims'' — bringing dessert instead');

  -- Shopping list -----------------------------------------------------------

  insert into shopping_lists (weekly_plan_id) values (v_plan_id) returning id into v_list_id;

  insert into shopping_items (shopping_list_id, name, quantity, category, store, have_it, checked, substitution, source_meal_card_ids) values
    (v_list_id, 'Pork shoulder', '2 lb', 'Meat', 'Safeway', false, false, null, array[v_meal_tue]),
    (v_list_id, 'Crushed tomatoes', '28 oz can', 'Pantry', 'Safeway', true, false, null, array[v_meal_tue]),
    (v_list_id, 'Fresh basil', '1 bunch', 'Produce', 'Trader Joe''s', false, false, 'Dried basil works in a pinch', array[v_meal_tue]),
    (v_list_id, 'Firm tofu', '14 oz', 'Refrigerated', '99 Ranch', true, true, null, array[v_meal_thu]),
    (v_list_id, 'Frozen peas and carrots', '10 oz bag', 'Frozen', 'Target', false, false, null, array[v_meal_thu]),
    (v_list_id, 'Chicken thighs', '2 lb', 'Meat', 'Safeway', false, true, null, array[v_meal_sat]),
    (v_list_id, 'Panko breadcrumbs', '1 cup', 'Pantry', '99 Ranch', true, false, null, array[v_meal_sat]),
    (v_list_id, 'Curry roux cubes', '1 box', 'Pantry', '99 Ranch', false, false, null, array[v_meal_sat]);

  -- Cooking memories ----------------------------------------------------------

  insert into cooking_memories (household_id, recipe_id, date_cooked, members_present, photo_url, note, rating, would_make_again, changes_made, occasion) values
    (v_household_id, v_recipe_sauce, current_date - interval '52 days', array[v_mina_id, v_jae_id], null,
     'Let it simmer all afternoon while we half-watched a movie. The whole apartment smelled like Sunday. Jae had thirds.',
     5, 'yes', 'Added extra basil from the balcony plant', 'Sunday family dinner');

  insert into cooking_memories (household_id, recipe_id, date_cooked, members_present, photo_url, note, rating, would_make_again, changes_made, occasion) values
    (v_household_id, v_recipe_salmon, current_date - interval '18 days', array[v_jae_id], null,
     'Broiler ran a little hot and the edges went almost-too-dark, but that''s honestly the best part. Ten minutes start to finish on a Tuesday.',
     4, 'yes', 'Used the broiler instead of a pan', 'Weeknight dinner, just Jae home');

  insert into cooking_memories (household_id, recipe_id, date_cooked, members_present, photo_url, note, rating, would_make_again, changes_made, occasion) values
    (v_household_id, v_recipe_sauce, current_date - interval '9 days', array[v_mina_id, v_jae_id], null,
     'Made it again for Mina''s birthday because she asked for "the sauce, obviously." Doubled the batch and froze half.',
     5, 'yes', 'Doubled the recipe, froze half for later', E'Mina''s birthday');
end $$;
