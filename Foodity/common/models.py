from django.db import models

# Create your models here.


class BaseModel(models.Model):
    """
    An abstract base class that provides self-updating
    'created_at' and 'updated_at' fields for every model.
    """
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True # This tells Django NOT to create a table for this model
