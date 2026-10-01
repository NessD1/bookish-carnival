-- title:  VOID DRIFTER
-- author: AI Pair Programmer
-- desc:   Retro Space Shooter / Asteroids Game in Lua
-- script: lua

-- Screen resolution: 240x136
-- Inputs:
--  btn(0): Up (Thrust)
--  btn(2): Left (Rotate CCW)
--  btn(3): Right (Rotate CW)
--  btn(4): Button A / Z key (Shoot)
--  btn(5): Button B / X key (Hyper-warp / Shield)

local player = {
    x = 120,
    y = 68,
    vx = 0,
    vy = 0,
    angle = -math.pi / 2, -- pointing up
    thrust = false,
    radius = 5,
    cooldown = 0,
    invuln = 120,
    score = 0,
    lives = 3,
    alive = true,
    warp_cooldown = 0
}

local bullets = {}
local asteroids = {}
local particles = {}
local stars = {}
local wave = 1
local game_state = "title" -- "title", "play", "gameover"
local shake_time = 0

-- Initialize starfield
for i = 1, 60 do
    table.insert(stars, {
        x = math.random(0, 239),
        y = math.random(0, 135),
        speed = math.random(1, 3) * 0.15,
        color = math.random() > 0.4 and 15 or 14
    })
end

local function spawn_particle(x, y, vx, vy, color, life)
    table.insert(particles, {
        x = x,
        y = y,
        vx = vx,
        vy = vy,
        color = color,
        life = life,
        max_life = life
    })
end

local function spawn_explosion(x, y, count, color)
    for i = 1, count do
        local spd = math.random() * 2 + 0.5
        local ang = math.random() * math.pi * 2
        spawn_particle(
            x,
            y,
            math.cos(ang) * spd,
            math.sin(ang) * spd,
            color or (math.random() > 0.5 and 9 or 4), -- orange/pink
            math.random(15, 30)
        )
    end
end

local function spawn_asteroid(x, y, size)
    local ang = math.random() * math.pi * 2
    local spd = (4 - size) * 0.4 + math.random() * 0.3
    local verts = {}
    local num_verts = 8
    local base_radius = size * 5 + 3

    for i = 1, num_verts do
        local a = (i / num_verts) * math.pi * 2
        local r = base_radius + math.random(-2, 2)
        table.insert(verts, { x = math.cos(a) * r, y = math.sin(a) * r })
    end

    table.insert(asteroids, {
        x = x,
        y = y,
        vx = math.cos(ang) * spd,
        vy = math.sin(ang) * spd,
        rot = 0,
        rot_speed = (math.random() - 0.5) * 0.05,
        size = size, -- 3: Large, 2: Med, 1: Small
        radius = base_radius,
        verts = verts
    })
end

local function spawn_wave(num)
    for i = 1, 3 + num do
        local edge = math.random(1, 4)
        local ax, ay = 0, 0
        if edge == 1 then ax = math.random(0, 240); ay = -10
        elseif edge == 2 then ax = 250; ay = math.random(0, 136)
        elseif edge == 3 then ax = math.random(0, 240); ay = 146
        else ax = -10; ay = math.random(0, 136) end
        spawn_asteroid(ax, ay, 3)
    end
end

local function reset_game()
    player.x = 120
    player.y = 68
    player.vx = 0
    player.vy = 0
    player.angle = -math.pi / 2
    player.lives = 3
    player.score = 0
    player.invuln = 120
    player.alive = true
    wave = 1
    bullets = {}
    asteroids = {}
    particles = {}
    spawn_wave(wave)
end

