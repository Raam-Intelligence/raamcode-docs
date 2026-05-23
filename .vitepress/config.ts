import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'RaamCode',
  description: 'The Python-syntax DSL for automated trading',
  lang: 'en-US',
  // Project page: served at https://<org>.github.io/raamcode-docs/.
  // If you later move to a custom domain at the root, change this to '/'.
  base: '/raamcode-docs/',
  cleanUrls: true,
  lastUpdated: true,
  appearance: 'dark',

  head: [
    // href must include `base` (head links aren't auto-prefixed by VitePress)
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/raamcode-docs/favicon.svg' }],
    ['meta', { name: 'theme-color', content: '#f59e0b' }],
    ['meta', { property: 'og:title', content: 'RaamCode' }],
    ['meta', { property: 'og:description', content: 'The Python-syntax DSL for automated trading' }],
    ['meta', { property: 'og:type', content: 'website' }],
  ],

  markdown: {
    theme: { light: 'github-light', dark: 'github-dark' },
    lineNumbers: false,
    languageAlias: {
      raamcode: 'python',
    },
  },

  themeConfig: {
    // Symbol mark (matches the favicon) + "RaamCode" wordtext.
    siteTitle: 'RaamCode',
    logo: {
      light: '/raam-mark.svg',
      dark: '/raam-mark-dark.svg',
      alt: 'RaamCode',
    },

    nav: [
      { text: 'Get Started', link: '/docs/getting-started' },
      { text: 'Language', link: '/docs/language/overview' },
      { text: 'Indicators', link: '/docs/indicators/' },
      { text: 'Examples', link: '/docs/examples/' },
      { text: 'Errors', link: '/docs/errors/' },
      {
        text: 'Concepts',
        items: [
          { text: 'Execution Model', link: '/docs/concepts/execution-model' },
          { text: 'Warmup', link: '/docs/concepts/warmup' },
          { text: 'Sandbox', link: '/docs/concepts/sandbox' },
        ],
      },
    ],

    sidebar: {
      '/docs/': [
        {
          text: 'Get Started',
          items: [
            { text: 'Why RaamCode', link: '/docs/' },
            { text: 'Quickstart', link: '/docs/getting-started' },
          ],
        },
        {
          text: 'Language Reference',
          collapsed: false,
          items: [
            { text: 'Overview', link: '/docs/language/overview' },
            { text: 'Strategy Anatomy', link: '/docs/language/anatomy' },
            { text: 'Param()', link: '/docs/language/params' },
            { text: 'Symbol()', link: '/docs/language/symbols' },
            { text: 'Sizing', link: '/docs/language/sizing' },
            { text: 'Indicators', link: '/docs/language/indicators' },
            { text: 'Order Verbs', link: '/docs/language/order-verbs' },
            { text: 'Position Helpers', link: '/docs/language/position-helpers' },
            { text: 'OHLCV Access', link: '/docs/language/ohlcv' },
            { text: 'Exit Rules', link: '/docs/language/exit-rules' },
            { text: 'Strategy Properties', link: '/docs/language/strategy-properties' },
            { text: 'Persistent State', link: '/docs/language/persistent-state' },
            { text: 'For Loops', link: '/docs/language/for-loops' },
            { text: 'Helper Methods', link: '/docs/language/helper-methods' },
            { text: 'Custom Indicators', link: '/docs/language/custom-indicators' },
            { text: 'Sessions', link: '/docs/language/sessions' },
            { text: 'Python Subset', link: '/docs/language/python-subset' },
          ],
        },
        {
          text: 'Indicator Catalog',
          collapsed: false,
          items: [
            { text: 'Overview', link: '/docs/indicators/' },
            { text: 'SMA', link: '/docs/indicators/sma' },
            { text: 'EMA', link: '/docs/indicators/ema' },
            { text: 'RSI', link: '/docs/indicators/rsi' },
            { text: 'Momentum', link: '/docs/indicators/momentum' },
            { text: 'StdDev', link: '/docs/indicators/stddev' },
            { text: 'DMI', link: '/docs/indicators/dmi' },
          ],
        },
        {
          text: 'Examples',
          collapsed: false,
          items: [
            { text: 'Gallery', link: '/docs/examples/' },
            { text: 'Buy and Hold', link: '/docs/examples/buy-and-hold' },
            { text: 'MA Cross', link: '/docs/examples/ma-cross' },
            { text: 'RSI Mean Reversion', link: '/docs/examples/rsi-mean-reversion' },
            { text: 'Bollinger Bounce', link: '/docs/examples/bollinger-bounce' },
            { text: 'Rolling Channel Breakout', link: '/docs/examples/rolling-channel-breakout' },
            { text: 'SPY-Filtered Entries', link: '/docs/examples/multi-symbol-spy-filter' },
          ],
        },
        {
          text: 'Concepts',
          collapsed: false,
          items: [
            { text: 'Execution Model', link: '/docs/concepts/execution-model' },
            { text: 'Warmup', link: '/docs/concepts/warmup' },
            { text: 'Sandbox', link: '/docs/concepts/sandbox' },
          ],
        },
        {
          text: 'Error Reference',
          collapsed: false,
          items: [
            { text: 'Overview', link: '/docs/errors/' },
            { text: 'RC2_CLASS_BODY', link: '/docs/errors/rc2-class-body' },
            { text: 'RC2_NO_SYMBOL', link: '/docs/errors/rc2-no-symbol' },
            { text: 'RC2_NO_TRADE', link: '/docs/errors/rc2-no-trade' },
            { text: 'RC2_NO_SIZING', link: '/docs/errors/rc2-no-sizing' },
            { text: 'RC2_NO_EXECUTE', link: '/docs/errors/rc2-no-execute' },
            { text: 'RC2_IND_IN_BODY', link: '/docs/errors/rc2-ind-in-body' },
            { text: 'RC2_EXIT_NO_QTY', link: '/docs/errors/rc2-exit-no-qty' },
            { text: 'RC2_ENTRY_EXTRA_ARG', link: '/docs/errors/rc2-entry-extra-arg' },
            { text: 'RC2_OVERRIDE_INVALID', link: '/docs/errors/rc2-override-invalid' },
            { text: 'RC2_IMPORT_BLOCKED', link: '/docs/errors/rc2-import-blocked' },
            { text: 'RC2_CROSS_MULTIVALUE', link: '/docs/errors/rc2-cross-multivalue' },
            { text: 'RC2_UNKNOWN_INDICATOR', link: '/docs/errors/rc2-unknown-indicator' },
            { text: 'RC2_STATE_SYMBOL_CLASH', link: '/docs/errors/rc2-state-symbol-clash' },
            { text: 'RC2_STATE_MIXED', link: '/docs/errors/rc2-state-mixed' },
            { text: 'RC2_STATE_NESTED', link: '/docs/errors/rc2-state-nested' },
            { text: 'RC2_STATE_DICT_KEY', link: '/docs/errors/rc2-state-dict-key' },
            { text: 'RC2_STATE_EMPTY_LIST', link: '/docs/errors/rc2-state-empty-list' },
            { text: 'RC2_STATE_EMPTY_DICT', link: '/docs/errors/rc2-state-empty-dict' },
            { text: 'RC2_STATE_REBIND_COLLECTION', link: '/docs/errors/rc2-state-rebind-collection' },
            { text: 'RC2_STATE_DECL_REQUIRED', link: '/docs/errors/rc2-state-decl-required' },
            { text: 'RC2_STATE_AUGASSIGN_UNINIT', link: '/docs/errors/rc2-state-augassign-uninit' },
            { text: 'SDK010 — Blocked Type', link: '/docs/errors/sdk010' },
            { text: 'SDK011 — Blocked Namespace', link: '/docs/errors/sdk011' },
            { text: 'SDK012 — Blocked Builtin', link: '/docs/errors/sdk012' },
          ],
        },
      ],
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/Raam-Intelligence/raamcode-docs' },
    ],

    footer: {
      // internal hrefs include `base` (footer HTML isn't auto-prefixed by VitePress)
      message:
        'RaamCode — the strategy language for <a href="https://raamtrade.com" target="_blank" rel="noopener">raamtrade.com</a>. Released under a proprietary license. · <a href="/raamcode-docs/llms-full">Full text</a>',
      copyright: `© ${new Date().getFullYear()} Raam Intelligence Ltd. All rights reserved.`,
    },

    search: {
      provider: 'local',
      options: {
        detailedView: true,
      },
    },

    outline: {
      level: [2, 3],
      label: 'On this page',
    },

    editLink: {
      pattern: 'https://github.com/Raam-Intelligence/raamcode-docs/edit/main/:path',
      text: 'Edit this page on GitHub',
    },

    lastUpdated: {
      text: 'Updated',
    },

    docFooter: {
      prev: 'Previous',
      next: 'Next',
    },
  },
})
