-- Optional data migration: update public site contact defaults stored in site_settings.
-- Run this in Supabase SQL Editor if old placeholder contact information was already saved in admin settings.

insert into site_settings (key, value)
values (
  'contact_info',
  jsonb_build_object(
    'phone', '04135578876',
    'supportPhone', '09382073007',
    'telegramUsername', '@electro_saco',
    'telegramPhone', '09382073007',
    'balePhone', '09382073007',
    'workingHours', 'شنبه تا چهارشنبه، ۹ تا ۱۷',
    'channels', jsonb_build_array('واتساپ', 'بله', 'روبیکا', 'تلگرام')
  )
)
on conflict (key) do update
set value = site_settings.value || excluded.value,
    updated_at = now();

insert into site_settings (key, value)
values (
  'footer_info',
  jsonb_build_object(
    'description', 'ساکو الکتریک؛ مرجع تخصصی تجهیزات برق صنعتی با ارائه محصولات اصل، قیمت رقابتی و پشتیبانی فنی تخصصی.',
    'copyright', '© ساکو الکتریک. تمامی حقوق این سایت محفوظ است.',
    'telegramUrl', 'https://t.me/electro_saco'
  )
)
on conflict (key) do update
set value = site_settings.value || excluded.value,
    updated_at = now();

insert into site_settings (key, value)
values (
  'manual_checkout',
  jsonb_build_object(
    'explanationText', 'برای نهایی‌سازی سفارش، لطفاً از سبد خرید یا خلاصه سفارش خود اسکرین‌شات تهیه کرده و از طریق تلگرام، واتساپ، بله یا روبیکا برای پشتیبانی ارسال کنید. کارشناسان فروش پس از بررسی موجودی کالا، تأیید قیمت نهایی و هماهنگی شرایط ارسال، اطلاعات پرداخت کارت‌به‌کارت را در اختیار شما قرار می‌دهند. پس از پرداخت، سفارش شما در سریع‌ترین زمان ممکن آماده پردازش و ارسال خواهد شد.',
    'helperText', 'اسکرین‌شات سبد خرید خود را از طریق تلگرام، واتساپ، بله یا روبیکا ارسال کنید تا موجودی، قیمت نهایی و شرایط ارسال توسط کارشناسان ما تأیید شود. پس از تأیید، اطلاعات کارت‌به‌کارت برای تکمیل خرید ارسال خواهد شد.',
    'onlinePaymentDisabledText', 'در حال حاضر پرداخت مستقیم اینترنتی فعال نیست و به‌زودی اضافه خواهد شد.'
  )
)
on conflict (key) do update
set value = site_settings.value || excluded.value,
    updated_at = now();
