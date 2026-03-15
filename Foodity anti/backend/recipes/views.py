from rest_framework import generics, status, permissions, filters
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.decorators import api_view, permission_classes
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from django.db.models import Prefetch, F, Q, Count, Case, When, Value, BooleanField
from django.db import IntegrityError
from .models import (
    Recipe, Ingredient, RecipeStep, Nutrition,
    UserProfile, Board, Like, Save, Comment,
    Conversation, Message, MealLog,
)
from .serializers import (
    RecipeListSerializer, RecipeDetailSerializer,
    UserProfileSerializer, BoardSerializer, BoardWithRecipesSerializer,
    CommentSerializer, LikeSerializer, SaveSerializer,
    ConversationListSerializer, MessageSerializer,
    MealLogSerializer,
)


# ============================================================
# AUTH
# ============================================================

class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        username = request.data.get('username', '').strip()
        email = request.data.get('email', '').strip()
        password = request.data.get('password', '')
        display_name = request.data.get('display_name', '').strip()
        if not username or not password:
            return Response({'error': 'Username and password are required.'}, status=400)
        if User.objects.filter(username=username).exists():
            return Response({'error': 'Username already taken.'}, status=400)
        if email and User.objects.filter(email=email).exists():
            return Response({'error': 'Email already registered.'}, status=400)
        user = User.objects.create_user(username=username, email=email, password=password)
        profile = UserProfile.objects.create(
            user=user, display_name=display_name or username,
            avatar_url=f'https://api.dicebear.com/7.x/avataaars/svg?seed={username}',
        )
        Board.objects.create(owner=profile, name='Favorites', description='My saved recipes', is_public=False)
        refresh = RefreshToken.for_user(user)
        return Response({
            'user': UserProfileSerializer(profile).data,
            'tokens': {'access': str(refresh.access_token), 'refresh': str(refresh)},
        }, status=201)


class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        username = request.data.get('username', '').strip()
        password = request.data.get('password', '')
        if '@' in username:
            try:
                user_obj = User.objects.get(email=username)
                username = user_obj.username
            except User.DoesNotExist:
                return Response({'error': 'Invalid credentials.'}, status=401)
        user = authenticate(username=username, password=password)
        if user is None:
            return Response({'error': 'Invalid credentials.'}, status=401)
        profile, _ = UserProfile.objects.get_or_create(
            user=user, defaults={
                'display_name': user.username,
                'avatar_url': f'https://api.dicebear.com/7.x/avataaars/svg?seed={user.username}',
            },
        )
        refresh = RefreshToken.for_user(user)
        return Response({
            'user': UserProfileSerializer(profile).data,
            'tokens': {'access': str(refresh.access_token), 'refresh': str(refresh)},
        })


class MeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        profile, _ = UserProfile.objects.get_or_create(
            user=request.user, defaults={
                'display_name': request.user.username,
                'avatar_url': f'https://api.dicebear.com/7.x/avataaars/svg?seed={request.user.username}',
            },
        )
        return Response(UserProfileSerializer(profile).data)

    def patch(self, request):
        profile = UserProfile.objects.get(user=request.user)
        
        # Handle avatar upload if present
        if 'avatar' in request.FILES:
            import cloudinary.uploader
            try:
                upload_res = cloudinary.uploader.upload(
                    request.FILES['avatar'],
                    folder='foodity/avatars',
                    transformation=[{'width': 400, 'height': 400, 'crop': 'fill'}]
                )
                profile.avatar_url = upload_res.get('secure_url')
            except Exception as e:
                return Response({'error': f'Image upload failed: {str(e)}'}, status=400)

        # Handle other fields
        for field in ['display_name', 'bio', 'avatar_url']:
            if field in request.data and field != 'avatar':  # Skip avatar if provided as file
                setattr(profile, field, request.data[field])
                
        profile.save()
        return Response(UserProfileSerializer(profile).data)


# ============================================================
# RECIPES
# ============================================================

