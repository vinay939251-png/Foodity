using System;
using System.Collections.Generic;
using System.Threading;

const int width = 30;
const int height = 20;
char[,] screen = new char[height, width];

int playerX = width / 2;
int lives = 3;
int score = 0;
int tick = 0;

var bullets = new List<(int x, int y)>();
var enemies = new List<(int x, int y)>();
var random = new Random();

Console.CursorVisible = false;
Console.Title = "Simple2D Console Shooter";

void ClearScreenBuffer()
{
    for (int y = 0; y < height; y++)
        for (int x = 0; x < width; x++)
            screen[y, x] = ' ';
}

void Render()
{
    Console.SetCursorPosition(0, 0);

    for (int y = 0; y < height; y++)
    {
        for (int x = 0; x < width; x++)
        {
            Console.Write(screen[y, x]);
        }
        Console.WriteLine();
    }

    Console.WriteLine($"Score: {score}   Lives: {lives}   Tick: {tick}");
    Console.WriteLine("Controls: A/D or Left/Right to move, Space to shoot, Esc to exit");
}

bool gameOver = false;

while (!gameOver)
{
    tick++;
    ClearScreenBuffer();

    // input
    while (Console.KeyAvailable)
    {
        var key = Console.ReadKey(true).Key;
        if (key == ConsoleKey.Escape)
        {
            gameOver = true;
            break;
        }

        if (key == ConsoleKey.A || key == ConsoleKey.LeftArrow)
        {
            playerX = Math.Max(0, playerX - 1);
        }
        else if (key == ConsoleKey.D || key == ConsoleKey.RightArrow)
        {
            playerX = Math.Min(width - 1, playerX + 1);
        }
        else if (key == ConsoleKey.Spacebar)
        {
            bullets.Add((playerX, height - 2));
        }
    }

    if (gameOver)
        break;

    // spawn enemies
    if (tick % 8 == 0)
    {
        int x = random.Next(0, width);
        enemies.Add((x, 0));
    }

    // move bullets
    for (int i = bullets.Count - 1; i >= 0; i--)
    {
        var b = bullets[i];
        int ny = b.y - 1;
        if (ny < 0)
        {
            bullets.RemoveAt(i);
            continue;
        }

        // collision with enemy
        bool hit = false;
        for (int j = enemies.Count - 1; j >= 0; j--)
        {
            if (enemies[j].x == b.x && enemies[j].y == ny)
            {
                enemies.RemoveAt(j);
                bullets.RemoveAt(i);
                score += 10;
                hit = true;
                break;
            }
        }

        if (!hit)
            bullets[i] = (b.x, ny);
    }

    // move enemies
    for (int i = enemies.Count - 1; i >= 0; i--)
    {
        var e = enemies[i];
        int ny = e.y + 1;
        if (ny >= height)
        {
            enemies.RemoveAt(i);
            lives -= 1;
            if (lives <= 0)
            {
                gameOver = true;
            }
            continue;
        }

        if (ny == height - 1 && e.x == playerX)
        {
            enemies.RemoveAt(i);
            lives -= 1;
            if (lives <= 0)
            {
                gameOver = true;
            }
            continue;
        }

        enemies[i] = (e.x, ny);
    }

    // render objects
    foreach (var (x, y) in bullets)
    {
        if (y >= 0 && y < height && x >= 0 && x < width)
            screen[y, x] = '|';
    }

    foreach (var (x, y) in enemies)
    {
        if (y >= 0 && y < height && x >= 0 && x < width)
            screen[y, x] = 'V';
    }

    screen[height - 1, playerX] = '^';

    Render();

    if (gameOver)
        break;

    Thread.Sleep(70);
}

Console.SetCursorPosition(0, height + 3);
Console.CursorVisible = true;
Console.WriteLine();
if (lives <= 0)
    Console.WriteLine("Game Over! You lost all lives.");
else
    Console.WriteLine("Game Exited.");
Console.WriteLine($"Final score: {score}");
Console.WriteLine("Press any key to close...");
Console.ReadKey(true);

