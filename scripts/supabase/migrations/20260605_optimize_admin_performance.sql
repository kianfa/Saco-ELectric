-- Performance support for the current admin-products query pattern.
-- Safe, non-destructive migration. Review and apply manually after a backup.
--
-- /admin/products joins product_images by product_id and orders images by the
-- existing sort_order metadata in application code. This index avoids repeated
-- scans of product_images as the catalogue grows.

create index if not exists idx_product_images_product_id_sort_order
  on public.product_images (product_id, sort_order);