class RecipeListView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return RecipeDetailSerializer
        return RecipeListSerializer

    def perform_create(self, serializer):
        serializer.save(author=self.request.user.profile)

    def get_queryset(self):
        qs = Recipe.objects.select_related('author__user').annotate(
            has_image=Case(
                When(Q(image__exact='') | Q(image__isnull=True), then=Value(False)),
                default=Value(True),
                output_field=BooleanField()
            ),
            ing_count=Count('ingredients', distinct=True),
            step_count=Count('steps', distinct=True)
        ).annotate(
            is_complete=Case(
                When(Q(has_image=True) & Q(ing_count__gt=0) & Q(step_count__gt=0), then=Value(True)),
                default=Value(False),
                output_field=BooleanField()
            )
        )

        search = self.request.query_params.get('search')
        if search:
            qs = qs.filter(Q(title__icontains=search) | Q(description__icontains=search))
        difficulty = self.request.query_params.get('difficulty')
        if difficulty:
            qs = qs.filter(difficulty=difficulty)
        category = self.request.query_params.get('category')
        if category and category.lower() != 'all':
            kw_map = {
                'breakfast': ['breakfast', 'pancake', 'waffle', 'egg', 'oatmeal', 'toast'],
                'lunch': ['lunch', 'sandwich', 'wrap', 'salad', 'soup', 'bowl'],
                'dinner': ['dinner', 'steak', 'roast', 'grilled', 'curry', 'pasta', 'chicken'],
                'dessert': ['cake', 'cookie', 'pie', 'brownie', 'chocolate', 'dessert', 'pudding', 'tiramisu', 'crumble'],
                'healthy': ['healthy', 'salad', 'quinoa', 'avocado', 'smoothie'],
                'quick & easy': ['quick', 'easy', 'simple'],
            }
            keywords = kw_map.get(category.lower(), [category.lower()])
            q = Q()
            for kw in keywords:
                q |= Q(title__icontains=kw) | Q(description__icontains=kw)
            qs = qs.filter(q)
        ordering = self.request.query_params.get('ordering', '?')
        allowed = ['created_at', '-created_at', 'rating', '-rating', 'likes_count', '-likes_count']
        if ordering in allowed:
            qs = qs.order_by('-is_complete', ordering)
        elif ordering == '?':
            qs = qs.order_by('-is_complete', '?')
        return qs

    def get_serializer_context(self):
        ctx = super().get_serializer_context()
        if self.request.user.is_authenticated:
            p = getattr(self.request.user, 'profile', None)
            if p:
                ctx['liked_recipe_ids'] = set(Like.objects.filter(user=p).values_list('recipe_id', flat=True))
                ctx['saved_recipe_ids'] = set(Save.objects.filter(user=p).values_list('recipe_id', flat=True))
        return ctx


from .permissions import IsAuthorOrReadOnly

class RecipeDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = RecipeDetailSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsAuthorOrReadOnly]

    def get_queryset(self):
        return Recipe.objects.select_related('author__user', 'nutrition').prefetch_related(
            Prefetch('ingredients', queryset=Ingredient.objects.order_by('order')),
            Prefetch('steps', queryset=RecipeStep.objects.order_by('step_number')),
        )

    def get_serializer_context(self):
        ctx = super().get_serializer_context()
        if self.request.user.is_authenticated:
            p = getattr(self.request.user, 'profile', None)
            if p:
                ctx['liked_recipe_ids'] = set(Like.objects.filter(user=p).values_list('recipe_id', flat=True))
                ctx['saved_recipe_ids'] = set(Save.objects.filter(user=p).values_list('recipe_id', flat=True))
        return ctx


# ============================================================
# LIKE / SAVE / COMMENT
# ============================================================

class ToggleLikeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        try:
            recipe = Recipe.objects.get(pk=pk)
        except Recipe.DoesNotExist:
            return Response({'error': 'Recipe not found.'}, status=404)
        profile = request.user.profile
        like, created = Like.objects.get_or_create(user=profile, recipe=recipe)
        if not created:
            like.delete()
            recipe.likes_count = max(0, recipe.likes_count - 1)
            recipe.save(update_fields=['likes_count'])
            return Response({'liked': False, 'likes_count': recipe.likes_count})
        recipe.likes_count = F('likes_count') + 1
        recipe.save(update_fields=['likes_count'])
        recipe.refresh_from_db()
        return Response({'liked': True, 'likes_count': recipe.likes_count}, status=201)


