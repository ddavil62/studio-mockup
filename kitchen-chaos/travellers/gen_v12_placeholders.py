"""
V12 4분면 레이아웃용 추가 PIL placeholder 생성.
AD 검수(2026-04-23) 결과 반영:
- table_vertical: 50x80 -> 44x72
- bench_vertical: 14x70 -> 14x76 (6석 수용)
- counter_vertical: 24x120 -> 40x100 (가로 확장, 작업면 강조)
"""
from PIL import Image, ImageDraw

OUT = "."

def save(img, name):
    img.save(f"{OUT}/{name}.png")
    print(f"saved {name}.png ({img.size})")

# 세로 테이블 V12 (44x72, 갈색 나무)
img = Image.new("RGBA", (44, 72), (0, 0, 0, 0))
d = ImageDraw.Draw(img)
d.rectangle((2, 4, 41, 67), fill=(120, 80, 50, 255), outline=(70, 45, 25, 255))
d.rectangle((6, 8, 37, 62), fill=(140, 100, 60, 255))
# 나뭇결 라인
for y in range(14, 62, 12):
    d.line((6, y, 37, y), fill=(95, 65, 35, 255), width=1)
save(img, "table_vertical_v12")

# 세로 좌측 벤치 V12 (14x76)
img = Image.new("RGBA", (14, 76), (0, 0, 0, 0))
d = ImageDraw.Draw(img)
d.rectangle((1, 2, 12, 73), fill=(85, 55, 30, 255), outline=(50, 30, 15, 255))
d.rectangle((3, 4, 10, 71), fill=(100, 70, 40, 255))
save(img, "bench_vertical_l_v12")

# 세로 우측 벤치 V12 (14x76, 동일)
save(img, "bench_vertical_r_v12")

# 카운터 V12 (40x100, 가로 확장 작업면 강조)
img = Image.new("RGBA", (40, 100), (0, 0, 0, 0))
d = ImageDraw.Draw(img)
d.rectangle((2, 2, 37, 97), fill=(110, 75, 45, 255), outline=(60, 40, 20, 255))
d.rectangle((4, 4, 35, 95), fill=(135, 95, 55, 255))
# 카운터 위 접시 2개 (가로 배치 가능)
d.ellipse((6, 14, 18, 26), fill=(230, 220, 200, 255), outline=(150, 140, 120, 255))
d.ellipse((22, 14, 34, 26), fill=(230, 220, 200, 255), outline=(150, 140, 120, 255))
d.ellipse((6, 50, 18, 62), fill=(230, 220, 200, 255), outline=(150, 140, 120, 255))
d.ellipse((22, 50, 34, 62), fill=(230, 220, 200, 255), outline=(150, 140, 120, 255))
# 분할선
d.line((20, 4, 20, 95), fill=(70, 50, 25, 255), width=1)
save(img, "counter_v12")

# 입구 (32x40, 어둡게 빈 출입구)
img = Image.new("RGBA", (32, 40), (0, 0, 0, 0))
d = ImageDraw.Draw(img)
# 문 프레임
d.rectangle((0, 0, 31, 39), fill=(60, 40, 20, 255), outline=(30, 20, 10, 255))
# 문 안쪽 (어두운 빈 공간 = 밖)
d.rectangle((4, 6, 27, 37), fill=(20, 18, 30, 255))
# 문 위 간판 점
d.rectangle((10, 2, 21, 5), fill=(180, 140, 60, 255))
save(img, "entrance_v12")

print("done")
