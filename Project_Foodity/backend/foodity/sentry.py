import os
import sentry_sdk
from sentry_sdk.integrations.django import DjangoIntegration

def init_sentry():
    sentry_dsn = os.environ.get('SENTRY_DSN')
    # If SENTRY_DSN is not provided, sentry_sdk will just silently pass (no-op)
    # This ensures local development isn't broken when no DSN is present
    if sentry_dsn:
        sentry_sdk.init(
            dsn=sentry_dsn,
            integrations=[DjangoIntegration()],
            traces_sample_rate=1.0,
            send_default_pii=True
        )