class ToggleSaveView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        try:
            recipe = Recipe.objects.get(pk=pk)
        except Recipe.DoesNotExist:
            return Response({'error': 'Recipe not found.'}, status=404)
        profile = request.user.profile
        board_id = request.data.get('board_id')
        if board_id:
            try:
                board = Board.objects.get(pk=board_id, owner=profile)
            except Board.DoesNotExist:
                return Response({'error': 'Board not found.'}, status=404)
        else:
            board, _ = Board.objects.get_or_create(
                owner=profile, name='Favorites',
                defaults={'description': 'My saved recipes', 'is_public': False},
            )
        save, created = Save.objects.get_or_create(user=profile, recipe=recipe, board=board)
        if not created:
            save.delete()
            recipe.saves_count = max(0, recipe.saves_count - 1)
            recipe.save(update_fields=['saves_count'])
            return Response({'saved': False, 'saves_count': recipe.saves_count})
        recipe.saves_count = F('saves_count') + 1
        recipe.save(update_fields=['saves_count'])
        recipe.refresh_from_db()
        return Response({'saved': True, 'saves_count': recipe.saves_count}, status=201)


class CommentListCreateView(APIView):
    def get_permissions(self):
        if self.request.method == 'POST':
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

    def get(self, request, pk):
        comments = (
            Comment.objects.filter(recipe_id=pk, parent__isnull=True)
            .select_related('user__user')
            .prefetch_related(Prefetch('replies', queryset=Comment.objects.select_related('user__user')))
            .order_by('-created_at')[:50]
        )
        return Response(CommentSerializer(comments, many=True).data)

    def post(self, request, pk):
        try:
            recipe = Recipe.objects.get(pk=pk)
        except Recipe.DoesNotExist:
            return Response({'error': 'Recipe not found.'}, status=404)
        text = request.data.get('text', '').strip()
        if not text:
            return Response({'error': 'Comment text is required.'}, status=400)
        parent_id = request.data.get('parent_id')
        parent = None
        if parent_id:
            try:
                parent = Comment.objects.get(pk=parent_id, recipe=recipe)
                if parent.parent is not None:
                    parent = parent.parent
            except Comment.DoesNotExist:
                return Response({'error': 'Parent comment not found.'}, status=404)
        comment = Comment.objects.create(user=request.user.profile, recipe=recipe, parent=parent, text=text)
        return Response(CommentSerializer(comment).data, status=201)


# ============================================================
# BOARDS
# ============================================================

class BoardListCreateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        boards = Board.objects.filter(owner=request.user.profile).prefetch_related('saves__recipe')
        return Response(BoardSerializer(boards, many=True).data)

    def post(self, request):
        name = request.data.get('name', '').strip()
        if not name:
            return Response({'error': 'Board name is required.'}, status=400)
        profile = request.user.profile
        if Board.objects.filter(owner=profile, name=name).exists():
            return Response({'error': 'Board already exists.'}, status=400)
        board = Board.objects.create(
            owner=profile, name=name,
            description=request.data.get('description', ''),
            is_public=request.data.get('is_public', True),
        )
        return Response(BoardSerializer(board).data, status=201)


class BoardDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk):
        try:
            board = Board.objects.get(pk=pk)
            if not board.is_public and board.owner != request.user.profile:
                return Response({'error': 'Board is private.'}, status=403)
        except Board.DoesNotExist:
            return Response({'error': 'Board not found.'}, status=404)
        saved_ids = Save.objects.filter(board=board).values_list('recipe_id', flat=True)
        recipes = Recipe.objects.filter(id__in=saved_ids).select_related('author__user')
        return Response({
            'board': BoardSerializer(board).data,
            'recipes': RecipeListSerializer(recipes, many=True).data,
        })

    def delete(self, request, pk):
        try:
            board = Board.objects.get(pk=pk, owner=request.user.profile)
        except Board.DoesNotExist:
            return Response({'error': 'Board not found.'}, status=404)
        board.delete()
        return Response(status=204)


# ============================================================
# USER PROFILE
# ============================================================

