Enable offline mode

- only enable on secure context (when running in standalone mode)
- both static resources and data
- static resource
  - services worker
    - css/js/font: hash and cache-first
    - html: stale while revalidate
    - api: no cache, only network
- data
  - different user, difference database: `baby:${userId}`
  - global store:
    - store current user
  - user store
    - Records
    - friends
    - discoveries
