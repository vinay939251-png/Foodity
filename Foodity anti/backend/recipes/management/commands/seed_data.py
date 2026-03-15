"""
Seed the database with rich demo recipes for immediate frontend display.
Usage: python manage.py seed_data
"""

import random
from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from recipes.models import (
    UserProfile, Recipe, Ingredient, RecipeStep, Nutrition, Board,
)

RECIPES_DATA = [
    {
        'title': 'Creamy Garlic Tuscan Salmon',
        'description': 'Pan-seared salmon in a rich, creamy garlic sauce with sun-dried tomatoes, spinach, and parmesan. A restaurant-quality dinner ready in 30 minutes that looks as gorgeous as it tastes.',
        'image': 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=600&q=80',
        'servings': 4, 'prep_time': 10, 'cook_time': 20, 'total_time': 30, 'difficulty': 'medium', 'rating': 4.8,
        'ingredients': [
            ('4', 'pieces', 'salmon fillets'), ('4', 'cloves', 'garlic, minced'),
            ('1', 'cup', 'heavy cream'), ('0.5', 'cup', 'sun-dried tomatoes'),
            ('2', 'cups', 'fresh spinach'), ('0.25', 'cup', 'parmesan cheese'),
            ('2', 'tbsp', 'olive oil'), ('', '', 'salt and pepper to taste'),
        ],
        'steps': [
            'Season salmon fillets generously with salt, pepper, and a drizzle of olive oil.',
            'Heat olive oil in a large skillet over medium-high heat. Sear salmon for 4 minutes per side until golden. Set aside.',
            'In the same skillet, sauté garlic for 30 seconds until fragrant.',
            'Add heavy cream and sun-dried tomatoes. Simmer for 3 minutes.',
            'Stir in spinach and parmesan cheese. Cook until spinach wilts.',
            'Return salmon to the skillet and spoon sauce over the top. Serve immediately.',
        ],
        'nutrition': {'calories': 420, 'protein': 38, 'carbs': 8, 'fats': 26},
    },
    {
        'title': 'Spicy Thai Basil Chicken (Pad Krapow)',
        'description': 'An authentic Thai street food classic — ground chicken stir-fried with holy basil, chilies, and garlic, served over jasmine rice with a fried egg. Bold, spicy, and incredibly satisfying.',
        'image': 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&q=80',
        'servings': 2, 'prep_time': 10, 'cook_time': 10, 'total_time': 20, 'difficulty': 'easy', 'rating': 4.7,
        'ingredients': [
            ('1', 'lb', 'ground chicken'), ('4', 'cloves', 'garlic, minced'),
            ('4', '', 'Thai chilies, sliced'), ('2', 'tbsp', 'soy sauce'),
            ('1', 'tbsp', 'oyster sauce'), ('1', 'tbsp', 'fish sauce'),
            ('1', 'tsp', 'sugar'), ('1', 'cup', 'Thai basil leaves'),
            ('2', '', 'eggs for frying'), ('2', 'cups', 'jasmine rice, cooked'),
        ],
        'steps': [
            'Heat oil in a wok over high heat until smoking.',
            'Add garlic and chilies, stir-fry for 30 seconds.',
            'Add ground chicken and break apart. Cook until no longer pink.',
            'Add soy sauce, oyster sauce, fish sauce, and sugar. Stir well.',
            'Toss in Thai basil leaves and stir until wilted.',
            'Fry eggs separately in oil until edges are crispy.',
            'Serve chicken over rice topped with fried egg.',
        ],
        'nutrition': {'calories': 520, 'protein': 42, 'carbs': 45, 'fats': 18},
    },
    {
        'title': 'Classic Margherita Pizza',
        'description': 'Neapolitan-style pizza with a perfectly charred thin crust, San Marzano tomato sauce, fresh mozzarella, basil, and a drizzle of extra virgin olive oil. Simple ingredients, extraordinary flavor.',
        'image': 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=600&q=80',
        'servings': 2, 'prep_time': 120, 'cook_time': 12, 'total_time': 132, 'difficulty': 'hard', 'rating': 4.9,
        'ingredients': [
            ('2.5', 'cups', 'bread flour'), ('1', 'tsp', 'instant yeast'),
            ('1', 'tsp', 'salt'), ('1', 'cup', 'warm water'),
            ('1', 'can', 'San Marzano tomatoes'), ('8', 'oz', 'fresh mozzarella'),
            ('', '', 'fresh basil leaves'), ('', '', 'extra virgin olive oil'),
        ],
        'steps': [
            'Mix flour, yeast, and salt. Add warm water and knead for 10 minutes until smooth.',
            'Let dough rise in an oiled bowl for 1-2 hours until doubled.',
            'Preheat oven to highest setting (500°F+) with a pizza stone.',
            'Crush San Marzano tomatoes by hand with a pinch of salt.',
            'Stretch dough into a 12-inch circle. Spread sauce, leaving a 1-inch border.',
            'Tear mozzarella and distribute evenly. Bake 10-12 minutes.',
            'Top with fresh basil and olive oil. Serve immediately.',
        ],
        'nutrition': {'calories': 680, 'protein': 28, 'carbs': 78, 'fats': 24},
    },
    {
        'title': 'Tonkotsu Ramen',
        'description': 'Rich and silky pork bone broth simmered for hours, served with springy noodles, chashu pork belly, soft-boiled egg, nori, and scallions. Ultimate comfort in a bowl.',
        'image': 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600&q=80',
        'servings': 4, 'prep_time': 30, 'cook_time': 720, 'total_time': 750, 'difficulty': 'hard', 'rating': 4.9,
        'ingredients': [
            ('4', 'lbs', 'pork bones'), ('1', 'lb', 'pork belly'),
            ('4', '', 'ramen noodle portions'), ('4', '', 'soft-boiled eggs'),
            ('4', 'sheets', 'nori'), ('4', 'stalks', 'green onions'),
            ('4', 'cloves', 'garlic'), ('2', 'inches', 'ginger'),
        ],
        'steps': [
            'Boil pork bones for 10 minutes, drain and clean. This removes impurities.',
            'Return bones to pot with fresh water, garlic, and ginger. Boil then reduce to vigorous simmer.',
            'Cook at rolling boil for 8-12 hours, adding water as needed. The broth should become milky white.',
            'Braise pork belly in soy sauce, mirin, and sugar for 2 hours until tender.',
            'Prepare soft-boiled eggs (6.5 minutes) and marinate in soy-mirin mixture.',
            'Cook ramen noodles according to package. Do not overcook.',
            'Assemble: noodles in bowl, ladle hot broth over, top with sliced chashu, egg, nori, and scallions.',
        ],
        'nutrition': {'calories': 890, 'protein': 52, 'carbs': 65, 'fats': 42},
    },
    {
        'title': 'Avocado Toast with Poached Eggs',
        'description': 'Elevated breakfast — perfectly ripe avocado smashed on artisan sourdough, topped with silky poached eggs, microgreens, chili flakes, and a squeeze of lemon. Simple yet divine.',
        'image': 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=600&q=80',
        'servings': 2, 'prep_time': 5, 'cook_time': 5, 'total_time': 10, 'difficulty': 'easy', 'rating': 4.5,
        'ingredients': [
            ('2', 'slices', 'sourdough bread'), ('1', '', 'ripe avocado'),
            ('2', '', 'eggs'), ('1', 'tbsp', 'white vinegar'),
            ('', '', 'chili flakes'), ('', '', 'microgreens'),
            ('', '', 'flaky sea salt'), ('0.5', '', 'lemon'),
        ],
        'steps': [
            'Toast sourdough bread until golden and crisp.',
            'Halve avocado, remove pit, and smash with a fork. Season with salt and lemon juice.',
            'Bring a pot of water to gentle simmer. Add vinegar.',
            'Create a gentle whirlpool and carefully drop in eggs. Poach for 3 minutes.',
            'Spread avocado on toast, top with poached eggs.',
            'Garnish with chili flakes, microgreens, and flaky salt.',
        ],
        'nutrition': {'calories': 320, 'protein': 14, 'carbs': 28, 'fats': 18},
    },
    {
        'title': 'Butter Chicken (Murgh Makhani)',
        'description': 'India\'s most beloved curry — tender tandoori-spiced chicken swimming in a velvety tomato-butter-cream sauce. Aromatic, rich, and absolutely addictive. Best served with naan or basmati rice.',
        'image': 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=600&q=80',
        'servings': 4, 'prep_time': 30, 'cook_time': 30, 'total_time': 60, 'difficulty': 'medium', 'rating': 4.8,
        'ingredients': [
            ('1.5', 'lbs', 'chicken thighs'), ('1', 'cup', 'yogurt'),
            ('2', 'tbsp', 'garam masala'), ('1', 'can', 'crushed tomatoes'),
            ('3', 'tbsp', 'butter'), ('1', 'cup', 'heavy cream'),
            ('1', 'tbsp', 'ginger paste'), ('1', 'tbsp', 'garlic paste'),
            ('1', 'tsp', 'turmeric'), ('1', 'tsp', 'chili powder'),
            ('', '', 'fresh cilantro for garnish'),
        ],
        'steps': [
            'Marinate chicken in yogurt, garam masala, turmeric, and salt for at least 30 minutes.',
            'Grill or broil chicken until charred. Set aside.',
            'Melt butter in a large pan. Add ginger and garlic paste, cook for 1 minute.',
            'Add crushed tomatoes, chili powder, and remaining garam masala. Simmer 15 minutes.',
            'Blend sauce until smooth. Return to pan.',
            'Add cream and stir. Add chicken pieces and simmer 10 minutes.',
            'Garnish with a swirl of cream and fresh cilantro. Serve with naan.',
        ],
        'nutrition': {'calories': 480, 'protein': 36, 'carbs': 12, 'fats': 32},
    },
    {
        'title': 'Mediterranean Quinoa Bowl',
        'description': 'A vibrant, healthy bowl packed with fluffy quinoa, crisp cucumber, cherry tomatoes, kalamata olives, crumbled feta, and a bright lemon-herb dressing. Light yet satisfying.',
        'image': 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&q=80',
        'servings': 2, 'prep_time': 15, 'cook_time': 15, 'total_time': 30, 'difficulty': 'easy', 'rating': 4.4,
        'ingredients': [
            ('1', 'cup', 'quinoa'), ('1', '', 'cucumber, diced'),
            ('1', 'cup', 'cherry tomatoes, halved'), ('0.5', 'cup', 'kalamata olives'),
            ('0.5', 'cup', 'feta cheese, crumbled'), ('0.25', 'cup', 'red onion, thinly sliced'),
            ('3', 'tbsp', 'extra virgin olive oil'), ('2', 'tbsp', 'lemon juice'),
            ('1', 'tsp', 'dried oregano'), ('', '', 'fresh parsley'),
        ],
        'steps': [
            'Rinse quinoa and cook in 2 cups water for 15 minutes. Let sit 5 minutes then fluff.',
            'While quinoa cooks, dice cucumber, halve tomatoes, slice onion.',
            'Whisk olive oil, lemon juice, oregano, salt, and pepper for dressing.',
            'Combine cooled quinoa with vegetables in a large bowl.',
            'Drizzle with dressing and toss gently.',
            'Top with crumbled feta, olives, and fresh parsley.',
        ],
        'nutrition': {'calories': 380, 'protein': 14, 'carbs': 42, 'fats': 18},
    },
    {
        'title': 'Chocolate Lava Cake',
        'description': 'Decadent individual chocolate cakes with a molten, gooey center that flows like lava when you break through the delicate outer shell. A show-stopping dessert in just 25 minutes.',
        'image': 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600&q=80',
        'servings': 4, 'prep_time': 10, 'cook_time': 14, 'total_time': 25, 'difficulty': 'medium', 'rating': 4.9,
        'ingredients': [
            ('6', 'oz', 'dark chocolate (70%)'), ('0.5', 'cup', 'butter'),
            ('2', '', 'eggs'), ('2', '', 'egg yolks'),
            ('0.25', 'cup', 'sugar'), ('2', 'tbsp', 'flour'),
            ('', '', 'cocoa powder for dusting'), ('', '', 'vanilla ice cream for serving'),
        ],
        'steps': [
            'Preheat oven to 425°F. Butter and cocoa-dust 4 ramekins.',
            'Melt chocolate and butter together. Let cool slightly.',
            'Whisk eggs, yolks, and sugar until thick and pale.',
            'Fold chocolate mixture into eggs. Gently fold in flour.',
            'Divide batter among ramekins. Bake exactly 12-14 minutes.',
            'Let rest 1 minute, then invert onto plates. Serve with ice cream.',
        ],
        'nutrition': {'calories': 520, 'protein': 8, 'carbs': 38, 'fats': 36},
    },
    {
        'title': 'Pad Thai',
        'description': 'Thailand\'s national dish — rice noodles stir-fried with shrimp, egg, bean sprouts, peanuts, and the perfect balance of sweet, sour, salty, and spicy. Street food perfection at home.',
        'image': 'https://images.unsplash.com/photo-1559314809-0d155014e29e?w=600&q=80',
        'servings': 2, 'prep_time': 15, 'cook_time': 10, 'total_time': 25, 'difficulty': 'medium', 'rating': 4.6,
        'ingredients': [
            ('8', 'oz', 'rice noodles'), ('8', '', 'large shrimp'),
            ('2', '', 'eggs'), ('1', 'cup', 'bean sprouts'),
            ('3', 'tbsp', 'tamarind paste'), ('2', 'tbsp', 'fish sauce'),
            ('2', 'tbsp', 'palm sugar'), ('0.25', 'cup', 'roasted peanuts'),
            ('2', '', 'green onions'), ('1', '', 'lime'),
        ],
        'steps': [
            'Soak rice noodles in warm water 30 minutes until pliable. Drain.',
            'Mix tamarind paste, fish sauce, and palm sugar for sauce.',
            'Heat oil in wok over high. Cook shrimp 1 minute per side. Remove.',
            'Scramble eggs in wok. Add noodles and sauce. Toss to coat.',
            'Add bean sprouts and green onions. Toss briefly.',
            'Return shrimp. Plate and garnish with peanuts, lime wedges, and extra sprouts.',
        ],
        'nutrition': {'calories': 450, 'protein': 22, 'carbs': 62, 'fats': 14},
    },
    {
        'title': 'Classic Bruschetta',
        'description': 'Perfectly toasted ciabatta topped with a vibrant mixture of ripe tomatoes, fresh basil, garlic, and drizzled with aged balsamic. The simplest Italian appetizer that always steals the show.',
        'image': 'https://images.unsplash.com/photo-1572695157366-5e585ab2b69f?w=600&q=80',
        'servings': 4, 'prep_time': 10, 'cook_time': 5, 'total_time': 15, 'difficulty': 'easy', 'rating': 4.3,
        'ingredients': [
            ('4', '', 'ripe tomatoes, diced'), ('1', 'loaf', 'ciabatta or baguette'),
            ('3', 'cloves', 'garlic'), ('', '', 'fresh basil leaves'),
            ('3', 'tbsp', 'extra virgin olive oil'), ('1', 'tbsp', 'balsamic vinegar'),
            ('', '', 'flaky sea salt'), ('', '', 'freshly ground black pepper'),
        ],
        'steps': [
            'Dice tomatoes and combine with torn basil, olive oil, balsamic, salt, and pepper.',
            'Let tomato mixture sit 10 minutes for flavors to meld.',
            'Slice bread and toast until golden on both sides.',
            'Rub each toast with a cut garlic clove.',
            'Spoon tomato mixture generously onto each toast.',
            'Drizzle with extra olive oil and serve immediately.',
        ],
        'nutrition': {'calories': 220, 'protein': 6, 'carbs': 30, 'fats': 10},
    },
    {
        'title': 'Korean Bibimbap',
        'description': 'A stunning Korean rice bowl with colorful sautéed vegetables, spicy gochujang sauce, a crispy fried egg, and tender beef. Mix it all together for an explosion of flavors and textures.',
        'image': 'https://images.unsplash.com/photo-1553163147-622ab57be1c7?w=600&q=80',
        'servings': 2, 'prep_time': 20, 'cook_time': 15, 'total_time': 35, 'difficulty': 'medium', 'rating': 4.7,
        'ingredients': [
            ('2', 'cups', 'steamed rice'), ('0.5', 'lb', 'beef bulgogi'),
            ('1', 'cup', 'spinach'), ('1', '', 'carrot, julienned'),
            ('1', '', 'zucchini, julienned'), ('1', 'cup', 'bean sprouts'),
            ('2', '', 'eggs'), ('3', 'tbsp', 'gochujang'),
            ('1', 'tbsp', 'sesame oil'), ('', '', 'sesame seeds'),
        ],
        'steps': [
            'Cook beef bulgogi in a hot pan with sesame oil until caramelized.',
            'Separately sauté each vegetable with a touch of sesame oil and salt.',
            'Blanch spinach and bean sprouts, squeeze dry.',
            'Fry eggs sunny-side up with crispy edges.',
            'Arrange rice in bowls. Artfully place each vegetable, beef, and egg on top.',
            'Serve with gochujang and sesame seeds. Mix everything together before eating!',
        ],
        'nutrition': {'calories': 580, 'protein': 32, 'carbs': 56, 'fats': 22},
    },
    {
        'title': 'Classic Tiramisu',
        'description': 'Layers of espresso-soaked ladyfingers and cloud-like mascarpone cream, dusted with cocoa. This no-bake Italian dessert improves overnight, making it perfect for entertaining.',
        'image': 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=600&q=80',
        'servings': 8, 'prep_time': 30, 'cook_time': 0, 'total_time': 270, 'difficulty': 'medium', 'rating': 4.8,
        'ingredients': [
            ('6', '', 'egg yolks'), ('0.75', 'cup', 'sugar'),
            ('16', 'oz', 'mascarpone cheese'), ('2', 'cups', 'heavy cream'),
            ('2', 'cups', 'strong espresso, cooled'), ('3', 'tbsp', 'coffee liqueur'),
            ('36', '', 'ladyfinger cookies'), ('', '', 'cocoa powder'),
        ],
        'steps': [
            'Whisk egg yolks and sugar until thick and pale yellow.',
            'Add mascarpone and mix until smooth.',
            'In separate bowl, whip heavy cream to stiff peaks. Fold into mascarpone mixture.',
            'Combine espresso and coffee liqueur in a shallow dish.',
            'Quickly dip ladyfingers in coffee mixture (don\'t soak). Layer in 9x13 dish.',
            'Spread half the cream mixture. Repeat with another layer of dipped ladyfingers and remaining cream.',
            'Refrigerate at least 4 hours or overnight. Dust generously with cocoa before serving.',
        ],
        'nutrition': {'calories': 380, 'protein': 8, 'carbs': 34, 'fats': 24},
    },
    {
        'title': 'Fish Tacos with Mango Salsa',
        'description': 'Crispy beer-battered fish in warm corn tortillas with fresh mango salsa, crunchy cabbage slaw, and creamy chipotle sauce. A fiesta of flavor in every bite!',
        'image': 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=600&q=80',
        'servings': 4, 'prep_time': 20, 'cook_time': 10, 'total_time': 30, 'difficulty': 'medium', 'rating': 4.6,
        'ingredients': [
            ('1', 'lb', 'white fish fillets'), ('8', '', 'corn tortillas'),
            ('1', '', 'ripe mango, diced'), ('0.5', '', 'red onion, diced'),
            ('1', '', 'jalapeño, minced'), ('1', '', 'lime'),
            ('0.5', 'cup', 'sour cream'), ('1', 'tsp', 'chipotle in adobo'),
            ('2', 'cups', 'shredded cabbage'), ('', '', 'fresh cilantro'),
        ],
        'steps': [
            'Make mango salsa: combine mango, red onion, jalapeño, cilantro, and lime juice.',
            'Mix sour cream with chipotle for the crema.',
            'Season fish with cumin, chili powder, salt, and pepper.',
            'Pan-fry or grill fish 3-4 minutes per side until flaky.',
            'Warm tortillas on a dry skillet.',
            'Assemble: fish on tortilla, top with cabbage, mango salsa, and chipotle crema.',
        ],
        'nutrition': {'calories': 380, 'protein': 28, 'carbs': 42, 'fats': 12},
    },
    {
        'title': 'Mushroom Risotto',
        'description': 'Luxuriously creamy Italian risotto studded with a mix of wild mushrooms, finished with butter and aged parmesan. The secret is patience — keep stirring and adding broth slowly.',
        'image': 'https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=600&q=80',
        'servings': 4, 'prep_time': 10, 'cook_time': 30, 'total_time': 40, 'difficulty': 'medium', 'rating': 4.5,
        'ingredients': [
            ('1.5', 'cups', 'arborio rice'), ('1', 'lb', 'mixed mushrooms'),
            ('6', 'cups', 'warm chicken broth'), ('1', '', 'shallot, diced'),
            ('0.5', 'cup', 'white wine'), ('0.5', 'cup', 'parmesan, grated'),
            ('3', 'tbsp', 'butter'), ('2', 'tbsp', 'olive oil'),
            ('', '', 'fresh thyme'), ('', '', 'truffle oil (optional)'),
        ],
        'steps': [
            'Sauté mushrooms in olive oil over high heat until golden. Season and set aside.',
            'In the same pan, melt butter and cook shallot until soft.',
            'Add rice and toast for 2 minutes until edges become translucent.',
            'Add white wine and stir until absorbed.',
            'Add warm broth one ladle at a time, stirring continuously. Wait until each addition is absorbed before adding more.',
            'After 18-20 minutes, rice should be creamy with a slight bite. Fold in mushrooms, parmesan, and extra butter.',
            'Plate and finish with fresh thyme and optional truffle oil drizzle.',
        ],
        'nutrition': {'calories': 440, 'protein': 14, 'carbs': 58, 'fats': 16},
    },
    {
        'title': 'Fluffy Japanese Pancakes (Soufflé)',
        'description': 'Impossibly thick, jiggly, cloud-like Japanese soufflé pancakes that wobble with every touch. Lighter than air with a delicate sweetness. Topped with whipped cream and maple syrup.',
        'image': 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=600&q=80',
        'servings': 2, 'prep_time': 15, 'cook_time': 15, 'total_time': 30, 'difficulty': 'hard', 'rating': 4.7,
        'ingredients': [
            ('2', '', 'egg yolks'), ('3', '', 'egg whites'),
            ('0.25', 'cup', 'flour'), ('2', 'tbsp', 'sugar'),
            ('2', 'tbsp', 'milk'), ('0.5', 'tsp', 'vanilla extract'),
            ('', '', 'butter for cooking'), ('', '', 'whipped cream and berries'),
        ],
        'steps': [
            'Mix egg yolks, flour, milk, and vanilla until smooth.',
            'Beat egg whites until foamy. Gradually add sugar and beat to stiff peaks.',
            'Fold 1/3 of meringue into yolk mixture to lighten. Then fold in remaining gently.',
            'Heat buttered pan on lowest heat. Pipe batter into tall mounds using ring molds.',
            'Add a splash of water, cover, and cook 5-7 minutes.',
            'Carefully flip. Cover and cook another 5-7 minutes.',
            'Remove molds. Stack and serve with whipped cream, berries, and maple syrup.',
        ],
        'nutrition': {'calories': 280, 'protein': 10, 'carbs': 32, 'fats': 12},
    },
    {
        'title': 'Tom Yum Soup',
        'description': 'Thailand\'s iconic hot and sour soup bursting with shrimp, mushrooms, lemongrass, galangal, and kaffir lime leaves. A soul-warming bowl with the perfect balance of spicy, sour, and aromatic.',
        'image': 'https://images.unsplash.com/photo-1548943487-a2e4e43b4853?w=600&q=80',
        'servings': 4, 'prep_time': 10, 'cook_time': 15, 'total_time': 25, 'difficulty': 'easy', 'rating': 4.5,
        'ingredients': [
            ('1', 'lb', 'shrimp, peeled'), ('4', 'cups', 'chicken broth'),
            ('3', 'stalks', 'lemongrass'), ('5', 'slices', 'galangal'),
            ('5', '', 'kaffir lime leaves'), ('1', 'cup', 'mushrooms'),
            ('3', 'tbsp', 'fish sauce'), ('3', 'tbsp', 'lime juice'),
            ('2', '', 'Thai chilies'), ('', '', 'fresh cilantro'),
        ],
        'steps': [
            'Bring broth to boil. Add lemongrass, galangal, and kaffir lime leaves.',
            'Simmer 5 minutes for aromatics to infuse.',
            'Add mushrooms and Thai chilies. Cook 3 minutes.',
            'Add shrimp and cook until pink, about 2-3 minutes.',
            'Season with fish sauce and lime juice. Adjust to taste.',
            'Garnish with cilantro. Serve immediately while piping hot.',
        ],
        'nutrition': {'calories': 180, 'protein': 24, 'carbs': 8, 'fats': 4},
    },
    {
        'title': 'Beef Bourguignon',
        'description': 'Julia Child\'s legendary French stew — tender beef braised in Burgundy wine with pearl onions, mushrooms, carrots, and bacon. The kind of dish that fills your home with an amazing aroma.',
        'image': 'https://images.unsplash.com/photo-1534939561126-855b8675edd7?w=600&q=80',
        'servings': 6, 'prep_time': 30, 'cook_time': 180, 'total_time': 210, 'difficulty': 'hard', 'rating': 4.8,
        'ingredients': [
            ('3', 'lbs', 'beef chuck, cubed'), ('1', 'bottle', 'red Burgundy wine'),
            ('6', 'slices', 'thick-cut bacon'), ('1', 'lb', 'pearl onions'),
            ('1', 'lb', 'mushrooms'), ('4', '', 'carrots, chunked'),
            ('2', 'tbsp', 'tomato paste'), ('2', 'cups', 'beef broth'),
            ('3', 'cloves', 'garlic'), ('', '', 'fresh thyme and bay leaves'),
        ],
        'steps': [
            'Render bacon until crispy. Remove. Brown beef cubes in batches in the bacon fat.',
            'Sauté carrots and garlic. Add tomato paste and cook 1 minute.',
            'Return beef to pot. Add wine, broth, thyme, and bay leaves.',
            'Cover and braise in 325°F oven for 2.5-3 hours.',
            'Meanwhile, sauté pearl onions and mushrooms in butter until golden.',
            'Add onions and mushrooms to stew in last 30 minutes.',
            'Serve over egg noodles or crusty bread. Garnish with fresh parsley.',
        ],
        'nutrition': {'calories': 620, 'protein': 48, 'carbs': 18, 'fats': 32},
    },
    {
        'title': 'Poke Bowl',
        'description': 'A Hawaiian-inspired bowl with sushi-grade ahi tuna, seasoned rice, avocado, edamame, cucumber, mango, and a drizzle of spicy mayo. Fresh, colorful, and bursting with umami.',
        'image': 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&q=80',
        'servings': 2, 'prep_time': 20, 'cook_time': 0, 'total_time': 20, 'difficulty': 'easy', 'rating': 4.6,
        'ingredients': [
            ('0.5', 'lb', 'sushi-grade ahi tuna'), ('2', 'cups', 'sushi rice, cooked'),
            ('1', '', 'avocado, sliced'), ('0.5', 'cup', 'edamame'),
            ('0.5', '', 'cucumber, sliced'), ('0.5', '', 'mango, cubed'),
            ('2', 'tbsp', 'soy sauce'), ('1', 'tbsp', 'sesame oil'),
            ('', '', 'spicy mayo'), ('', '', 'sesame seeds and nori strips'),
        ],
        'steps': [
            'Cube tuna into bite-sized pieces.',
            'Marinate tuna in soy sauce and sesame oil for 10 minutes.',
            'Divide sushi rice between bowls, season with rice vinegar.',
            'Arrange tuna, avocado, edamame, cucumber, and mango artfully on top.',
            'Drizzle with spicy mayo.',
            'Garnish with sesame seeds and nori strips.',
        ],
        'nutrition': {'calories': 420, 'protein': 32, 'carbs': 48, 'fats': 14},
    },
    {
        'title': 'Apple Crumble',
        'description': 'Warm cinnamon-spiced apples baked under a buttery, crunchy oat crumble topping. Served with a scoop of vanilla ice cream, it\'s the ultimate autumn comfort dessert.',
        'image': 'https://images.unsplash.com/photo-1568571780765-9276ac8b75a2?w=600&q=80',
        'servings': 6, 'prep_time': 15, 'cook_time': 40, 'total_time': 55, 'difficulty': 'easy', 'rating': 4.4,
        'ingredients': [
            ('6', '', 'apples, peeled and sliced'), ('0.5', 'cup', 'brown sugar'),
            ('1', 'tsp', 'cinnamon'), ('1', 'cup', 'rolled oats'),
            ('0.5', 'cup', 'flour'), ('0.5', 'cup', 'cold butter, cubed'),
            ('0.25', 'cup', 'chopped pecans'), ('', '', 'vanilla ice cream'),
        ],
        'steps': [
            'Preheat oven to 350°F.',
            'Toss sliced apples with half the brown sugar, cinnamon, and a squeeze of lemon.',
            'Spread apples in a baking dish.',
            'Mix oats, flour, remaining brown sugar, and pecans. Cut in cold butter until crumbly.',
            'Scatter crumble over apples in an even layer.',
            'Bake 35-40 minutes until golden and bubbling.',
            'Let cool 10 minutes. Serve warm with vanilla ice cream.',
        ],
        'nutrition': {'calories': 340, 'protein': 4, 'carbs': 52, 'fats': 14},
    },
    {
        'title': 'Shakshuka',
        'description': 'North African and Middle Eastern classic — eggs poached in a spiced tomato and pepper sauce with cumin, paprika, and harissa. Served with crusty bread for dipping. Perfect weekend brunch.',
        'image': 'https://images.unsplash.com/photo-1590412200988-a436970781fa?w=600&q=80',
        'servings': 4, 'prep_time': 10, 'cook_time': 25, 'total_time': 35, 'difficulty': 'easy', 'rating': 4.6,
        'ingredients': [
            ('6', '', 'eggs'), ('1', 'can', 'crushed tomatoes'),
            ('2', '', 'bell peppers, diced'), ('1', '', 'onion, diced'),
            ('4', 'cloves', 'garlic, minced'), ('2', 'tsp', 'cumin'),
            ('1', 'tsp', 'smoked paprika'), ('1', 'tbsp', 'harissa paste'),
            ('', '', 'fresh cilantro and parsley'), ('', '', 'crusty bread'),
        ],
        'steps': [
            'Heat olive oil and sauté onions and peppers until soft, about 5 minutes.',
            'Add garlic, cumin, paprika, and harissa. Cook 1 minute until fragrant.',
            'Add crushed tomatoes, season well. Simmer 10 minutes until thickened.',
            'Make 6 wells in the sauce. Crack an egg into each.',
            'Cover and cook on low 6-8 minutes until egg whites are set but yolks are still runny.',
            'Garnish with fresh herbs and crumbled feta. Serve straight from the pan with bread.',
        ],
        'nutrition': {'calories': 260, 'protein': 16, 'carbs': 18, 'fats': 14},
    },
]

