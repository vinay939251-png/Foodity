"""
Management command to reformat all recipe ingredients and instructions.
- Converts paragraph-form ingredients into individual bullet-point items
- Converts US/imperial measurements to Indian metric (g, ml, L, kg, °C)
- Splits long instruction paragraphs into concise numbered steps

Usage:
    python manage.py reformat_recipes
    python manage.py reformat_recipes --limit 10
    python manage.py reformat_recipes --limit 5 --dry-run
    python manage.py reformat_recipes --offset 100 --limit 50
    python manage.py reformat_recipes --batch-size 10
"""

import json
import time
import google.generativeai as genai
from django.core.management.base import BaseCommand
from django.conf import settings
from django.db import transaction
from recipes.models import Recipe, Ingredient, RecipeStep


REFORMAT_PROMPT = """You are a recipe formatting assistant for an Indian cooking platform called Foodity.

I will give you a recipe's ingredients and instructions. Your job is to:

1. **INGREDIENTS**: Parse into individual items. Each item must have:
   - "name": ingredient name (clean, concise)
   - "quantity": numeric amount as a string (e.g. "250", "1/2", "2")
   - "unit": measurement unit in INDIAN METRIC SYSTEM. Convert as follows:
     - cups → ml (1 cup = 240 ml)
     - tablespoons/tbsp → ml (1 tbsp = 15 ml)  
     - teaspoons/tsp → ml (1 tsp = 5 ml)
     - ounces/oz → grams (1 oz = 28 g)
     - pounds/lbs → grams (1 lb = 454 g)
     - Fahrenheit → Celsius in instructions
     - Keep: grams, g, kg, ml, L, litres, pieces, whole, pinch, as needed, to taste
   - If the quantity or unit is unclear, leave them as empty strings
   - Remove any extra text like "finely chopped" from the unit — put preparation notes in the name (e.g. "onion, finely chopped")

2. **INSTRUCTIONS**: Split into individual, concise steps. Each step should be:
   - A single clear action (not a long paragraph)
   - If a paragraph contains multiple actions, split them
   - Convert any Fahrenheit temperatures to Celsius
   - Keep steps short and actionable

Return ONLY valid JSON (no markdown wrappers). Schema:
{
  "ingredients": [
    {"name": "onion, finely chopped", "quantity": "2", "unit": "pieces"},
    {"name": "oil", "quantity": "30", "unit": "ml"}
  ],
  "steps": [
    "Heat oil in a pan over medium heat.",
    "Add chopped onions and sauté until golden brown.",
    "Add spices and cook for 2 minutes."
  ]
}

Here is the recipe data:

TITLE: {title}

INGREDIENTS:
{ingredients}

INSTRUCTIONS:
{instructions}
"""


