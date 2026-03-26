using System;
using System.Collections.Generic;
using System.Drawing;
using System.Linq;
using System.Windows.Forms;

namespace PixelAdventure;

public partial class Form1 : Form
{
    const int TileSize = 40;
    const int GridCols = 16;
    const int GridRows = 12;

    enum TileType { Empty, Wall, Gem, EnemySpawn, Exit }

    TileType[,] grid = new TileType[GridRows, GridCols];
    Point player;
    List<Point> enemyPositions = new();
    int gemsCollected = 0;
    int gemsRequired = 3;
    int level = 1;
    bool levelComplete = false;
    bool gameOver = false;

    readonly System.Windows.Forms.Timer gameTimer;
    readonly Random rand = new();

    public Form1()
    {
        InitializeComponent();

        Text = "Pixel Adventure: The Lost Colors of Lumina";
        ClientSize = new Size(GridCols * TileSize, GridRows * TileSize + 90);
        DoubleBuffered = true;
        KeyPreview = true;

        gameTimer = new System.Windows.Forms.Timer { Interval = 120 };
        gameTimer.Tick += (s, e) => GameTick();

        StartLevel(1);

        Paint += Form1_Paint;
        KeyDown += Form1_KeyDown;
        gameTimer.Start();
    }

    void StartLevel(int newLevel)
    {
        level = newLevel;
        gemsCollected = 0;
        levelComplete = false;
        gameOver = false;
        enemyPositions.Clear();

        for (int r = 0; r < GridRows; r++)
            for (int c = 0; c < GridCols; c++)
                grid[r, c] = TileType.Empty;

        // outer border walls
        for (int c = 0; c < GridCols; c++)
        {
            grid[0, c] = TileType.Wall;
            grid[GridRows - 1, c] = TileType.Wall;
        }
        for (int r = 0; r < GridRows; r++)
        {
            grid[r, 0] = TileType.Wall;
            grid[r, GridCols - 1] = TileType.Wall;
        }

        // random obstacles
        for (int i = 0; i < 28; i++)
        {
            int r = rand.Next(1, GridRows - 1);
            int c = rand.Next(1, GridCols - 1);
            if (grid[r, c] == TileType.Empty)
                grid[r, c] = TileType.Wall;
        }

        // add gems
        for (int i = 0; i < gemsRequired; i++)
        {
            while (true)
            {
                int r = rand.Next(1, GridRows - 2);
                int c = rand.Next(1, GridCols - 2);
                if (grid[r, c] == TileType.Empty)
                {
                    grid[r, c] = TileType.Gem;
                    break;
                }
            }
        }

        // add enemy spawns
        int enemyCount = Math.Min(4 + level, 8);
        for (int i = 0; i < enemyCount; i++)
        {
            while (true)
            {
                int r = rand.Next(1, GridRows - 1);
                int c = rand.Next(1, GridCols - 1);
                if (grid[r, c] == TileType.Empty)
                {
                    grid[r, c] = TileType.EnemySpawn;
                    enemyPositions.Add(new Point(c, r));
                    break;
                }
            }
        }

        // exit
        grid[GridRows - 2, GridCols - 2] = TileType.Exit;

        // player start
        player = new Point(1, 1);
        if (grid[player.Y, player.X] != TileType.Empty)
            player = new Point(1, 1);

        Invalidate();
    }

    void Form1_KeyDown(object? sender, KeyEventArgs e)
    {
        if (gameOver)
        {
            if (e.KeyCode == Keys.Enter)
                StartLevel(1);
            return;
        }

        if (e.KeyCode == Keys.Enter && levelComplete)
        {
            StartLevel(level + 1);
            return;
        }

        Point newPos = player;

        if (e.KeyCode == Keys.Left || e.KeyCode == Keys.A)
            newPos.X--;
        if (e.KeyCode == Keys.Right || e.KeyCode == Keys.D)
            newPos.X++;
        if (e.KeyCode == Keys.Up || e.KeyCode == Keys.W)
            newPos.Y--;
        if (e.KeyCode == Keys.Down || e.KeyCode == Keys.S)
            newPos.Y++;

        if (newPos != player && IsWalkable(newPos))
        {
            player = newPos;

            if (grid[player.Y, player.X] == TileType.Gem)
            {
                gemsCollected++;
                grid[player.Y, player.X] = TileType.Empty;
            }
            else if (grid[player.Y, player.X] == TileType.Exit && gemsCollected >= gemsRequired)
            {
                levelComplete = true;
            }
        }

        Invalidate();
    }

