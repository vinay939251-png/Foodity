def generate_ai_recipe(prompt):
    """
    Simulates AI recipe generation. In a production environment, 
    this would call the Gemini or OpenAI API.
    """
    ingredients = prompt.lower()
    
    # Simple Logic to simulate AI "intelligence"
    if "chicken" in ingredients:
        return f"Based on your input '{prompt}', I suggest: Garlic Herb Roasted Chicken. Instructions: Sear the chicken, add rosemary, and bake at 200°C for 25 mins."
    elif "paneer" in ingredients or "cheese" in ingredients:
        return f"Chef AI Suggestion: Creamy Shahi Paneer. Instructions: Sauté onions and cashews, blend into a paste, and simmer with paneer cubes."
    else:
        return f"I see you're looking for something with: {prompt}. How about a Mediterranean Quinoa Bowl? It's healthy and quick!"