"""
Management command to import recipes from CSV dataset.
Supports the Kaggle 30k recipes dataset.

Usage:
    python manage.py import_recipes
    python manage.py import_recipes --file path/to/recipes.csv
    python manage.py import_recipes --limit 100   # Import first 100 only
    python manage.py import_recipes --clear        # Clear existing before import
"""

import csv
import re
import os
import json
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction
from recipes.models import Recipe, Ingredient, RecipeStep, Nutrition


def parse_time_to_minutes(time_str):
    """Parse time string like 'PT1H30M' or '90 mins' to minutes."""
    if not time_str or time_str in ('', 'NA', 'N/A', 'nan'):
        return 0

    time_str = str(time_str).strip()

    # Handle ISO 8601 duration: PT1H30M, PT45M, PT2H
    iso_match = re.match(r'PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?', time_str, re.IGNORECASE)
    if iso_match:
        hours = int(iso_match.group(1) or 0)
        minutes = int(iso_match.group(2) or 0)
        return hours * 60 + minutes

    # Handle plain number (assume minutes)
    try:
        return int(float(time_str))
    except (ValueError, TypeError):
        pass

    # Handle "X mins", "X minutes", "X hours"
    min_match = re.search(r'(\d+)\s*(?:min|minute)', time_str, re.IGNORECASE)
    hr_match = re.search(r'(\d+)\s*(?:hr|hour)', time_str, re.IGNORECASE)
    total = 0
    if hr_match:
        total += int(hr_match.group(1)) * 60
    if min_match:
        total += int(min_match.group(1))
    return total if total > 0 else 0


def parse_ingredient_line(line):
    """Parse a single ingredient string into name, quantity, unit."""
    line = str(line).strip()
    if not line:
        return None

    # Try: "2 cups flour", "1/2 tsp salt", "3 large eggs"
    match = re.match(
        r'^([\d/.\s]+)?\s*'
        r'(cups?|tbsp|tsp|teaspoons?|tablespoons?|oz|ounces?|lbs?|pounds?|'
        r'grams?|g|kg|ml|liters?|l|cloves?|pinch|dash|bunch|can|cans|'
        r'slices?|pieces?|large|medium|small|whole)?\s*'
        r'(?:of\s+)?(.+)',
        line, re.IGNORECASE
    )

    if match:
        quantity = (match.group(1) or '').strip()
        unit = (match.group(2) or '').strip()
        name = (match.group(3) or line).strip()
        return {'name': name, 'quantity': quantity, 'unit': unit}

    return {'name': line, 'quantity': '', 'unit': ''}


def parse_list_field(value):
    """Parse a field that could be a JSON array or a string with delimiters."""
    if not value or value in ('', 'NA', 'N/A', 'nan', '[]', 'c()'):
        return []

    value = str(value).strip()

    # Try JSON parse
    try:
        parsed = json.loads(value)
        if isinstance(parsed, list):
            return [str(item).strip() for item in parsed if str(item).strip()]
        return [str(parsed)]
    except (json.JSONDecodeError, TypeError):
        pass

    # Try R-style c("item1", "item2")
    c_match = re.match(r"c\((.*)\)", value, re.DOTALL)
    if c_match:
        inner = c_match.group(1)
        items = re.findall(r'"([^"]*)"', inner)
        return [item.strip() for item in items if item.strip()]

    # Fall back to splitting by newlines or common delimiters
    if '\n' in value:
        return [item.strip() for item in value.split('\n') if item.strip()]

    return [value.strip()] if value.strip() else []


def determine_difficulty(total_time):
    """Determine difficulty based on total cooking time."""
    if total_time <= 30:
        return 'easy'
    elif total_time <= 60:
        return 'medium'
    return 'hard'


def safe_float(value, default=0.0):
    """Safely convert to float."""
    try:
        result = float(value)
        return result if result >= 0 else default
    except (ValueError, TypeError):
        return default