class UserProfileView(APIView):
    def get(self, request, pk):
        try:
            profile = UserProfile.objects.select_related('user').get(pk=pk)
        except UserProfile.DoesNotExist:
            return Response({'error': 'User not found.'}, status=404)
        
        recipes = Recipe.objects.filter(author=profile).select_related('author__user')[:20]
        
        # If the requester is the profile owner, they can see their private boards (like "Favorites")
        if request.user.is_authenticated and request.user == profile.user:
            boards = Board.objects.filter(owner=profile).prefetch_related('saves__recipe')
        else:
            boards = Board.objects.filter(owner=profile, is_public=True).prefetch_related('saves__recipe')

        return Response({
            'user': UserProfileSerializer(profile).data,
            'recipes': RecipeListSerializer(recipes, many=True).data,
            'boards': BoardWithRecipesSerializer(boards, many=True, context={'request': request}).data,
            'stats': {
                'recipes_count': Recipe.objects.filter(author=profile).count(),
                'likes_given': Like.objects.filter(user=profile).count(),
                'boards_count': boards.count(),
            },
        })


# ============================================================
# CHAT / MESSAGING
# ============================================================

class ConversationListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        profile = request.user.profile
        convos = Conversation.objects.filter(participants=profile).prefetch_related(
            'participants__user', 'messages__sender__user')
        return Response(ConversationListSerializer(convos, many=True, context={'request': request}).data)

    def post(self, request):
        other_user_id = request.data.get('user_id')
        if not other_user_id:
            return Response({'error': 'user_id is required.'}, status=400)
        try:
            other_profile = UserProfile.objects.get(pk=other_user_id)
        except UserProfile.DoesNotExist:
            return Response({'error': 'User not found.'}, status=404)
        profile = request.user.profile
        if other_profile == profile:
            return Response({'error': 'Cannot chat with yourself.'}, status=400)
        existing = Conversation.objects.filter(participants=profile).filter(participants=other_profile)
        if existing.exists():
            convo = existing.first()
        else:
            convo = Conversation.objects.create()
            convo.participants.add(profile, other_profile)
        return Response(ConversationListSerializer(convo, context={'request': request}).data, status=201)


class ConversationDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk):
        profile = request.user.profile
        try:
            convo = Conversation.objects.get(pk=pk, participants=profile)
        except Conversation.DoesNotExist:
            return Response({'error': 'Conversation not found.'}, status=404)
        convo.messages.filter(is_read=False).exclude(sender=profile).update(is_read=True)
        messages = convo.messages.select_related(
            'sender__user', 'shared_recipe__author__user').order_by('created_at')[:100]
        return Response({
            'conversation': ConversationListSerializer(convo, context={'request': request}).data,
            'messages': MessageSerializer(messages, many=True).data,
        })

    def post(self, request, pk):
        profile = request.user.profile
        try:
            convo = Conversation.objects.get(pk=pk, participants=profile)
        except Conversation.DoesNotExist:
            return Response({'error': 'Conversation not found.'}, status=404)
        text = request.data.get('text', '').strip()
        recipe_id = request.data.get('recipe_id')
        if not text and not recipe_id:
            return Response({'error': 'Message text or recipe_id required.'}, status=400)
        shared_recipe = None
        if recipe_id:
            try:
                shared_recipe = Recipe.objects.get(pk=recipe_id)
            except Recipe.DoesNotExist:
                return Response({'error': 'Recipe not found.'}, status=404)
        msg = Message.objects.create(
            conversation=convo, sender=profile, text=text, shared_recipe=shared_recipe)
        convo.save()
        return Response(MessageSerializer(msg).data, status=201)


# ============================================================
# HEALTH CHECK
# ============================================================

class HealthCheckView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        return Response({'status': 'ok', 'service': 'foodity-api', 'version': '1.0.0'})


# ============================================================
# AI RECIPE GENERATOR
# ============================================================

import google.generativeai as genai
import json
from django.conf import settings

class AIGenerateRecipeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        prompt_text = request.data.get('prompt', '').strip()
        ingredients = request.data.get('ingredients', [])
        
        if not prompt_text and not ingredients:
            return Response({'error': 'Please provide ingredients or a prompt.'}, status=400)

        api_key = settings.GEMINI_API_KEY
        if not api_key:
            return Response({'error': 'Gemini API key is not configured.'}, status=500)

        genai.configure(api_key=api_key)
        
        # Build the prompt
        system_instruction = (
            "You are a professional Master Chef AI building a JSON recipe. "
            "Return ONLY valid JSON that matches the requested schema. No markdown formatting blocks or extra text."
        )
        
        user_prompt = "Generate a creative, delicious recipe"
        if ingredients:
            user_prompt += f" using some or all of these ingredients: {', '.join(ingredients)}."
        if prompt_text:
            user_prompt += f" The user also requested: {prompt_text}."
            
        user_prompt += """
        
OUTPUT FORMAT REQUIREMENT:
You MUST return a raw valid JSON object (no ```json wrapper). 
Schema:
{
  "title": "Recipe Title",
  "description": "Short appetizing description",
  "prep_time": 15,
  "cook_time": 30,
  "servings": 4,
  "difficulty": "medium",
  "ingredients": [
    {"name": "Ingredient Name", "quantity": "2", "unit": "cups"}
  ],
  "steps": [
    {"instruction": "Step 1 text"}
  ],
  "nutrition": {
    "calories": 500,
    "protein": 20,
    "carbs": 50,
    "fats": 15
  }
}
"""
        try:
            model = genai.GenerativeModel('gemini-2.5-flash')
            response = model.generate_content(
                system_instruction + "\n\n" + user_prompt,
                generation_config=genai.types.GenerationConfig(
                    temperature=0.7,
                )
            )
            
            # Clean up the response formatting since Gemini might still output markdown
            text = response.text.strip()
            if text.startswith('```json'):
                text = text[7:]
            if text.startswith('```'):
                text = text[3:]
            if text.endswith('```'):
                text = text[:-3]
            
            recipe_data = json.loads(text.strip())
            return Response({'recipe': recipe_data})
            
        except json.JSONDecodeError:
            return Response({'error': 'AI generated invalid JSON structure.'}, status=500)
        except Exception as e:
            return Response({'error': str(e)}, status=500)


# ============================================================
# USER SEARCH
# ============================================================

class UserSearchView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        q = request.query_params.get('q', '').strip()
        if not q or len(q) < 2:
            return Response([])
        profiles = UserProfile.objects.filter(
            Q(display_name__icontains=q) | Q(user__username__icontains=q)
        ).select_related('user').exclude(user=request.user)[:20]
        return Response(UserProfileSerializer(profiles, many=True).data)


# ============================================================
# CALORIE TRACKER
# ============================================================

from django.db.models import Sum
from datetime import date as dt_date

