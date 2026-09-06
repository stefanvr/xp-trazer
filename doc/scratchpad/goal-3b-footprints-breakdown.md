# Goal 3b — an element occupies more than one cell

The breakdown is empty: every task it held is implemented.

## Findings, for the owner

- **Room 29 of the original places two elements on one cell** — a duplicated brick, two bricks
  overlapping by one cell, and a solid block on a brick. It is why DS-4.4 says what happens when a
  level does this, and it is the one room the suite expects to be refused for it.
- **A room is no longer unplayable for its footprints.** What still stands between the imported rooms
  and being played is DS-7.1 (kinds with no behaviour), DS-7.4 (an authored ball start), DS-7.5 (a
  bat free on both sides) and DS-1.8 (no destructible element the rules read — a consequence of
  DS-7.1 in rooms whose only bricks are traps and generators). Goal 4 is where those are answered.
