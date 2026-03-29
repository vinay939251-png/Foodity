from django.core.management.base import BaseCommand
from recipes.models import Recipe
from django.db.models import Case, When, Q, Value, BooleanField, Count

class Command(BaseCommand):
    help = 'Bulk update is_complete status for all recipes'

    def handle(self, *args, **options):
        self.stdout.write('Calculating completeness for all recipes...')
        
        # We use a similar logic as the previous annotation to batch update
        # has_image = bool(image)
        # ing_count = count(ingredients)
        # step_count = count(steps)
        
        recipes = Recipe.objects.annotate(
            ing_count=Count('ingredients', distinct=True),
            step_count=Count('steps', distinct=True)
        )
        
        total = recipes.count()
        self.stdout.write(f'Processing {total} recipes...')
        
        count = 0
        batch_size = 1000
        to_update = []
        
        for recipe in recipes.iterator():
            has_image = bool(recipe.image)
            is_complete = has_image and recipe.ing_count > 0 and recipe.step_count > 0
            
            if recipe.is_complete != is_complete:
                recipe.is_complete = is_complete
                to_update.append(recipe)
            
            count += 1
            if len(to_update) >= batch_size:
                Recipe.objects.bulk_update(to_update, ['is_complete'])
                to_update = []
                self.stdout.write(f'  Updated {count}/{total}...')
                
        if to_update:
            Recipe.objects.bulk_update(to_update, ['is_complete'])
            
        self.stdout.write(self.style.SUCCESS(f'Successfully updated completeness for {total} recipes'))