class TrackerView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        date_str = request.query_params.get('date')
        try:
            target_date = dt_date.fromisoformat(date_str) if date_str else dt_date.today()
        except ValueError:
            target_date = dt_date.today()

        profile = request.user.profile
        meals = MealLog.objects.filter(user=profile, date=target_date).select_related('recipe')
        serialized = MealLogSerializer(meals, many=True).data

        # Group by meal_type
        grouped = {'breakfast': [], 'lunch': [], 'snacks': [], 'dinner': [], 'custom': []}
        for meal in serialized:
            mt = meal['meal_type']
            if mt in grouped:
                grouped[mt].append(meal)
            else:
                grouped['custom'].append(meal)

        # Daily totals
        totals = meals.aggregate(
            total_calories=Sum('calories'),
            total_protein=Sum('protein'),
            total_carbs=Sum('carbs'),
            total_fats=Sum('fats'),
        )
        for k, v in totals.items():
            totals[k] = round(v or 0, 1)

        return Response({
            'date': str(target_date),
            'meals': grouped,
            'totals': totals,
        })

    def post(self, request):
        profile = request.user.profile
        data = request.data.copy()

        # If recipe_id provided, auto-fill nutrition from recipe
        recipe_id = data.get('recipe')
        if recipe_id:
            try:
                recipe = Recipe.objects.select_related('nutrition').get(pk=recipe_id)
                if not data.get('meal_name'):
                    data['meal_name'] = recipe.title
                if hasattr(recipe, 'nutrition') and recipe.nutrition:
                    servings = float(data.get('servings', 1))
                    data['calories'] = round(recipe.nutrition.calories * servings, 1)
                    data['protein'] = round(recipe.nutrition.protein * servings, 1)
                    data['carbs'] = round(recipe.nutrition.carbs * servings, 1)
                    data['fats'] = round(recipe.nutrition.fats * servings, 1)
            except Recipe.DoesNotExist:
                return Response({'error': 'Recipe not found.'}, status=404)

        if not data.get('date'):
            data['date'] = str(dt_date.today())

        # Auto-calculate nutrition with AI if manual entry has name but no macros
        if not recipe_id and data.get('meal_name'):
            # Check if all macros are empty/zero
            has_macros = any(data.get(f) for f in ['calories', 'protein', 'carbs', 'fats'])
            if not has_macros:
                try:
                    import google.generativeai as genai
                    from django.conf import settings
                    import json
                    
                    if settings.GEMINI_API_KEY:
                        genai.configure(api_key=settings.GEMINI_API_KEY)
                        model = genai.GenerativeModel('gemini-2.5-flash')
                        
                        prompt = f"""
                        Estimate the nutritional values for 1 serving of: "{data['meal_name']}".
                        Return ONLY a raw JSON object with keys "calories", "protein", "carbs", and "fats" with numeric values.
                        Example: {{"calories": 300, "protein": 15, "carbs": 30, "fats": 10}}
                        """
                        response = model.generate_content(prompt)
                        text = response.text.strip()
                        if text.startswith('```json'): text = text[7:]
                        if text.startswith('```'): text = text[3:]
                        if text.endswith('```'): text = text[:-3]
                        
                        ai_data = json.loads(text.strip())
                        data['calories'] = round(float(ai_data.get('calories', 0)), 1)
                        data['protein'] = round(float(ai_data.get('protein', 0)), 1)
                        data['carbs'] = round(float(ai_data.get('carbs', 0)), 1)
                        data['fats'] = round(float(ai_data.get('fats', 0)), 1)
                        data['notes'] = "Nutrition estimated by AI" # Optional: might need to add field or ignore
                except Exception as e:
                    print("AI inference failed:", str(e))
                    pass # Silently fail and proceed with empty macros if AI fails

        serializer = MealLogSerializer(data=data)
        if serializer.is_valid():
            serializer.save(user=profile)
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)


class TrackerDeleteView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, pk):
        try:
            log = MealLog.objects.get(pk=pk, user=request.user.profile)
        except MealLog.DoesNotExist:
            return Response({'error': 'Meal log not found.'}, status=404)
        log.delete()
        return Response(status=204)


class AskAIChefView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        try:
            recipe = Recipe.objects.get(pk=pk)
        except Recipe.DoesNotExist:
            return Response({'error': 'Recipe not found.'}, status=404)

        message = request.data.get('message', '').strip()
        history = request.data.get('history', [])
        
        if not message:
            return Response({'error': 'Message is required.'}, status=400)

        api_key = settings.GEMINI_API_KEY
        if not api_key:
            return Response({'error': 'Gemini API key is not configured.'}, status=500)

        genai.configure(api_key=api_key)
        
        ingredients = list(recipe.ingredients.order_by('order').values_list('name', 'quantity', 'unit'))
        ing_str = "\n".join([f"- {i[1] or ''} {i[2] or ''} {i[0]}".strip() for i in ingredients])
        
        steps = list(recipe.steps.order_by('step_number').values_list('step_number', 'instruction'))
        steps_str = "\n".join([f"Step {s[0]}: {s[1]}" for s in steps])

        system_prompt = f"""You are 'AI Chef', a helpful culinary AI assistant for the Foodity app.
The user is asking a question specifically about the following recipe:

Title: {recipe.title}
Difficulty: {recipe.difficulty}
Time: {recipe.prep_time}m prep, {recipe.cook_time}m cook ({recipe.total_time}m total)

Ingredients:
{ing_str}

Instructions:
{steps_str}

Conversation History (if any):
{history}

Please answer the user's latest question briefly, accurately, and helpfully based strictly on the cooking context provided. Keep it conversational.
User's Question: {message}
"""

        try:
            model = genai.GenerativeModel('gemini-2.5-flash')
            response = model.generate_content(system_prompt)
            return Response({'reply': response.text})
        except Exception as e:
            import traceback
            traceback.print_exc()
            return Response({'error': str(e)}, status=500)
