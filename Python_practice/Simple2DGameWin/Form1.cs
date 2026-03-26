using System;
using System.Collections.Generic;
using System.Drawing;
using System.Windows.Forms;
using Timer = System.Windows.Forms.Timer;

namespace Simple2DGameWin;

public partial class Form1 : Form
{
    private readonly Timer gameTimer;
    private readonly List<Point> bullets = new();
    private readonly List<Point> enemies = new();
    private readonly Random random = new();
    private readonly Bitmap playerSprite;
    private readonly Bitmap enemySprite;
    private readonly Bitmap bulletSprite;

    private Point playerLocation;
    private int lives = 3;
    private int score = 0;
    private int tick = 0;
    private bool moveLeft;
    private bool moveRight;
    private int lastShotTick = -100;
    private bool gameOver;

    public Form1()
    {
        InitializeComponent();

        Text = "Simple 2D WinForms Shooter";
        ClientSize = new Size(640, 480);
        DoubleBuffered = true;
        BackColor = Color.Black;

        playerLocation = new Point(ClientSize.Width / 2, ClientSize.Height - 72);

        playerSprite = CreatePlayerSprite();
        enemySprite = CreateEnemySprite();
        bulletSprite = CreateBulletSprite();

        gameTimer = new Timer { Interval = 16 };
        gameTimer.Tick += GameTimer_Tick;

        KeyDown += Form1_KeyDown;
        KeyUp += Form1_KeyUp;
        Paint += Form1_Paint;

        gameTimer.Start();
    }

    private void Form1_KeyDown(object? sender, KeyEventArgs e)
    {
        if (gameOver && e.KeyCode == Keys.Enter)
        {
            RestartGame();
            return;
        }

        if (e.KeyCode == Keys.Left || e.KeyCode == Keys.A)
            moveLeft = true;

        if (e.KeyCode == Keys.Right || e.KeyCode == Keys.D)
            moveRight = true;

        if (e.KeyCode == Keys.Space && !gameOver)
            FireBullet();

        if (e.KeyCode == Keys.Escape)
            Close();
    }

    private void Form1_KeyUp(object? sender, KeyEventArgs e)
    {
        if (e.KeyCode == Keys.Left || e.KeyCode == Keys.A)
            moveLeft = false;

        if (e.KeyCode == Keys.Right || e.KeyCode == Keys.D)
            moveRight = false;
    }

    private void GameTimer_Tick(object? sender, EventArgs e)
    {
        if (gameOver)
        {
            Invalidate();
            return;
        }

        tick++;

        // spawn enemies
        if (tick % 20 == 0)
        {
            int x = random.Next(16, ClientSize.Width - 32);
            enemies.Add(new Point(x, -16));
        }

        // player movement
        int speed = 5;
        if (moveLeft)
            playerLocation.X = Math.Max(0, playerLocation.X - speed);
        if (moveRight)
            playerLocation.X = Math.Min(ClientSize.Width - playerSprite.Width, playerLocation.X + speed);

        // bullets
        for (int i = bullets.Count - 1; i >= 0; i--)
        {
            bullets[i] = new Point(bullets[i].X, bullets[i].Y - 10);
            if (bullets[i].Y < -bulletSprite.Height)
                bullets.RemoveAt(i);
        }

        // enemy movement and win/loss checks
        for (int i = enemies.Count - 1; i >= 0; i--)
        {
            enemies[i] = new Point(enemies[i].X, enemies[i].Y + 4);
            if (enemies[i].Y > ClientSize.Height)
            {
                enemies.RemoveAt(i);
                lives--;
                if (lives <= 0)
                    EndGame();
                continue;
            }
        }

        // collisions
        for (int i = bullets.Count - 1; i >= 0; i--)
        {
            Rectangle bulletRect = new(bullets[i], bulletSprite.Size);
            for (int j = enemies.Count - 1; j >= 0; j--)
            {
                Rectangle enemyRect = new(enemies[j], enemySprite.Size);
                if (bulletRect.IntersectsWith(enemyRect))
                {
                    bullets.RemoveAt(i);
                    enemies.RemoveAt(j);
                    score += 10;
                    break;
                }
            }
        }

        // enemy hits player
        Rectangle playerRect = new(playerLocation, playerSprite.Size);
        for (int i = enemies.Count - 1; i >= 0; i--)
        {
            Rectangle enemyRect = new(enemies[i], enemySprite.Size);
            if (playerRect.IntersectsWith(enemyRect))
            {
                enemies.RemoveAt(i);
                lives--;
                if (lives <= 0)
                    EndGame();
            }
        }

        Invalidate();
    }

