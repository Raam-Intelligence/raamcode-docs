# Persistent State

State that lives across bars and survives crashes / restarts. Two declaration surfaces:

1. **Class body** — declare next to `Param()` and `Symbol()` with a literal initial value. The canonical surface for collections and the recommended one for scalars when the initial value matters.
2. **Execute()-body discovery** — write `self.xxx = …` for the first time and the type is inferred from the right-hand side. Works for scalars only; lists and dicts MUST be declared in the class body.

```raamcode
class RollingHighs(Strategy):
    trade = Symbol()
    sizing = FixedCapital()

    # ── Class-body persistent state ──
    position_size = 100                        # int scalar
    ath = 0.0                                  # decimal scalar (explicit initial value)
    nq_highs = [0.0]*5                         # list — 5-slot rolling buffer of decimals
    counts = {"up": 0, "down": 0}              # dict<string, int>

    def execute(self):
        # Execute-body scalar discovery still works for back-compat:
        if self.trade.close > self.trade.open:
            self.up_count = self.up_count + 1  # int, auto-inits to 0
        else:
            self.up_count = 0

        # Index reads + writes on class-body collections:
        for i in range(4):
            self.nq_highs[i] = self.nq_highs[i+1]
        self.nq_highs[4] = self.trade.high

        # Augmented assignment + dict-key writes:
        if self.trade.close > self.trade.open:
            self.counts["up"] += 1
        else:
            self.counts["down"] += 1
```

## Allowed types

| Kind | Types | Where declared |
|---|---|---|
| **Scalar** | `int`, `float` (→ `decimal`), `bool`, `str` | Class body OR execute()-body |
| **List** | `list[int]`, `list[float]`, `list[bool]`, `list[str]` | Class body only |
| **Dict** | `dict[str, int]`, `dict[str, float]`, `dict[str, bool]`, `dict[str, str]` | Class body only |

Elements within a list (or values within a dict) must all share the same type. Mixed-type literals are rejected.

## Scalar declaration

Two ways. They produce the same persistent slot:

```raamcode
# Form A — class body, explicit initial value
class Counter(Strategy):
    trade = Symbol()
    sizing = FixedCapital()
    up_count = 0          # ← declared, initial value 0

    def execute(self):
        if self.trade.close > self.trade.open:
            self.up_count = self.up_count + 1

# Form B — execute()-body discovery, auto-init to type-default
class Counter(Strategy):
    trade = Symbol()
    sizing = FixedCapital()

    def execute(self):
        # First read of self.up_count returns 0 (int default).
        # First write declares the slot as int.
        if self.trade.close > self.trade.open:
            self.up_count = self.up_count + 1
```

Form A is preferred when the initial value matters (e.g., `position_size = 100`, `peak = 0.0`). Form B is convenient for counters that genuinely start at zero.

**Auto-init defaults** for execute()-discovered scalars: `int=0`, `float=0.0`, `bool=False`, `str=""`.

## List declaration

Lists live in the class body. Two literal forms:

```raamcode
# Explicit element list
nq_highs = [0.0, 0.0, 0.0, 0.0, 0.0]

# [<literal>]*N shortcut — N copies of the literal
nq_highs = [0.0]*5

# Mixed element types not allowed
weird = [1, 2.0]                # ❌ RC2_STATE_MIXED

# Nested collections not allowed
nested = [[1, 2], [3, 4]]       # ❌ RC2_STATE_NESTED

# Bare empty literal — element type can't be inferred
empty = []                      # ❌ RC2_STATE_EMPTY_LIST  →  use [0.0]*0 instead
```

### Operations on lists in v1

| Operation | Syntax |
|---|---|
| Read | `self.nq_highs[i]` |
| Write | `self.nq_highs[i] = expr` |
| Augmented assignment | `self.nq_highs[i] += expr`  (index evaluated once) |
| Length | `len(self.nq_highs)` |
| Iteration | `for x in self.nq_highs:` |
| **Rebind in execute()** | ❌ `self.nq_highs = […]` → `RC2_STATE_REBIND_COLLECTION` |

## Dict declaration

Dicts live in the class body. Keys are string literals; values are homogeneous-type scalars:

```raamcode
counts = {"up": 0, "down": 0}                 # string keys, int values
stops = {"initial": 99.5, "trailing": 101.0}  # string keys, decimal values

# Non-string keys not allowed
bad = {1: "a"}                                # ❌ RC2_STATE_DICT_KEY

# Mixed value types not allowed
weird = {"a": 1, "b": True}                   # ❌ RC2_STATE_MIXED

# Bare empty literal — value type can't be inferred
empty = {}                                    # ❌ RC2_STATE_EMPTY_DICT  →  declare with one entry and clear it
```

### Operations on dicts in v1