AUTHORS = [
    ('chef_marco', 'Chef Marco', 'Professional Italian chef with 15 years of experience'),
    ('sarah_cooks', 'Sarah K.', 'Home cook passionate about Asian fusion'),
    ('foodstudio', 'Food Studio', 'Team of culinary creators and food photographers'),
    ('homechef_raj', 'Chef Raj', 'Indian cuisine specialist and cookbook author'),
    ('mia_bakes', 'Mia\'s Kitchen', 'Baker and dessert enthusiast from Paris'),
]


class Command(BaseCommand):
    help = 'Seed the database with demo recipes and users'

    def handle(self, *args, **options):
        self.stdout.write('🌱 Seeding database with demo data...\n')

        # Create demo users
        profiles = []
        for username, display_name, bio in AUTHORS:
            user, created = User.objects.get_or_create(
                username=username,
                defaults={'email': f'{username}@foodity.demo', 'is_active': True},
            )
            if created:
                user.set_password('demo1234')
                user.save()

            profile, _ = UserProfile.objects.get_or_create(
                user=user,
                defaults={
                    'display_name': display_name,
                    'bio': bio,
                    'avatar_url': f'https://api.dicebear.com/7.x/avataaars/svg?seed={username}',
                },
            )
            profiles.append(profile)

        self.stdout.write(f'  ✅ Created {len(profiles)} demo users')

        # Create recipes
        created_count = 0
        for recipe_data in RECIPES_DATA:
            if Recipe.objects.filter(title=recipe_data['title']).exists():
                continue

            recipe = Recipe.objects.create(
                title=recipe_data['title'],
                description=recipe_data['description'],
                image=recipe_data['image'],
                servings=recipe_data['servings'],
                prep_time=recipe_data['prep_time'],
                cook_time=recipe_data['cook_time'],
                total_time=recipe_data['total_time'],
                difficulty=recipe_data['difficulty'],
                rating=recipe_data['rating'],
                author=random.choice(profiles),
                likes_count=random.randint(10, 500),
                saves_count=random.randint(5, 200),
            )

            # Create ingredients
            for i, (qty, unit, name) in enumerate(recipe_data['ingredients']):
                Ingredient.objects.create(
                    recipe=recipe, name=name, quantity=qty, unit=unit, order=i,
                )

            # Create steps
            for i, instruction in enumerate(recipe_data['steps']):
                RecipeStep.objects.create(
                    recipe=recipe, step_number=i + 1, instruction=instruction,
                )

            # Create nutrition
            if recipe_data.get('nutrition'):
                Nutrition.objects.create(recipe=recipe, **recipe_data['nutrition'])

            created_count += 1

        self.stdout.write(f'  ✅ Created {created_count} recipes (with ingredients, steps, nutrition)')

        # Create default boards for each user
        for profile in profiles:
            Board.objects.get_or_create(
                owner=profile, name='Favorites',
                defaults={'description': 'My favorite recipes', 'is_public': False},
            )

        self.stdout.write(self.style.SUCCESS(
            f'\n🎉 Seed complete! {created_count} recipes, {len(profiles)} users,'
            f' {len(profiles)} boards.'
            f'\n\n  Demo login: username=chef_marco, password=demo1234'
        ))