class Command(BaseCommand):
    help = 'Import recipes from a CSV dataset into the database'

    def add_arguments(self, parser):
        parser.add_argument(
            '--file',
            type=str,
            default=None,
            help='Path to the CSV file (default: auto-detect in backend/data/)',
        )
        parser.add_argument(
            '--limit',
            type=int,
            default=None,
            help='Maximum number of recipes to import',
        )
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Clear existing recipes before importing',
        )
        parser.add_argument(
            '--batch-size',
            type=int,
            default=500,
            help='Batch size for bulk operations (default: 500)',
        )

    def handle(self, *args, **options):
        csv_file = options['file']
        limit = options['limit']
        batch_size = options['batch_size']

        from django.contrib.auth import get_user_model
        User = get_user_model()
        try:
            author = User.objects.get(username='vinay')
            self.stdout.write('Found existing superuser: vinay')
        except User.DoesNotExist:
            self.stdout.write('Creating superuser: vinay...')
            author = User.objects.create_superuser(
                username='vinay',
                email='vinay939251@gmail.com',
                password='admin12345',
            )
            self.stdout.write(self.style.SUCCESS('Superuser vinay created.'))

        from recipes.models import UserProfile
        author_profile, _ = UserProfile.objects.get_or_create(user=author)
        if not author_profile.display_name:
            author_profile.display_name = 'Vinay'
            author_profile.save()

        # Auto-detect CSV file in data/ directory
        if csv_file is None:
            data_dir = os.path.join(os.path.dirname(os.path.dirname(
                os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            )), 'data')
            csv_files = [
                f for f in os.listdir(data_dir)
                if f.endswith('.csv')
            ] if os.path.isdir(data_dir) else []

            if not csv_files:
                raise CommandError(
                    f'No CSV files found in {data_dir}. '
                    'Please download the dataset and place it in backend/data/'
                )
            csv_file = os.path.join(data_dir, csv_files[0])
            self.stdout.write(f'Auto-detected: {csv_file}')

        if not os.path.exists(csv_file):
            raise CommandError(f'File not found: {csv_file}')

        if options['clear']:
            self.stdout.write('Clearing existing recipes...')
            Recipe.objects.all().delete()
            self.stdout.write(self.style.SUCCESS('Cleared.'))

        self.stdout.write(f'Reading {csv_file}...')
        self.import_recipes(csv_file, limit, batch_size, author_profile)

    def import_recipes(self, csv_file, limit, batch_size, author):
        """Import recipes from CSV with deduplication and batch inserts."""

        # Track existing titles for deduplication
        existing_titles = set(
            Recipe.objects.values_list('title', flat=True)
        )
        self.stdout.write(f'Found {len(existing_titles)} existing recipes')

        imported_count = 0
        skipped_count = 0
        error_count = 0

        # Read CSV with flexible encoding
        try:
            with open(csv_file, 'r', encoding='utf-8') as f:
                reader = csv.DictReader(f)
                fieldnames = reader.fieldnames
                self.stdout.write(f'CSV columns: {fieldnames}')
                rows = list(reader)
        except UnicodeDecodeError:
            with open(csv_file, 'r', encoding='latin-1') as f:
                reader = csv.DictReader(f)
                fieldnames = reader.fieldnames
                self.stdout.write(f'CSV columns: {fieldnames}')
                rows = list(reader)

        if limit:
            rows = rows[:limit]

        self.stdout.write(f'Processing {len(rows)} rows...')

        # Map common column name variations
        col_map = self._detect_columns(fieldnames)
        self.stdout.write(f'Column mapping: {col_map}')

        # Process in batches
        for batch_start in range(0, len(rows), batch_size):
            batch_rows = rows[batch_start:batch_start + batch_size]
            recipes_to_create = []
            recipe_extras = []  # Store ingredients/steps/nutrition per recipe

            for row in batch_rows:
                try:
                    title = self._get_field(row, col_map, 'title', '').strip()
                    if not title:
                        skipped_count += 1
                        continue

                    # Deduplication
                    if title.lower() in {t.lower() for t in existing_titles}:
                        skipped_count += 1
                        continue

                    # Parse times
                    prep_time = parse_time_to_minutes(
                        self._get_field(row, col_map, 'prep_time', '0')
                    )
                    cook_time = parse_time_to_minutes(
                        self._get_field(row, col_map, 'cook_time', '0')
                    )
                    total_time = parse_time_to_minutes(
                        self._get_field(row, col_map, 'total_time', '0')
                    )
                    if total_time == 0 and (prep_time + cook_time) > 0:
                        total_time = prep_time + cook_time

                    # Parse description
                    description = self._get_field(row, col_map, 'description', '')

                    # Parse servings
                    servings_str = self._get_field(row, col_map, 'servings', '1')
                    try:
                        servings = max(1, int(float(re.sub(r'[^\d.]', '', servings_str or '1') or '1')))
                    except (ValueError, TypeError):
                        servings = 1

                    # Rating
                    rating = safe_float(self._get_field(row, col_map, 'rating', '0'))
                    rating = min(5.0, max(0.0, rating))

                    # Image
                    image = self._get_field(row, col_map, 'image', '')

                    recipe = Recipe(
                        title=title[:300],
                        author=author,
                        image=image[:500] if image else '',
                        description=description[:2000] if description else '',
                        servings=servings,
                        prep_time=prep_time,
                        cook_time=cook_time,
                        total_time=total_time,
                        difficulty=determine_difficulty(total_time),
                        rating=rating,
                    )
                    recipes_to_create.append(recipe)
                    existing_titles.add(title)

                    # Parse extras for later creation
                    ingredients_raw = parse_list_field(
                        self._get_field(row, col_map, 'ingredients', '')
                    )
                    steps_raw = parse_list_field(
                        self._get_field(row, col_map, 'steps', '')
                    )
                    calories = safe_float(self._get_field(row, col_map, 'calories', '0'))
                    protein = safe_float(self._get_field(row, col_map, 'protein', '0'))
                    carbs = safe_float(self._get_field(row, col_map, 'carbs', '0'))
                    fats = safe_float(self._get_field(row, col_map, 'fats', '0'))

                    recipe_extras.append({
                        'ingredients': ingredients_raw,
                        'steps': steps_raw,
                        'nutrition': {
                            'calories': calories,
                            'protein': protein,
                            'carbs': carbs,
                            'fats': fats,
                        },
                    })

                except Exception as e:
                    error_count += 1
                    if error_count <= 10:
                        self.stderr.write(f'Error on row: {e}')
                    continue

            # Bulk create recipes
            if recipes_to_create:
                with transaction.atomic():
                    # Bulk create doesn't set PKs on MySQL when ignore_conflicts=True
                    Recipe.objects.bulk_create(
                        recipes_to_create, ignore_conflicts=True
                    )

                    # Fetch the recipes back from DB to get their PKs
                    titles_in_batch = [r.title for r in recipes_to_create]
                    fetched_recipes = Recipe.objects.filter(title__in=titles_in_batch)
                    
                    # Create a map of title to recipe instance
                    recipe_title_map = {r.title: r for r in fetched_recipes}

                    # Now create related objects
                    ingredients_to_create = []
                    steps_to_create = []
                    nutrition_to_create = []

                    # We use the original recipes_to_create to align with recipe_extras
                    for recipe_stub, extras in zip(recipes_to_create, recipe_extras):
                        # Get the real recipe instance from DB
                        real_recipe = recipe_title_map.get(recipe_stub.title)
                        
                        if not real_recipe or not real_recipe.pk:
                            continue

                        # Ingredients
                        for i, ing_raw in enumerate(extras['ingredients']):
                            parsed = parse_ingredient_line(ing_raw)
                            if parsed:
                                ingredients_to_create.append(Ingredient(
                                    recipe=real_recipe,
                                    name=parsed['name'][:200],
                                    quantity=parsed['quantity'][:50],
                                    unit=parsed['unit'][:50],
                                    order=i,
                                ))

                        # Steps
                        for i, step_raw in enumerate(extras['steps']):
                            if step_raw.strip():
                                steps_to_create.append(RecipeStep(
                                    recipe=real_recipe,
                                    step_number=i + 1,
                                    instruction=step_raw.strip(),
                                ))

                        # Nutrition
                        nutr = extras['nutrition']
                        if any(v > 0 for v in nutr.values()):
                            nutrition_to_create.append(Nutrition(
                                recipe=real_recipe,
                                **nutr,
                            ))

                    if ingredients_to_create:
                        Ingredient.objects.bulk_create(ingredients_to_create, ignore_conflicts=True)
                    if steps_to_create:
                        RecipeStep.objects.bulk_create(steps_to_create, ignore_conflicts=True)
                    if nutrition_to_create:
                        Nutrition.objects.bulk_create(nutrition_to_create, ignore_conflicts=True)

                    imported_count += len(fetched_recipes)

            self.stdout.write(
                f'  Batch {batch_start // batch_size + 1}: '
                f'{len(recipes_to_create)} imported'
            )

        self.stdout.write(self.style.SUCCESS(
            f'\nImport complete! '
            f'Imported: {imported_count}, '
            f'Skipped (duplicates): {skipped_count}, '
            f'Errors: {error_count}'
        ))

    def _detect_columns(self, fieldnames):
        """Auto-detect column names from the CSV header."""
        col_map = {}
        if not fieldnames:
            return col_map

        lower_fields = {f.lower().strip(): f for f in fieldnames}

        mappings = {
            'title': ['title', 'name', 'recipe_name', 'recipename', 'recipe name'],
            'description': ['description', 'desc', 'summary', 'recipe_description'],
            'image': ['image', 'images', 'image_url', 'img', 'photo', 'picture'],
            'prep_time': ['prep_time', 'preptime', 'preparation_time', 'prep time',
                          'preparationtime', 'prepmin'],
            'cook_time': ['cook_time', 'cooktime', 'cooking_time', 'cook time',
                          'cookingtime', 'cookmin'],
            'total_time': ['total_time', 'totaltime', 'total time', 'totalmin'],
            'servings': ['servings', 'serves', 'yield', 'recipe_servings', 'recipeyield'],
            'rating': ['rating', 'rate', 'aggregatedrating', 'avg_rating', 'stars'],
            'ingredients': ['ingredients', 'ingredient', 'recipeingredient',
                            'ingredientparts', 'recipe_ingredients'],
            'steps': ['steps', 'directions', 'instructions', 'recipeinstructions',
                      'recipe_instructions', 'method'],
            'calories': ['calories', 'cal', 'kcal', 'energy'],
            'protein': ['protein', 'protein_g', 'proteincontentg', 'proteincontent'],
            'carbs': ['carbs', 'carbohydrates', 'carbohydrates_g', 'carbohydratecontent', 'carb'],
            'fats': ['fats', 'fat', 'fat_g', 'fatcontent', 'totalfat'],
        }

        for key, aliases in mappings.items():
            for alias in aliases:
                if alias in lower_fields:
                    col_map[key] = lower_fields[alias]
                    break

        return col_map

    def _get_field(self, row, col_map, key, default=''):
        """Get a field value using the column map."""
        col_name = col_map.get(key)
        if col_name and col_name in row:
            val = row[col_name]
            if val is None or str(val).strip().lower() in ('nan', 'na', 'n/a', ''):
                return default
            return str(val).strip()
        return default
