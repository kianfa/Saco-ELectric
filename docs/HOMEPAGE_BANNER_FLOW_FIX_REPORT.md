# Homepage banner flow fix

The admin banner form now submits an explicit `isActive` hidden value instead of relying on the UI switch primitive to serialize a form value. The Server Action accepts normalized truthy values and stores blank scheduling fields as `null`.

Banner start and end values are normalized to ISO timestamps before persistence, and invalid ranges are rejected with a Persian validation message.

The public homepage query remains intentionally uncached because visibility depends on the current time. It filters by `homepage_promo`, `is_active`, and nullable start/end windows. Create, update, and delete mutations revalidate `/` so active banners appear immediately.

Set `DEBUG_PERFORMANCE=true` temporarily to print the final public banner result summary without exposing filesystem paths or secrets.