function TIC()
    -- SCREEN SHAKE
    local ox, oy = 0, 0
    if shake_time > 0 then
        ox = math.random(-2, 2)
        oy = math.random(-2, 2)
        shake_time = shake_time - 1
    end

    -- UPDATE STARS
    for _, s in ipairs(stars) do
        s.x = s.x - s.speed
        if s.x < 0 then
            s.x = 240
            s.y = math.random(0, 135)
        end
    end

    -- STATE MACHINE
    if game_state == "title" then
        if btnp(4) or btnp(0) then
            reset_game()
            game_state = "play"
        end
    elseif game_state == "gameover" then
        if btnp(4) then
            game_state = "title"
        end
    elseif game_state == "play" then
        -- Controls
        if btn(2) then player.angle = player.angle - 0.08 end
        if btn(3) then player.angle = player.angle + 0.08 end

        player.thrust = btn(0)
        if player.thrust then
            local accel = 0.09
            player.vx = player.vx + math.cos(player.angle) * accel
            player.vy = player.vy + math.sin(player.angle) * accel

            -- Engine exhaust trail
            local back_x = player.x - math.cos(player.angle) * 6
            local back_y = player.y - math.sin(player.angle) * 6
            local spread = (math.random() - 0.5) * 0.5
            spawn_particle(
                back_x,
                back_y,
                -math.cos(player.angle + spread) * (1.5 + math.random()),
                -math.sin(player.angle + spread) * (1.5 + math.random()),
                math.random() > 0.4 and 4 or 9,
                math.random(6, 14)
            )
        end

        -- Friction / max speed
        player.vx = player.vx * 0.985
        player.vy = player.vy * 0.985

        -- Move player
        player.x = (player.x + player.vx) % 240
        player.y = (player.y + player.vy) % 136

        -- Shooting
        if player.cooldown > 0 then player.cooldown = player.cooldown - 1 end
        if (btn(4) or btnp(4)) and player.cooldown == 0 and player.alive then
            local b_spd = 3.5
            table.insert(bullets, {
                x = player.x + math.cos(player.angle) * 7,
                y = player.y + math.sin(player.angle) * 7,
                vx = math.cos(player.angle) * b_spd + player.vx * 0.4,
                vy = math.sin(player.angle) * b_spd + player.vy * 0.4,
                life = 45
            })
            player.cooldown = 10
            sfx(0, 48, 4, 0, 10, 0)
        end

        -- Hyper-warp (Emergency teleport)
        if player.warp_cooldown > 0 then player.warp_cooldown = player.warp_cooldown - 1 end
        if btnp(5) and player.warp_cooldown == 0 and player.alive then
            spawn_explosion(player.x, player.y, 10, 12)
            player.x = math.random(20, 220)
            player.y = math.random(20, 116)
            player.vx = 0
            player.vy = 0
            player.invuln = 45
            player.warp_cooldown = 180
            sfx(1, 36, 12, 0, 12, 0)
        end

        if player.invuln > 0 then player.invuln = player.invuln - 1 end

        -- Wave check
        if #asteroids == 0 then
            wave = wave + 1
            spawn_wave(wave)
            player.score = player.score + 500
        end

        -- Update Bullets
        for i = #bullets, 1, -1 do
            local b = bullets[i]
            b.x = (b.x + b.vx) % 240
            b.y = (b.y + b.vy) % 136
            b.life = b.life - 1
            if b.life <= 0 then
                table.remove(bullets, i)
            end
        end

        -- Update Asteroids & Collisions with bullets
        for i = #asteroids, 1, -1 do
            local a = asteroids[i]
            a.x = (a.x + a.vx) % 240
            a.y = (a.y + a.vy) % 136
            a.rot = a.rot + a.rot_speed

            local destroyed = false
            for bi = #bullets, 1, -1 do
                local b = bullets[bi]
                local dist_sq = (a.x - b.x)^2 + (a.y - b.y)^2
                if dist_sq < (a.radius + 2)^2 then
                    -- Bullet hit asteroid
                    table.remove(bullets, bi)
                    destroyed = true
                    break
                end
            end

            if destroyed then
                spawn_explosion(a.x, a.y, a.size * 6, 15)
                player.score = player.score + (4 - a.size) * 100
                shake_time = 4

                if a.size > 1 then
                    -- Split into 2 smaller pieces
                    spawn_asteroid(a.x, a.y, a.size - 1)
                    spawn_asteroid(a.x, a.y, a.size - 1)
                end
                table.remove(asteroids, i)
                sfx(2, 24, 8, 1, 14, 0)
            else
                -- Check collision with player
                if player.alive and player.invuln <= 0 then
                    local p_dist_sq = (a.x - player.x)^2 + (a.y - player.y)^2
                    if p_dist_sq < (a.radius + player.radius)^2 then
                        -- Player crashed!
                        spawn_explosion(player.x, player.y, 25, 9)
                        shake_time = 14
                        sfx(3, 16, 16, 2, 15, 0)
                        player.lives = player.lives - 1
                        if player.lives <= 0 then
                            player.alive = false
                            game_state = "gameover"
                        else
                            player.x = 120
                            player.y = 68
                            player.vx = 0
                            player.vy = 0
                            player.invuln = 120
                        end
                    end
                end
            end
        end
    end

    -- Update Particles
    for i = #particles, 1, -1 do
        local p = particles[i]
        p.x = p.x + p.vx
        p.y = p.y + p.vy
        p.life = p.life - 1
        if p.life <= 0 then
            table.remove(particles, i)
        end
    end

    -- RENDER PASS
    cls(0)

    -- Draw Starfield
    for _, s in ipairs(stars) do
        pix(s.x + ox, s.y + oy, s.color)
    end

    -- Draw Particles
    for _, p in ipairs(particles) do
        pix(p.x + ox, p.y + oy, p.color)
    end

    -- Draw Asteroids
    for _, a in ipairs(asteroids) do
        local num_v = #a.verts
        for j = 1, num_v do
            local next_idx = (j % num_v) + 1
            local v1 = a.verts[j]
            local v2 = a.verts[next_idx]

            -- Rotate local vertices
            local cos_r = math.cos(a.rot)
            local sin_r = math.sin(a.rot)

            local x1 = a.x + (v1.x * cos_r - v1.y * sin_r) + ox
            local y1 = a.y + (v1.x * sin_r + v1.y * cos_r) + oy
            local x2 = a.x + (v2.x * cos_r - v2.y * sin_r) + ox
            local y2 = a.y + (v2.x * sin_r + v2.y * cos_r) + oy

            line(x1, y1, x2, y2, 15)
        end
    end

    -- Draw Bullets
    for _, b in ipairs(bullets) do
        circ(b.x + ox, b.y + oy, 1, 11)
    end

    -- Draw Player
    if (game_state == "play" or game_state == "title") and (player.invuln % 6 < 3) then
        local nose_x = player.x + math.cos(player.angle) * 7 + ox
        local nose_y = player.y + math.sin(player.angle) * 7 + oy

        local left_wing_x = player.x + math.cos(player.angle + 2.5) * 6 + ox
        local left_wing_y = player.y + math.sin(player.angle + 2.5) * 6 + oy

        local right_wing_x = player.x + math.cos(player.angle - 2.5) * 6 + ox
        local right_wing_y = player.y + math.sin(player.angle - 2.5) * 6 + oy

        line(nose_x, nose_y, left_wing_x, left_wing_y, 12)
        line(nose_x, nose_y, right_wing_x, right_wing_y, 12)
        line(left_wing_x, left_wing_y, player.x + ox, player.y + oy, 12)
        line(right_wing_x, right_wing_y, player.x + ox, player.y + oy, 12)

        -- Shield bubble effect if invulnerable
        if player.invuln > 0 then
            circb(player.x + ox, player.y + oy, 8, 8)
        end
    end

    -- HUD / UI
    if game_state == "play" then
        print(string.format("SCORE %05d", player.score), 4, 4, 15, false, 1)
        print("WAVE " .. wave, 110, 4, 6, false, 1)

        -- Draw lives icons
        for l = 1, player.lives do
            local lx = 205 + l * 8
            line(lx, 4, lx - 2, 9, 11)
            line(lx, 4, lx + 2, 9, 11)
            line(lx - 2, 9, lx + 2, 9, 11)
        end

        -- Hyper-warp status
        if player.warp_cooldown == 0 then
            print("WARP [X]", 4, 126, 11, false, 1)
        end
    elseif game_state == "title" then
        print("VOID DRIFTER", 76, 40, 12, true, 2)
        print("A RETRO ASTEROIDS SURVIVAL GAME", 36, 62, 15, false, 1)
        print("UP: Thrust   LEFT/RIGHT: Rotate", 42, 82, 9, false, 1)
        print("Z / Button A: Shoot   X: Warp", 50, 92, 9, false, 1)

        if math.floor(time() / 500) % 2 == 0 then
            print("PRESS Z TO START", 76, 112, 11, false, 1)
        end
    elseif game_state == "gameover" then
        print("GAME OVER", 84, 45, 6, true, 2)
        print(string.format("FINAL SCORE: %d", player.score), 76, 70, 15, false, 1)
        print(string.format("WAVE REACHED: %d", wave), 78, 82, 14, false, 1)
        if math.floor(time() / 500) % 2 == 0 then
            print("PRESS Z TO TRY AGAIN", 64, 105, 11, false, 1)
        end
    end
end
