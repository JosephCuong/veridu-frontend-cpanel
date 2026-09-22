import os
from PIL import Image, ImageDraw, ImageFont, ImageFilter

def draw_star(draw, x, y, r, fill):
    """Draw an elegant 4-point golden star"""
    points = [
        (x, y - r),
        (x + r * 0.28, y - r * 0.28),
        (x + r, y),
        (x + r * 0.28, y + r * 0.28),
        (x, y + r),
        (x - r * 0.28, y + r * 0.28),
        (x - r, y),
        (x - r * 0.28, y - r * 0.28),
    ]
    draw.polygon(points, fill=fill)

def draw_cross(draw, x, y, size, fill):
    """Draw a clean Christian cross"""
    draw.line([x, y - size, x, y + size], fill=fill, width=2)
    draw.line([x - int(size * 0.65), y - int(size * 0.25), x + int(size * 0.65), y - int(size * 0.25)], fill=fill, width=2)

def create_og_image():
    W, H = 1200, 630
    img = Image.new("RGBA", (W, H), (2, 6, 23, 255)) # #020617 base
    
    # 1. Warm radial gold & ember illumination behind logo
    glow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    glow_draw = ImageDraw.Draw(glow)
    cx, cy = W // 2, 220
    for r in range(480, 0, -6):
        alpha = int(48 * (1 - r / 480))
        glow_draw.ellipse(
            [cx - r * 1.35, cy - r * 0.85, cx + r * 1.35, cy + r * 0.85],
            fill=(217, 119, 6, alpha) # amber-600 warm liturgical gold
        )
    glow = glow.filter(ImageFilter.GaussianBlur(32))
    img = Image.alpha_composite(img, glow)
    
    draw = ImageDraw.Draw(img)
    
    # 2. Liturgical double frame
    draw.rounded_rectangle([20, 20, W - 20, H - 20], radius=24, outline=(245, 158, 11, 75), width=1)
    draw.rounded_rectangle([32, 32, W - 32, H - 32], radius=16, outline=(245, 158, 11, 150), width=2)
    
    # Corner decorative crosses
    corners = [(44, 44), (W - 44, 44), (44, H - 44), (W - 44, H - 44)]
    for x, y in corners:
        draw_cross(draw, x, y, 9, (251, 191, 36, 220))
    
    # 3. Fonts
    font_path_serif_b = "C:/Windows/Fonts/timesbd.ttf"
    font_path_serif = "C:/Windows/Fonts/times.ttf"
    font_path_sans_b = "C:/Windows/Fonts/arialbd.ttf"
    font_path_sans = "C:/Windows/Fonts/arial.ttf"
    
    font_motto = ImageFont.truetype(font_path_serif_b, 16)
    font_title = ImageFont.truetype(font_path_serif_b, 33)
    font_sub = ImageFont.truetype(font_path_serif, 20)
    font_pill = ImageFont.truetype(font_path_sans_b, 14)
    font_footer = ImageFont.truetype(font_path_serif_b, 16)
    
    # 4. Top Motto with drawn golden stars
    motto = "V I A   ·   V I T A   ·   V E R I T A S"
    bbox_m = draw.textbbox((0, 0), motto, font=font_motto)
    mw = bbox_m[2] - bbox_m[0]
    mx = (W - mw) // 2
    my = 58
    draw.text((mx, my), motto, fill=(251, 191, 36, 230), font=font_motto)
    # Flanking stars
    draw_star(draw, mx - 28, my + 9, 8, (251, 191, 36, 230))
    draw_star(draw, mx + mw + 28, my + 9, 8, (251, 191, 36, 230))
    
    # 5. VERIDU Logo
    logo_path = "public/images/veridu_logo_light.png"
    if os.path.exists(logo_path):
        logo = Image.open(logo_path).convert("RGBA")
        target_w = 380
        aspect = logo.height / logo.width
        target_h = int(target_w * aspect)
        logo = logo.resize((target_w, target_h), Image.Resampling.LANCZOS)
        lx = (W - target_w) // 2
        ly = 110
        img.paste(logo, (lx, ly), logo)
    
    # 6. Main Title
    title = "NỀN TẢNG HỌC TẬP, GIÁO LÝ & KINH THÁNH CÔNG GIÁO"
    bbox_t = draw.textbbox((0, 0), title, font=font_title)
    tw = bbox_t[2] - bbox_t[0]
    draw.text(((W - tw) // 2, 255), title, fill=(254, 243, 199, 255), font=font_title)
    
    # 7. Subtitle / Mission Statement
    sub = "Khảo Cứu Thánh Kinh  •  Giáo Lý CCC Toàn Thư  •  Lịch Sử Cứu Độ  •  Đấu Trường Đức Tin"
    bbox_s = draw.textbbox((0, 0), sub, font=font_sub)
    sw = bbox_s[2] - bbox_s[0]
    draw.text(((W - sw) // 2, 312), sub, fill=(203, 213, 225, 230), font=font_sub)
    
    # 8. 4 Feature Pills with crisp icons
    features = [
        ("cross", "Kinh Thánh 73 Sách"),
        ("star", "Giáo Lý 2865 Điều"),
        ("star", "Bản Đồ 3D Thánh Kinh"),
        ("star", "Đấu Trường Tri Thức")
    ]
    pill_y = 390
    pill_h = 44
    pill_icon_space = 28
    pill_padding = 22
    
    pill_widths = []
    for icon_type, f_text in features:
        bbox = draw.textbbox((0, 0), f_text, font=font_pill)
        pill_widths.append(bbox[2] - bbox[0] + pill_padding * 2 + pill_icon_space)
    
    gap = 16
    total_pills_w = sum(pill_widths) + gap * (len(features) - 1)
    start_x = (W - total_pills_w) // 2
    
    curr_x = start_x
    for i, (icon_type, f_text) in enumerate(features):
        pw = pill_widths[i]
        # Pill background
        draw.rounded_rectangle(
            [curr_x, pill_y, curr_x + pw, pill_y + pill_h],
            radius=14,
            fill=(15, 23, 42, 210), # slate-900/80
            outline=(245, 158, 11, 100),
            width=1
        )
        # Draw icon
        icon_cx = curr_x + pill_padding + 7
        icon_cy = pill_y + pill_h // 2
        if icon_type == "cross":
            draw_cross(draw, icon_cx, icon_cy, 7, (251, 191, 36, 240))
        else:
            draw_star(draw, icon_cx, icon_cy, 6, (251, 191, 36, 240))
            
        # Draw text
        bbox = draw.textbbox((0, 0), f_text, font=font_pill)
        fh = bbox[3] - bbox[1]
        text_x = curr_x + pill_padding + pill_icon_space
        text_y = pill_y + (pill_h - fh) // 2 - 2
        draw.text((text_x, text_y), f_text, fill=(251, 191, 36, 240), font=font_pill)
        curr_x += pw + gap
        
    # 9. Bottom Brand Badge with exact format: * THAPGIA.COM - VERIDU *
    footer_text = "THAPGIA.COM   —   VERIDU"
    bbox_f = draw.textbbox((0, 0), footer_text, font=font_footer)
    fw = bbox_f[2] - bbox_f[0]
    fh = bbox_f[3] - bbox_f[1]
    badge_w = fw + 80
    badge_h = 40
    badge_x = (W - badge_w) // 2
    badge_y = 490
    
    draw.rounded_rectangle(
        [badge_x, badge_y, badge_x + badge_w, badge_y + badge_h],
        radius=20,
        fill=(217, 119, 6, 45), # amber-600 gold glow
        outline=(245, 158, 11, 180),
        width=2
    )
    # Flanking stars in badge
    draw_star(draw, badge_x + 24, badge_y + badge_h // 2, 6, (251, 191, 36, 255))
    draw_star(draw, badge_x + badge_w - 24, badge_y + badge_h // 2, 6, (251, 191, 36, 255))
    
    draw.text(
        ((W - fw) // 2, badge_y + (badge_h - fh) // 2 - 2),
        footer_text,
        fill=(251, 191, 36, 255),
        font=font_footer
    )
    
    # 10. Save high-res JPEG
    os.makedirs("public/images", exist_ok=True)
    out_path = "public/images/og-default.jpg"
    final_rgb = img.convert("RGB")
    final_rgb.save(out_path, "JPEG", quality=95, optimize=True)
    print(f"Successfully generated clean branded OG image: {out_path} ({os.path.getsize(out_path)} bytes)")

if __name__ == "__main__":
    create_og_image()
