# RC2_IMPORT_BLOCKED

> `import` statements are not allowed in RaamCode.

## What it means

RaamCode strategies cannot import any module — neither the Python standard library nor third-party packages. RaamCode refuses every `import` and `from ... import` statement.

## Why

Three reasons:

1. **Determinism.** Imported modules can read the environment, make network calls, or have version-specific behaviour. None of those are safe in a strategy that must produce identical results in backtest, paper, and live.
2. **Isolation.** Strategies share infrastructure. An `import` that could pull arbitrary code defeats the entire sandbox.
3. **Reviewability.** A strategy that's a few classes and arithmetic is auditable. One that imports `random`, `requests`, or `numpy` is not.

## How to fix it

Every common motivation for an `import` has a RaamCode replacement:

| You wrote | Use this instead |
|---|---|
| `import numpy as np` for `np.mean`, `np.std` | Built-in `sum(series) / len(series)` and `series.stddev()` inside a custom indicator. |
| `import math` for `math.sqrt`, `math.log` | Most needs are covered by `abs`, `min`, `max`, `**`. For sqrt: `x ** 0.5`. |
| `import datetime` to read the date | `self.bar_count` for bar index; sessions handle wall-clock. |
| `from typing import List` | RaamCode is untyped at the source level. Drop the import. |
| `import random` | Strategies must be deterministic. There's no random API by design. |

For numerical work inside an indicator, use `Series` + custom `Indicator` subclass — see [Custom Indicators](../language/custom-indicators).

## Common patterns

```raamcode
# ❌
import numpy as np
from math import sqrt

class Bad(Strategy):
    ...

# ✅
class Good(Strategy):
    trade = Symbol()
    sizing = FixedCapital()

    def execute(self):
        sma = SMA(20, on=self.trade)
        sd = StdDev(20, on=self.trade)
        # Bollinger bands without numpy
        upper = sma.value + 2 * sd.value
        lower = sma.value - 2 * sd.value
```

## Related

- [Python Subset](../language/python-subset)
- [Sandbox](../concepts/sandbox)