| Operation | Syntax |
|---|---|
| Read | `self.counts["up"]` |
| Write | `self.counts["up"] = expr` |
| Augmented assignment | `self.counts["up"] += expr`  (key evaluated once) |
| Length | `len(self.counts)` |
| Iteration | `for k in self.counts:` — iterates keys (Python default) |
| **Rebind in execute()** | ❌ `self.counts = {…}` → `RC2_STATE_REBIND_COLLECTION` |

## Name-collision rules

A state variable name cannot shadow:

- A `Param` — `RC2_STATE_PARAM_CLASH`
- A `Symbol` — `RC2_STATE_SYMBOL_CLASH`
- A reserved strategy property (`capital`, `initial_capital`, `bar_count`, `ready`) — `RC2_STATE_RESERVED`
- Another persistent state name — `RC2_STATE_DUPLICATE`

## Writing state from helpers

Helpers can READ all state freely. WRITES split by mechanism:

- **Scalar rebind** is rejected with `RC2_HELPER_STATE_WRITE`. Helpers receive `state` by value, so `self.x = expr` mutates a local copy that doesn't propagate back to the caller — a quiet footgun.
- **Index / key writes** on lists and dicts are allowed because they mutate through the shared slot reference. The change propagates.

```raamcode
class Counter(Strategy):
    trade = Symbol()
    sizing = FixedCapital()
    bullish_bars = 0                 # scalar
    recent_highs = [0.0]*5            # list

    def execute(self):
        if self.trade.is_flat and self.should_enter():
            self.buy(self.trade)
        self.shift_in_high()          # helper that mutates the list — OK

    def should_enter(self):
        if self.trade.close > self.trade.open:
            self.bullish_bars = self.bullish_bars + 1   # ❌ RC2_HELPER_STATE_WRITE
            return self.bullish_bars >= 3
        return False

    def shift_in_high(self):
        for i in range(4):
            self.recent_highs[i] = self.recent_highs[i+1]   # ✅ propagates
        self.recent_highs[4] = self.trade.high              # ✅ propagates
```

Move scalar writes to `execute()`. For collections, helpers are fine.

## Initial values vs. auto-init

For class-body declarations: the literal is the initial value. RaamCode seeds the slot with it once on the first ready bar — and again at the start of every walk-forward window.

For execute()-body discovered scalars: the first read returns the type-default (`int=0`, `float=0.0`, `bool=False`, `str=""`) — exactly what RaamCode used to do before class-body declarations existed.

## Walk-forward and state

When the optimizer runs walk-forward (multiple consecutive windows), state **resets at the start of each window**:

- Class-body initializers re-run for every window (slots seeded back to the literal value).
- Execute()-body discovered scalars reset to the type-default.

Treat persistent state as "remembered within one continuous run" — not as a long-term store.

## Common diagnostics

| Code | What it means |
|---|---|
| `RC2_ASSIGN_LHS` | Left side of assignment isn't a valid state target. |
| [`RC2_STATE_REBIND_COLLECTION`](../errors/rc2-state-rebind-collection) | Cannot reassign a class-body-declared list or dict; mutate via index/key writes. |
| [`RC2_STATE_MIXED`](../errors/rc2-state-mixed) | List elements or dict values have mixed types. |
| [`RC2_STATE_NESTED`](../errors/rc2-state-nested) | Nested collections (list-of-lists, dict-of-dicts) are not allowed. |
| [`RC2_STATE_DICT_KEY`](../errors/rc2-state-dict-key) | Dict keys must be string literals. |
| [`RC2_STATE_EMPTY_LIST`](../errors/rc2-state-empty-list) | Bare `[]` can't infer an element type — use `[0.0]*0`. |
| [`RC2_STATE_EMPTY_DICT`](../errors/rc2-state-empty-dict) | Bare `{}` can't infer a value type — declare with one entry. |
| [`RC2_STATE_DECL_REQUIRED`](../errors/rc2-state-decl-required) | Lists and dicts must be declared in the class body. |
| [`RC2_STATE_AUGASSIGN_UNINIT`](../errors/rc2-state-augassign-uninit) | Augmented assignment requires the state to be declared first. |
| [`RC2_STATE_SYMBOL_CLASH`](../errors/rc2-state-symbol-clash) | State variable shadows a Symbol. |
| `RC2_STATE_PARAM_CLASH` | State variable shadows a Param. |
| `RC2_STATE_RESERVED` | State variable shadows a reserved property. |
| `RC2_STATE_DUPLICATE` | The same state name is declared twice in the class body. |
| `RC2_HELPER_STATE_WRITE` | Helper method tried to rebind scalar state — move the assignment to `execute()`. |
| `RC2_STATE_TYPE_REASSIGN` | The state's type was changed after its first declaration. |

## Deferred to follow-up ADRs

- `append` / `pop` / slicing on lists (growable lists)
- `.items()` / `.keys()` / `.values()` on dicts
- `in` operator for dict-key membership
- Nested collections
- Non-string dict keys