    private void FireBullet()
    {
        if (tick - lastShotTick < 8)
            return;

        lastShotTick = tick;
        bullets.Add(new Point(playerLocation.X + playerSprite.Width / 2 - bulletSprite.Width / 2, playerLocation.Y - bulletSprite.Height));
    }

    private void EndGame()
    {
        gameOver = true;
        gameTimer.Stop();
    }

    private void RestartGame()
    {
        bullets.Clear();
        enemies.Clear();
        lives = 3;
        score = 0;
        tick = 0;
        gameOver = false;
        playerLocation = new Point(ClientSize.Width / 2, ClientSize.Height - 72);
        gameTimer.Start();
    }

    private void Form1_Paint(object? sender, PaintEventArgs e)
    {
        var g = e.Graphics;

        g.Clear(Color.Black);

        // draw sprites
        foreach (var b in bullets)
            g.DrawImage(bulletSprite, b);

        foreach (var ePos in enemies)
            g.DrawImage(enemySprite, ePos);

        g.DrawImage(playerSprite, playerLocation);

        // HUD
        using var font = new Font("Consolas", 14, FontStyle.Bold);
        g.DrawString($"Score: {score}", font, Brushes.LightGreen, 8, 8);
        g.DrawString($"Lives: {lives}", font, Brushes.LightCoral, 8, 30);
        g.DrawString("Move: ←/→ or A/D | Shoot: Space | Esc: Exit", font, Brushes.WhiteSmoke, 8, 52);

        if (gameOver)
        {
            using var big = new Font("Consolas", 32, FontStyle.Bold);
            var msg = "GAME OVER";
            var size = g.MeasureString(msg, big);
            g.DrawString(msg, big, Brushes.Red, (ClientSize.Width - size.Width) / 2, (ClientSize.Height - size.Height) / 2 - 40);

            var hint = "Press Enter to restart";
            var hintSize = g.MeasureString(hint, font);
            g.DrawString(hint, font, Brushes.White, (ClientSize.Width - hintSize.Width) / 2, (ClientSize.Height - hintSize.Height) / 2 + 20);
        }
    }

    private static Bitmap CreatePlayerSprite()
    {
        var bmp = new Bitmap(40, 26);
        using var g = Graphics.FromImage(bmp);
        g.SmoothingMode = System.Drawing.Drawing2D.SmoothingMode.HighQuality;
        g.Clear(Color.Transparent);
        Point[] poly = { new(0, 26), new(20, 0), new(40, 26) };
        g.FillPolygon(Brushes.Cyan, poly);
        g.FillRectangle(Brushes.DarkCyan, 14, 14, 12, 12);
        return bmp;
    }

    private static Bitmap CreateEnemySprite()
    {
        var bmp = new Bitmap(32, 24);
        using var g = Graphics.FromImage(bmp);
        g.SmoothingMode = System.Drawing.Drawing2D.SmoothingMode.HighQuality;
        g.Clear(Color.Transparent);
        g.FillEllipse(Brushes.OrangeRed, 0, 0, 32, 24);
        g.FillEllipse(Brushes.IndianRed, 4, 4, 24, 16);
        return bmp;
    }

    private static Bitmap CreateBulletSprite()
    {
        var bmp = new Bitmap(6, 14);
        using var g = Graphics.FromImage(bmp);
        g.Clear(Color.Transparent);
        g.FillRectangle(Brushes.Yellow, 2, 0, 2, 14);
        g.FillEllipse(Brushes.White, 0, 8, 6, 6);
        return bmp;
    }
}