    bool IsWalkable(Point p)
    {
        if (p.X < 0 || p.Y < 0 || p.X >= GridCols || p.Y >= GridRows)
            return false;

        return grid[p.Y, p.X] != TileType.Wall;
    }

    void GameTick()
    {
        if (gameOver || levelComplete)
        {
            Invalidate();
            return;
        }

        // move enemies toward player each tick
        for (int i = 0; i < enemyPositions.Count; i++)
        {
            Point e = enemyPositions[i];
            Point best = e;
            int bestDist = int.MaxValue;

            foreach (var shift in new[] { new Point(1,0), new Point(-1,0), new Point(0,1), new Point(0,-1) })
            {
                Point cand = new Point(e.X + shift.X, e.Y + shift.Y);
                if (cand.X < 1 || cand.Y < 1 || cand.X >= GridCols-1 || cand.Y >= GridRows-1)
                    continue;
                if (grid[cand.Y, cand.X] == TileType.Wall) continue;
                if (enemyPositions.Any(ep => ep == cand)) continue;

                int dist = Math.Abs(cand.X - player.X) + Math.Abs(cand.Y - player.Y);
                if (dist < bestDist)
                {
                    bestDist = dist;
                    best = cand;
                }
            }

            enemyPositions[i] = best;
        }

        // collision
        if (enemyPositions.Any(e => e == player))
        {
            gameOver = true;
        }

        Invalidate();
    }

    void Form1_Paint(object? sender, PaintEventArgs e)
    {
        Graphics g = e.Graphics;
        g.Clear(Color.DarkSlateBlue);

        for (int r = 0; r < GridRows; r++)
        {
            for (int c = 0; c < GridCols; c++)
            {
                Rectangle rect = new Rectangle(c * TileSize, r * TileSize, TileSize, TileSize);

                switch (grid[r, c])
                {
                    case TileType.Wall:
                        g.FillRectangle(Brushes.DimGray, rect);
                        break;
                    case TileType.Gem:
                        g.FillRectangle(Brushes.Plum, rect);
                        break;
                    case TileType.EnemySpawn:
                        g.FillRectangle(Brushes.Transparent, rect);
                        break;
                    case TileType.Exit:
                        var exitBrush = gemsCollected >= gemsRequired ? Brushes.Gold : Brushes.Sienna;
                        g.FillRectangle(exitBrush, rect);
                        break;
                    default:
                        g.FillRectangle(Brushes.DarkOliveGreen, rect);
                        break;
                }

                g.DrawRectangle(Pens.Black, rect);
            }
        }

        // draw enemies
        foreach (var enemy in enemyPositions)
        {
            Rectangle rect = new Rectangle(enemy.X * TileSize + 6, enemy.Y * TileSize + 6, TileSize - 12, TileSize - 12);
            g.FillEllipse(Brushes.Red, rect);
            g.DrawEllipse(Pens.Black, rect);
        }

        // draw player
        Rectangle playerRect = new Rectangle(player.X * TileSize + 6, player.Y * TileSize + 6, TileSize - 12, TileSize - 12);
        g.FillEllipse(Brushes.Cyan, playerRect);
        g.DrawEllipse(Pens.Black, playerRect);

        // UI
        var uiY = GridRows * TileSize + 10;
        g.FillRectangle(Brushes.Black, 0, GridRows * TileSize, GridCols * TileSize, 90);

        g.DrawString($"Level: {level}", new Font("Segoe UI", 12), Brushes.White, 10, uiY);
        g.DrawString($"Gems: {gemsCollected}/{gemsRequired}", new Font("Segoe UI", 12), Brushes.White, 120, uiY);
        g.DrawString(gameOver ? "Game Over! Press Enter to restart" : levelComplete ? "Level complete! Press Enter to continue" : "Use arrow keys/WASD to move. Collect gems and reach the exit.", new Font("Segoe UI", 11), Brushes.LightYellow, 10, uiY + 30);

        if (gameOver)
        {
            var msg = "☠️ You were captured by shadow monsters!";
            g.DrawString(msg, new Font("Segoe UI", 14, FontStyle.Bold), Brushes.Red, 150, uiY + 55);
        }

        if (levelComplete)
        {
            var msg = level >= 5 ? "🎉 Congratulations! You restored Lumina's colors!" : "✨ You restored a region of Lumina!";
            g.DrawString(msg, new Font("Segoe UI", 14, FontStyle.Bold), Brushes.Lime, 150, uiY + 55);
        }
    }
}
