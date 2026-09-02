-- A nullable boolean could not distinguish "maybe" from "not answered".
-- Cooking Memory now records the household's explicit yes/no/maybe response.
alter table cooking_memories
  alter column would_make_again type text
  using case
    when would_make_again is true then 'yes'
    when would_make_again is false then 'no'
    else 'maybe'
  end;

alter table cooking_memories
  alter column would_make_again set default 'maybe',
  alter column would_make_again set not null;

alter table cooking_memories
  add constraint cooking_memories_would_make_again_check
  check (would_make_again in ('yes', 'no', 'maybe'));
