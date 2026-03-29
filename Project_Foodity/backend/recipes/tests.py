from django.contrib.auth.models import User
from rest_framework.test import APITestCase
from rest_framework import status
from .models import UserProfile, Recipe, Board, Comment, Like, Save

class AuthenticationTests(APITestCase):
    def test_registration(self):
        data = {
            'username': 'testuser',
            'email': 'test@example.com',
            'password': 'password123',
            'display_name': 'Test User'
        }
        res = self.client.post('/api/auth/register/', data)
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertIn('tokens', res.data)
        self.assertTrue(User.objects.filter(username='testuser').exists())

    def test_login(self):
        user = User.objects.create_user(username='loginuser', email='login@example.com', password='password123')
        UserProfile.objects.create(user=user, display_name='Login User')
        
        data = {'username': 'login@example.com', 'password': 'password123'}
        res = self.client.post('/api/auth/login/', data)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertIn('tokens', res.data)


class RecipeTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='chef', password='password123')
        self.profile = UserProfile.objects.create(user=self.user, display_name='Chef User')
        self.client.force_authenticate(user=self.user)

    def test_create_recipe(self):
        data = {
            'title': 'Test Recipe',
            'description': 'A delicious test',
            'prep_time': 10,
            'cook_time': 20,
            'difficulty': 'easy',
            'ingredients': [{'name': 'Salt', 'quantity': '1', 'unit': 'tsp'}],
            'steps': []
        }
        res = self.client.post('/api/recipes/', data, format='json')
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Recipe.objects.count(), 1)
        self.assertEqual(Recipe.objects.first().author, self.profile)

    def test_create_recipe_with_upload(self):
        from django.core.files.uploadedfile import SimpleUploadedFile
        from unittest.mock import patch
        
        # Create a small dummy image
        image_content = b'\x47\x49\x46\x38\x39\x61\x01\x00\x01\x00\x00\x00\x00\x21\xf9\x04\x01\x00\x00\x00\x00\x2c\x00\x00\x00\x00\x01\x00\x01\x00\x00\x02\x02\x4c\x01\x00\x3b'
        image_file = SimpleUploadedFile('test.gif', image_content, content_type='image/gif')
        
        data = {
            'title': 'Upload Recipe',
            'image': image_file,
            'ingredients_json': '[{"name": "Water", "quantity": "1", "unit": "cup"}]',
            'steps_json': '[{"instruction": "Boil it", "step_number": 1}]'
        }
        
        with patch('cloudinary.uploader.upload') as mocked_upload:
            mocked_upload.return_value = {'secure_url': 'https://cloudinary.com/test.jpg'}
            res = self.client.post('/api/recipes/', data, format='multipart')
            
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        recipe = Recipe.objects.get(title='Upload Recipe')
        self.assertEqual(recipe.image, 'https://cloudinary.com/test.jpg')
        self.assertEqual(recipe.ingredients.count(), 1)
        self.assertEqual(recipe.ingredients.count(), 1)
        self.assertEqual(recipe.steps.count(), 1)

    def test_list_recipes(self):
        Recipe.objects.create(author=self.profile, title='Recipe 1', description='Desc 1', prep_time=10)
        Recipe.objects.create(author=self.profile, title='Recipe 2', description='Desc 2', prep_time=10)
        res = self.client.get('/api/recipes/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data['count'], 2)

class SocialTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='socialuser', password='password123')
        self.profile = UserProfile.objects.create(user=self.user, display_name='Social User')
        self.client.force_authenticate(user=self.user)
        
        self.author_user = User.objects.create_user(username='author', password='password123')
        self.author_profile = UserProfile.objects.create(user=self.author_user, display_name='Author')
        self.recipe = Recipe.objects.create(author=self.author_profile, title='Test Recipe', description='Test')

    def test_like_recipe(self):
        res = self.client.post(f'/api/recipes/{self.recipe.id}/like/')
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertTrue(res.data['liked'])
        self.recipe.refresh_from_db()
        self.assertEqual(self.recipe.likes_count, 1)

        # Unlike
        res = self.client.post(f'/api/recipes/{self.recipe.id}/like/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertFalse(res.data['liked'])

    def test_save_recipe(self):
        # Save without explicitly offering a board creates a "Favorites" board
        res = self.client.post(f'/api/recipes/{self.recipe.id}/save/')
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertTrue(res.data['saved'])
        self.recipe.refresh_from_db()
        self.assertEqual(self.recipe.saves_count, 1)
        self.assertEqual(Board.objects.count(), 1)

    def test_comment_recipe(self):
        data = {'text': 'This is Great!'}
        res = self.client.post(f'/api/recipes/{self.recipe.id}/comments/', data)
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Comment.objects.count(), 1)

class BoardTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='boarduser', password='password123')
        self.profile = UserProfile.objects.create(user=self.user, display_name='Board User')
        self.client.force_authenticate(user=self.user)

    def test_create_board(self):
        data = {'name': 'Holiday Recipes', 'description': 'For thanksgiving'}
        res = self.client.post('/api/boards/', data)
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Board.objects.count(), 1)
        self.assertEqual(Board.objects.first().owner, self.profile)