class Command(BaseCommand):
    help = 'Reformat recipe ingredients (bullet points + Indian metric) and instructions (numbered steps) using Gemini AI'

    def add_arguments(self, parser):
        parser.add_argument('--limit', type=int, default=None, help='Max recipes to process')
        parser.add_argument('--offset', type=int, default=0, help='Skip first N recipes (for resuming)')
        parser.add_argument('--batch-size', type=int, default=5, help='Recipes per Gemini API batch')
        parser.add_argument('--dry-run', action='store_true', help='Preview without saving')
        parser.add_argument('--recipe-id', type=int, default=None, help='Process a single recipe by ID')

    def handle(self, *args, **options):
        api_key = settings.GEMINI_API_KEY
        if not api_key:
            self.stderr.write(self.style.ERROR('GEMINI_API_KEY not set in settings.'))
            return

        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel('gemini-2.5-flash')

        limit = options['limit']
        offset = options['offset']
        batch_size = options['batch_size']
        dry_run = options['dry_run']
        recipe_id = options['recipe_id']

        if recipe_id:
            recipes = Recipe.objects.filter(pk=recipe_id)
        else:
            recipes = Recipe.objects.all().order_by('id')

        if offset:
            recipes = recipes[offset:]
        if limit:
            recipes = recipes[:limit]

        recipe_list = list(recipes.prefetch_related('ingredients', 'steps'))
        total = len(recipe_list)
        self.stdout.write(f'Processing {total} recipes (dry_run={dry_run})...\n')

        success = 0
        failed = 0

        for i in range(0, total, batch_size):
            batch = recipe_list[i:i + batch_size]
            for recipe in batch:
                try:
                    result = self._reformat_recipe(recipe, dry_run)
                    if result:
                        success += 1
                    else:
                        failed += 1
                except Exception as e:
                    failed += 1
                    self.stderr.write(f'  ERROR [{recipe.id}] {recipe.title[:50]}: {e}')

            self.stdout.write(f'  Progress: {min(i + batch_size, total)}/{total} '
                              f'(success={success}, failed={failed})')

            # Rate limiting: ~15 requests/min on free tier
            if i + batch_size < total:
                time.sleep(4)

        self.stdout.write(self.style.SUCCESS(
            f'\nDone! Success: {success}, Failed: {failed}, Total: {total}'
        ))

    def _reformat_recipe(self, recipe, dry_run):
        """Reformat a single recipe using Gemini AI."""
        ingredients = list(recipe.ingredients.order_by('order'))
        steps = list(recipe.steps.order_by('step_number'))

        if not ingredients and not steps:
            self.stdout.write(f'  SKIP [{recipe.id}] {recipe.title[:50]} — no ingredients/steps')
            return True

        # Build current text representations
        ing_text = '\n'.join(
            f'- {ing.quantity} {ing.unit} {ing.name}'.strip()
            for ing in ingredients
        ) if ingredients else '(none)'

        steps_text = '\n'.join(
            f'{step.step_number}. {step.instruction}'
            for step in steps
        ) if steps else '(none)'

        # Call Gemini
        prompt = REFORMAT_PROMPT.format(
            title=recipe.title,
            ingredients=ing_text,
            instructions=steps_text,
        )

        try:
            response = self.model.generate_content(
                prompt,
                generation_config=genai.types.GenerationConfig(temperature=0.2),
            )
            text = response.text.strip()

            # Clean markdown wrappers
            if text.startswith('```json'):
                text = text[7:]
            if text.startswith('```'):
                text = text[3:]
            if text.endswith('```'):
                text = text[:-3]

            data = json.loads(text.strip())
        except json.JSONDecodeError:
            self.stderr.write(f'  BAD JSON [{recipe.id}] {recipe.title[:50]}')
            return False
        except Exception as e:
            self.stderr.write(f'  API ERROR [{recipe.id}] {recipe.title[:50]}: {e}')
            return False

        new_ingredients = data.get('ingredients', [])
        new_steps = data.get('steps', [])

        if not new_ingredients and not new_steps:
            self.stderr.write(f'  EMPTY [{recipe.id}] {recipe.title[:50]}')
            return False

        if dry_run:
            self.stdout.write(f'\n  [DRY RUN] Recipe: {recipe.title[:60]}')
            self.stdout.write(f'  Ingredients ({len(new_ingredients)}):')
            for ing in new_ingredients[:5]:
                self.stdout.write(f"    • {ing.get('quantity', '')} {ing.get('unit', '')} {ing.get('name', '')}")
            if len(new_ingredients) > 5:
                self.stdout.write(f'    ... and {len(new_ingredients) - 5} more')
            self.stdout.write(f'  Steps ({len(new_steps)}):')
            for j, step in enumerate(new_steps[:3], 1):
                self.stdout.write(f'    {j}. {step[:80]}')
            if len(new_steps) > 3:
                self.stdout.write(f'    ... and {len(new_steps) - 3} more')
            return True

        # Save to database
        with transaction.atomic():
            # Delete old ingredients and steps
            recipe.ingredients.all().delete()
            recipe.steps.all().delete()

            # Insert new ingredients
            for idx, ing in enumerate(new_ingredients):
                Ingredient.objects.create(
                    recipe=recipe,
                    name=str(ing.get('name', ''))[:200],
                    quantity=str(ing.get('quantity', ''))[:50],
                    unit=str(ing.get('unit', ''))[:50],
                    order=idx,
                )

            # Insert new steps
            for idx, step_text in enumerate(new_steps):
                RecipeStep.objects.create(
                    recipe=recipe,
                    step_number=idx + 1,
                    instruction=str(step_text).strip(),
                )

        self.stdout.write(f'  OK [{recipe.id}] {recipe.title[:50]} '
                          f'({len(new_ingredients)} ingredients, {len(new_steps)} steps)')
        return True
